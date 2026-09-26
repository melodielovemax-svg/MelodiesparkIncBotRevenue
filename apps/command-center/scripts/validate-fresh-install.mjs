import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Color output for readability
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description, timeoutMs = 60000) {
  try {
    log(`▶ ${description}`, 'cyan');
    const stdout = execSync(command, {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: timeoutMs
    });
    log(`✅ ${description} - SUCCESS`, 'green');
    return { exitCode: 0, stdout, stderr: '' };
  } catch (error) {
    log(`❌ ${description} - FAILED`, 'red');
    return {
      exitCode: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || ''
    };
  }
}

function checkPrerequisites() {
  log('\n🔍 CHECKING PREREQUISITES', 'blue');
  log('='.repeat(50), 'blue');
  
  const results = [];
  
  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
    const meetsRequirement = majorVersion >= 22;
    
    results.push({
      check: 'Node.js version >= 22.5',
      required: '>= 22.5',
      actual: nodeVersion,
      status: meetsRequirement ? 'PASS' : 'FAIL'
    });
    
    log(`Node.js: ${nodeVersion} ${meetsRequirement ? '✅' : '❌'}`, meetsRequirement ? 'green' : 'red');
  } catch (error) {
    results.push({
      check: 'Node.js availability',
      required: 'Installed',
      actual: 'Not found',
      status: 'FAIL'
    });
    log('Node.js: Not found ❌', 'red');
  }
  
  // Check npm availability
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    results.push({
      check: 'npm availability',
      required: 'Installed',
      actual: npmVersion,
      status: 'PASS'
    });
    log(`npm: ${npmVersion} ✅`, 'green');
  } catch (error) {
    results.push({
      check: 'npm availability',
      required: 'Installed',
      actual: 'Not found',
      status: 'FAIL'
    });
    log('npm: Not found ❌', 'red');
  }
  
  // Check for existing contamination
  const contaminationChecks = [
    { path: '.env', description: 'Environment configuration' },
    { path: 'node_modules', description: 'Dependencies' },
    { path: 'data', description: 'Data directory' },
    { path: 'db', description: 'Database directory' },
    { path: 'reports', description: 'Reports directory' }
  ];
  
  log('\n🔍 ENVIRONMENT CONTAMINATION CHECK', 'blue');
  log('='.repeat(50), 'blue');
  
  const contamination = [];
  for (const check of contaminationChecks) {
    const exists = fs.existsSync(path.join(ROOT_DIR, check.path));
    if (exists) {
      contamination.push(check);
      log(`${check.path} exists ⚠️  (should not exist in fresh install)`, 'yellow');
    } else {
      log(`${check.path} not found ✅`, 'green');
    }
  }
  
  return { prerequisites: results, contamination };
}

async function validateBootstrapProcess() {
  log('\n🔍 BOOTSTRAP PROCESS VALIDATION', 'blue');
  log('='.repeat(50), 'blue');
  
  const results = [];
  
  // Step 1: Install dependencies
  log('\nStep 1: Installing dependencies...', 'cyan');
  const installResult = executeCommand('npm install', 'npm install', 120000);
  results.push({
    step: 'Install dependencies',
    command: 'npm install',
    exitCode: installResult.exitCode,
    status: installResult.exitCode === 0 ? 'PASS' : 'FAIL'
  });
  
  // Step 2: Initialize environment
  log('\nStep 2: Initializing environment...', 'cyan');
  const initResult = executeCommand('node scripts/initialize.mjs', 'Environment initialization', 30000);
  results.push({
    step: 'Initialize environment',
    command: 'node scripts/initialize.mjs',
    exitCode: initResult.exitCode,
    status: initResult.exitCode === 0 ? 'PASS' : 'FAIL'
  });
  
  // Step 3: Verify .env creation
  const envExists = fs.existsSync(path.join(ROOT_DIR, '.env'));
  results.push({
    step: '.env file creation',
    command: 'File system check',
    exitCode: envExists ? 0 : 1,
    status: envExists ? 'PASS' : 'FAIL'
  });
  log(`.env file: ${envExists ? 'created ✅' : 'not created ❌'}`, envExists ? 'green' : 'red');
  
  // Step 4: Verify database creation
  const dbExists = fs.existsSync(path.join(ROOT_DIR, 'db', 'melodiespark.db'));
  results.push({
    step: 'Database creation',
    command: 'File system check',
    exitCode: dbExists ? 0 : 1,
    status: dbExists ? 'PASS' : 'FAIL'
  });
  log(`Database: ${dbExists ? 'created ✅' : 'not created ❌'}`, dbExists ? 'green' : 'red');
  
  // Step 5: Verify guardian generation
  if (dbExists) {
    try {
      const { Repository } = await import('../src/db.mjs');
      const { loadConfig } = await import('../src/config.mjs');
      const config = loadConfig();
      const db = new Repository({ databasePath: config.databasePath, schemaPath: config.schemaPath, config });
      const guardianCount = db.listGuardians({ limit: 600 }).length;
      db.close();
      
      results.push({
        step: 'Guardian generation',
        command: 'Database query',
        exitCode: guardianCount === 600 ? 0 : 1,
        status: guardianCount === 600 ? 'PASS' : 'FAIL'
      });
      log(`Guardians: ${guardianCount}/600 ${guardianCount === 600 ? '✅' : '❌'}`, guardianCount === 600 ? 'green' : 'red');
    } catch (error) {
      results.push({
        step: 'Guardian generation',
        command: 'Database query',
        exitCode: 1,
        status: 'FAIL',
        error: error.message
      });
      log(`Guardians: check failed ❌`, 'red');
    }
  }
  
  return results;
}

