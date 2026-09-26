import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const BASELINE_PATH = path.join(ROOT_DIR, 'tests', 'regression-baseline.json');

function executeCommand(command, timeoutMs = 60000) {
  try {
    const stdout = execSync(command, {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: timeoutMs
    });
    return { exitCode: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      exitCode: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || ''
    };
  }
}

function checkOutputIncludes(output, requiredStrings) {
  const outputLower = output.toLowerCase();
  return requiredStrings.every(str => 
    outputLower.includes(str.toLowerCase())
  );
}

async function runApplicationTests() {
  console.log('🧪 Running Application Tests...\n');
  
  try {
    const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    const appTests = baseline.applicationTests;
    
    if (!appTests || !appTests.files) {
      console.log('⚠️  No application tests defined in baseline');
      return { passed: 0, total: 0, results: [] };
    }
    
    console.log(`Running: npm test`);
    const result = executeCommand('npm test', 120000);
    
    if (result.exitCode !== 0) {
      console.log(`❌ Application tests failed`);
      console.log(`STDERR: ${result.stderr.substring(0, 500)}`);
      return { passed: 0, total: 1, results: [{ name: 'Application Test Suite', passed: false, output: result.stderr }] };
    }
    
    // Parse test output to count passing tests
    const passMatch = result.stdout.match(/ℹ pass (\d+)/);
    const passingTests = passMatch ? parseInt(passMatch[1], 10) : 0;
    console.log(`✅ Application tests completed. Passing: ${passingTests}/${appTests.minimumPassingTests} required`);
    
    const passed = passingTests >= appTests.minimumPassingTests ? 1 : 0;
    
    return { 
      passed, 
      total: 1, 
      results: [{ name: 'Application Test Suite', passed: passed === 1, output: result.stdout, passingTests, required: appTests.minimumPassingTests }]
    };
    
  } catch (error) {
    console.log(`❌ Failed to run application tests: ${error.message}`);
    return { passed: 0, total: 1, results: [{ name: 'Application Test Suite', passed: false, error: error.message }] };
  }
}

async function runCLISmokeTests() {
  console.log('\n🚀 Running CLI Smoke Tests...\n');
  
  try {
    const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    const cliTests = baseline.cliSmokeTests || [];
    
    if (cliTests.length === 0) {
      console.log('⚠️  No CLI smoke tests defined in baseline');
      return { passed: 0, total: 0, results: [] };
    }
    
    const results = [];
    let passed = 0;
    
    for (const test of cliTests) {
      console.log(`Testing: ${test.name}`);
      const args = test.args.join(' ');
      const command = `node scripts/run-safe-cycle.mjs ${args}`;
      
      const result = executeCommand(command, 30000);
      const output = result.stdout + result.stderr;
      
      const outputMatches = checkOutputIncludes(output, test.outputIncludes);
      const exitCodeMatches = result.exitCode === test.expectedExitCode;
      
      const testPassed = exitCodeMatches && outputMatches;
      
      if (testPassed) {
        console.log(`  ✅ PASS`);
        passed++;
      } else {
        console.log(`  ❌ FAIL`);
        if (!exitCodeMatches) {
          console.log(`     Exit code: ${result.exitCode} (expected: ${test.expectedExitCode})`);
        }
        if (!outputMatches) {
          console.log(`     Missing output: ${test.outputIncludes.filter(s => !output.toLowerCase().includes(s.toLowerCase())).join(', ')}`);
        }
      }
      
      results.push({
        name: test.name,
        passed: testPassed,
        exitCode: result.exitCode,
        expectedExitCode: test.expectedExitCode,
        outputMatches,
        requiredOutput: test.outputIncludes
      });
    }
    
    return { passed, total: cliTests.length, results };
    
  } catch (error) {
    console.log(`❌ Failed to run CLI smoke tests: ${error.message}`);
    return { passed: 0, total: 0, results: [{ name: 'CLI Smoke Tests', passed: false, error: error.message }] };
  }
}

async function generateReport(appResults, cliResults) {
  const totalPassed = appResults.passed + cliResults.passed;
  const totalTests = appResults.total + cliResults.total;
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0;
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      applicationTests: appResults,
      cliSmokeTests: cliResults,
      overall: {
        passed: totalPassed,
        total: totalTests,
        passRate: `${passRate}%`
      }
    },
    results: {
      application: appResults.results,
      cli: cliResults.results
    }
  };
  
  const reportPath = path.join(ROOT_DIR, 'tests', 'regression-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  console.log('📊 MELODIESPARK REGRESSION BASELINE CHECK');
  console.log('='.repeat(50));
  console.log('');
  
  if (!fs.existsSync(BASELINE_PATH)) {
    console.log(`❌ Baseline file not found: ${BASELINE_PATH}`);
    process.exit(1);
  }
  
  const appResults = await runApplicationTests();
  const cliResults = await runCLISmokeTests();
  const report = await generateReport(appResults, cliResults);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 REGRESSION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Application Tests: ${appResults.passed}/${appResults.total} passed`);
  console.log(`CLI Smoke Tests: ${cliResults.passed}/${cliResults.total} passed`);
  console.log(`Overall: ${report.summary.overall.passed}/${report.summary.overall.total} (${report.summary.overall.passRate})`);
  console.log('');
  
  if (report.summary.overall.passed === report.summary.overall.total) {
    console.log('✅ ALL REGRESSION TESTS PASSED');
    process.exit(0);
  } else {
    console.log('⚠️  SOME REGRESSION TESTS FAILED');
    process.exit(1);
  }
}

main();
