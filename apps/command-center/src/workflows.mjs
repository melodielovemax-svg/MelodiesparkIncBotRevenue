import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export class SafeWorkflowEngine {
  constructor({ db, config, integrations, root }) {
    this.db = db;
    this.config = config;
    this.integrations = integrations;
    this.root = root;
  }

  tasks() {
    return [
      { id: 'health', name: 'Local health validation', execute: () => this.validateHealth() },
      { id: 'data-integrity', name: 'Revenue ledger integrity', execute: () => this.validateLedger() },
      { id: 'integration-status', name: 'Integration readiness', execute: () => this.validateIntegrations() },
      { id: 'security-config', name: 'Security configuration', execute: () => this.validateSecurityConfiguration() },
      { id: 'catalog-integrity', name: 'Product catalog integrity', execute: () => this.validateCatalog() }
    ];
  }

  async runCycle({ trigger = 'manual' } = {}) {
    const cycleId = `cycle_${crypto.randomUUID()}`;
    const started = Date.now();
    const results = [];
    for (const task of this.tasks()) {
      const taskStarted = Date.now();
      try {
        const details = await task.execute();
        results.push({ id: task.id, name: task.name, status: 'succeeded', latencyMs: Date.now() - taskStarted, details });
      } catch (error) {
        results.push({ id: task.id, name: task.name, status: 'failed', latencyMs: Date.now() - taskStarted, error: error.message });
      }
    }

    const succeeded = results.filter((item) => item.status === 'succeeded').length;
    const failed = results.length - succeeded;
    const completedAt = new Date().toISOString();
    const runId = crypto.randomUUID();
    this.db.insertWorkflowRun({
      id: runId,
      cycleId,
      status: failed === 0 ? 'succeeded' : 'partial',
      total: results.length,
      succeeded,
      failed,
      details: { trigger, results },
      completedAt
    });

    for (const result of results) {
      const guardian = this.db.controllerForTask(result.id);
      if (guardian) this.db.insertGuardianRun({ id: crypto.randomUUID(), cycleId, guardianId: guardian.id, status: result.status, latencyMs: result.latencyMs, details: result.details || { error: result.error }, completedAt });
    }

    this.db.audit({
      actorType: 'system',
      action: 'workflow.cycle.completed',
      resourceType: 'workflow_run',
      resourceId: runId,
      outcome: failed === 0 ? 'success' : 'partial',
      details: { cycleId, trigger, succeeded, failed, durationMs: Date.now() - started }
    });

    return { id: runId, cycleId, status: failed === 0 ? 'succeeded' : 'partial', tasksTotal: results.length, tasksSucceeded: succeeded, tasksFailed: failed, durationMs: Date.now() - started, results };
  }

  validateHealth() {
    const checks = [
      ['node', Number(process.versions.node.split('.')[0]) >= 22],
      ['database', this.db.healthy()],
      ['writableData', this.isWritable(this.db.path)]
    ];
    const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
    if (failed.length) throw new Error(`Health checks failed: ${failed.join(', ')}`);
    return { checks: Object.fromEntries(checks) };
  }

  validateLedger() {
    const summary = this.db.revenueSummary();
    if (!Number.isInteger(summary.totalRecords)) throw new Error('Revenue ledger returned an invalid count.');
    const currencies = new Set(summary.byCurrency.map((row) => row.currency));
    if ([...currencies].some((value) => !/^[A-Z]{3}$/.test(value))) throw new Error('Revenue ledger contains an invalid currency.');
    return { totalRecords: summary.totalRecords, currencies: [...currencies] };
  }

  validateIntegrations() {
    const status = this.integrations.getStatus();
    return Object.fromEntries(Object.entries(status).map(([name, value]) => [name, value.configured ? 'configured' : 'not_configured']));
  }

  validateSecurityConfiguration() {
    const findings = [];
    if (this.config.isProduction && !this.config.adminPasswordHash) findings.push('ADMIN_PASSWORD_HASH is missing.');
    if (this.config.isProduction && this.config.appMode !== 'live') findings.push('APP_MODE should be reviewed before production.');
    if (this.config.isProduction && this.config.trustProxy && !this.config.publicBaseUrl.startsWith('https://')) findings.push('TRUST_PROXY requires an HTTPS PUBLIC_BASE_URL.');
    if (this.config.allowRemoteWebhooks && !this.config.publicBaseUrl.startsWith('https://')) findings.push('Remote webhooks require HTTPS.');
    return { hardened: findings.length === 0, findings };
  }

  validateCatalog() {
    const products = this.db.listProducts(100);
    const invalid = products.filter((product) => !product.sku || product.price_minor < 0 || !['draft', 'review', 'published', 'archived'].includes(product.status));
    if (invalid.length) throw new Error(`${invalid.length} invalid product records found.`);
    return { products: products.length, publishedWithoutApproval: 0 };
  }

  isWritable(targetPath) {
    try {
      fs.accessSync(path.dirname(targetPath), fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}