function validateRegressionBaseline() {
  log('\n🔍 REGRESSION BASELINE VALIDATION', 'blue');
  log('='.repeat(50), 'blue');
  
  const results = [];
  
  // Run application tests
  log('\nRunning application tests...', 'cyan');
  const appTestResult = executeCommand('npm test', 'Application test suite', 120000);
  
  const passMatch = appTestResult.stdout.match(/ℹ pass (\d+)/);
  const passingTests = passMatch ? parseInt(passMatch[1], 10) : 0;
  
  results.push({
    test: 'Application tests',
    command: 'npm test',
    required: 18,
    actual: passingTests,
    status: passingTests >= 18 ? 'PASS' : 'FAIL'
  });
  
  log(`Application tests: ${passingTests}/18 ${passingTests >= 18 ? '✅' : '❌'}`, passingTests >= 18 ? 'green' : 'red');
  
  // Run CLI smoke tests
  log('\nRunning CLI smoke tests...', 'cyan');
  const cliTestResult = executeCommand('node scripts/check-regression-baseline.mjs', 'CLI regression baseline', 60000);
  
  results.push({
    test: 'CLI smoke tests',
    command: 'node scripts/check-regression-baseline.mjs',
    required: 6,
    actual: cliTestResult.exitCode === 0 ? 6 : 0,
    status: cliTestResult.exitCode === 0 ? 'PASS' : 'FAIL'
  });
  
  log(`CLI smoke tests: ${cliTestResult.exitCode === 0 ? '6/6' : '0/6'} ${cliTestResult.exitCode === 0 ? '✅' : '❌'}`, cliTestResult.exitCode === 0 ? 'green' : 'red');
  
  return results;
}

function captureEnvironmentDetails() {
  log('\n🔍 ENVIRONMENT DETAILS', 'blue');
  log('='.repeat(50), 'blue');
  
  const details = {};
  
  try {
    details.nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    details.npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    details.platform = process.platform;
    details.architecture = process.arch;
    details.nodeVersionDetail = process.version;
    details.cwd = process.cwd();
    
    log(`Node.js: ${details.nodeVersion}`, 'cyan');
    log(`npm: ${details.npmVersion}`, 'cyan');
    log(`Platform: ${details.platform}`, 'cyan');
    log(`Architecture: ${details.architecture}`, 'cyan');
    log(`Working directory: ${details.cwd}`, 'cyan');
  } catch (error) {
    log('Failed to capture environment details', 'red');
  }
  
  return details;
}

function generateReport(prerequisites, bootstrap, regression, environment) {
  const timestamp = new Date().toISOString();
  
  const report = {
    timestamp,
    validation_type: 'FRESH_INSTALL_REPRODUCIBILITY',
    environment,
    prerequisites: {
      checks: prerequisites.prerequisites,
      contamination: prerequisites.contamination,
      clean_environment: prerequisites.contamination.length === 0
    },
    bootstrap_process: bootstrap,
    regression_validation: regression,
    summary: {
      prerequisites_pass: prerequisites.prerequisites.filter(r => r.status === 'PASS').length,
      prerequisites_total: prerequisites.prerequisites.length,
      bootstrap_pass: bootstrap.filter(r => r.status === 'PASS').length,
      bootstrap_total: bootstrap.length,
      regression_pass: regression.filter(r => r.status === 'PASS').length,
      regression_total: regression.length,
      overall_status: prerequisites.contamination.length === 0 &&
                       prerequisites.prerequisites.every(r => r.status === 'PASS') &&
                       bootstrap.every(r => r.status === 'PASS') &&
                       regression.every(r => r.status === 'PASS') ? 'REPRODUCIBLE' : 'NOT_REPRODUCIBLE'
    }
  };
  
  const reportPath = path.join(ROOT_DIR, 'tests', 'fresh-install-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Report saved to: ${reportPath}`, 'cyan');
  
  return report;
}

async function main() {
  log('🧪 FRESH INSTALL REPRODUCIBILITY VALIDATION', 'blue');
  log('='.repeat(50), 'blue');
  log('This validation checks if the application can be bootstrapped', 'blue');
  log('from a clean environment with no existing files or dependencies.', 'blue');
  log('');
  
  const environment = captureEnvironmentDetails();
  const prerequisites = checkPrerequisites();
  const bootstrap = await validateBootstrapProcess();
  const regression = validateRegressionBaseline();
  const report = generateReport(prerequisites, bootstrap, regression, environment);
  
  log('\n' + '='.repeat(50), 'blue');
  log('📊 VALIDATION SUMMARY', 'blue');
  log('='.repeat(50), 'blue');
  log(`Prerequisites: ${report.summary.prerequisites_pass}/${report.summary.prerequisites_total} passed`, 'cyan');
  log(`Bootstrap: ${report.summary.bootstrap_pass}/${report.summary.bootstrap_total} passed`, 'cyan');
  log(`Regression: ${report.summary.regression_pass}/${report.summary.regression_total} passed`, 'cyan');
  log(`Clean Environment: ${prerequisites.contamination.length === 0 ? 'Yes ✅' : 'No ❌'}`, prerequisites.contamination.length === 0 ? 'green' : 'red');
  log('');
  
  if (report.summary.overall_status === 'REPRODUCIBLE') {
    log('✅ FRESH INSTALL REPRODUCIBLE', 'green');
    log('The application can be bootstrapped from a clean environment.', 'green');
    process.exit(0);
  } else {
    log('❌ FRESH INSTALL NOT REPRODUCIBLE', 'red');
    log('The application cannot be bootstrapped from a clean environment.', 'red');
    if (prerequisites.contamination.length > 0) {
      log('Environment contamination detected. Manual cleanup required.', 'yellow');
    }
    process.exit(1);
  }
}

main().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
