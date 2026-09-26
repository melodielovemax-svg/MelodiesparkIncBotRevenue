import { loadConfig } from '../src/config.mjs';
import { Repository } from '../src/db.mjs';

const command = process.argv[2] || 'cycle';
const config = loadConfig();
const db = new Repository({ databasePath: config.databasePath, schemaPath: config.schemaPath, config });

async function getIntegrationsAndWorkflows() {
  const { IntegrationManager } = await import('../src/integrations.mjs');
  const { SafeWorkflowEngine } = await import('../src/workflows.mjs');
  const integrations = new IntegrationManager({ db, config });
  const workflows = new SafeWorkflowEngine({ db, config, integrations, root: config.root });
  return { integrations, workflows };
}

async function handleProductSync() {
  console.log('[PRODUCT-SYNC] Synchronizing product drafts...');
  try {
    const products = db.listProducts(100);
    const draftCount = products.filter(p => p.status === 'draft').length;
    const publishedCount = products.filter(p => p.status === 'published').length;
    
    db.audit({
      actorType: 'system',
      action: 'product.sync',
      resourceType: 'product_catalog',
      outcome: 'success',
      details: { draftCount, publishedCount, totalProducts: products.length }
    });
    
    console.log(`[PRODUCT-SYNC] Success: ${products.length} products (${draftCount} drafts, ${publishedCount} published)`);
    return { status: 'success', draftCount, publishedCount, totalProducts: products.length };
  } catch (error) {
    db.audit({
      actorType: 'system',
      action: 'product.sync',
      resourceType: 'product_catalog',
      outcome: 'failure',
      details: { error: error.message }
    });
    throw error;
  }
}

async function handleWalletVerify() {
  console.log('[WALLET-VERIFY] EIP-191 challenge generation instructions...');
  console.log('[WALLET-VERIFY] Use the web interface at http://127.0.0.1:4173 for wallet verification.');
  console.log('[WALLET-VERIFY] Or call GET /api/wallet/challenge?address=YOUR_ADDRESS');
  
  db.audit({
    actorType: 'system',
    action: 'wallet.verify.initiated',
    resourceType: 'wallet',
    outcome: 'info',
    details: { message: 'CLI wallet verification instructions provided' }
  });
  
  return { status: 'info', message: 'Use web interface for wallet verification' };
}

async function handleTaskRun(taskId) {
  console.log(`[TASK-RUN] Executing task: ${taskId}`);
  
  const { workflows } = await getIntegrationsAndWorkflows();
  const validTasks = workflows.tasks().map(t => t.id);
  if (!validTasks.includes(taskId)) {
    throw new Error(`Invalid task ID: ${taskId}. Valid tasks: ${validTasks.join(', ')}`);
  }
  
  try {
    const task = workflows.tasks().find(t => t.id === taskId);
    const result = await task.execute();
    
    db.audit({
      actorType: 'system',
      action: 'task.executed',
      resourceType: 'task',
      resourceId: taskId,
      outcome: 'success',
      details: { result }
    });
    
    console.log(`[TASK-RUN] Success: ${task.name}`);
    return { status: 'success', taskId, taskName: task.name, result };
  } catch (error) {
    db.audit({
      actorType: 'system',
      action: 'task.executed',
      resourceType: 'task',
      resourceId: taskId,
      outcome: 'failure',
      details: { error: error.message }
    });
    throw error;
  }
}

async function handleRevReport() {
  console.log('[REV-REPORT] Generating revenue reconciliation report...');
  try {
    const summary = db.revenueSummary({ includeDemo: false });
    const recentRevenue = db.listRevenue({ limit: 20, includeDemo: false });
    const integrationRuns = db.latestIntegrationRun('stripe');
    const shopifyRuns = db.latestIntegrationRun('shopify');
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalRecords: summary.totalRecords,
        currencies: summary.byCurrency.map(c => ({
          currency: c.currency,
          records: c.records,
          settledMinor: c.settledMinor,
          grossMinor: c.grossMinor
        }))
      },
      recentTransactions: recentRevenue.length,
      integrationStatus: {
        stripe: integrationRuns ? { status: integrationRuns.status, lastRun: integrationRuns.completed_at } : 'not_configured',
        shopify: shopifyRuns ? { status: shopifyRuns.status, lastRun: shopifyRuns.completed_at } : 'not_configured'
      }
    };
    
    db.audit({
      actorType: 'system',
      action: 'revenue.report',
      resourceType: 'revenue',
      outcome: 'success',
      details: { totalRecords: summary.totalRecords }
    });
    
    console.log('[REV-REPORT] Revenue Reconciliation Report:');
    console.log(JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    db.audit({
      actorType: 'system',
      action: 'revenue.report',
      resourceType: 'revenue',
      outcome: 'failure',
      details: { error: error.message }
    });
    throw error;
  }
}

async function handleCycle() {
  const { workflows } = await getIntegrationsAndWorkflows();
  const cyclesArg = Number.parseInt(process.argv[3] || '1', 10);
  const continuous = process.argv.includes('--continuous');
  const intervalArg = Number.parseInt(process.argv.find((value) => value.startsWith('--interval='))?.split('=')[1] || '300', 10);
  const cycles = Number.isFinite(cyclesArg) ? Math.max(1, Math.min(10_000, cyclesArg)) : 1;
  const interval = Math.max(30, Math.min(86_400, Number.isFinite(intervalArg) ? intervalArg : 300));

  let stopping = false;
  process.on('SIGINT', () => { stopping = true; });
  try {
    let index = 0;
    do {
      const result = await workflows.runCycle({ trigger: 'powershell_safe_cycle' });
      console.log(JSON.stringify(result));
      index += 1;
      if ((continuous || index < cycles) && !stopping) await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } while (!stopping && (continuous || index < cycles));
  } finally {
    db.close();
  }
}

try {
  let result;
  switch (command) {
    case 'product-sync':
      result = await handleProductSync();
      console.log(JSON.stringify(result));
      break;
    case 'wallet-verify':
      result = await handleWalletVerify();
      console.log(JSON.stringify(result));
      break;
    case 'task-run':
      result = await handleTaskRun(process.argv[3]);
      console.log(JSON.stringify(result));
      break;
    case 'rev-report':
      result = await handleRevReport();
      break;
    case 'cycle':
      await handleCycle();
      break;
    default:
      // Handle numeric argument for backward compatibility
      const cyclesArg = Number.parseInt(command, 10);
      if (Number.isFinite(cyclesArg)) {
        process.argv[3] = command; // Move cycle count to position 3
        await handleCycle();
      } else {
        throw new Error(`Unknown command: ${command}`);
      }
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message }));
  process.exit(1);
} finally {
  // Only close database if it was actually opened
  const dbWasOpened = ['product-sync', 'wallet-verify', 'task-run', 'rev-report'].includes(command);
  if (dbWasOpened) db.close();
}
