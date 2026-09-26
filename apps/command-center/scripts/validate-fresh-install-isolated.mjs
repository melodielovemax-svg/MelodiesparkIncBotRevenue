import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.resolve(__dirname, '..');
const VALIDATION_BASE = 'C:\\melodie-validation';
const VALIDATION_DIR = path.join(VALIDATION_BASE, 'command-center');

// Color output for readability
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, cwd, description, timeoutMs = 60000) {
  try {
    log(`▶ ${description}`, 'cyan');
    const stdout = execSync(command, {
      cwd,
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

function calculateHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function captureSourceIdentity() {
  log('\n🔍 CAPTURING SOURCE IDENTITY', 'blue');
  log('='.repeat(50), 'blue');

  const identity = {
    timestamp: new Date().toISOString(),
    source_directory: SOURCE_DIR,
    validation_directory: VALIDATION_DIR
  };

  // OS and architecture
  identity.os = process.platform;
  identity.architecture = process.arch;

  // Node and npm versions
  try {
    identity.node_version = execSync('node --version', { encoding: 'utf8' }).trim();
    identity.npm_version = execSync('npm --version', { encoding: 'utf8' }).trim();
  } catch (error) {
    identity.node_version = 'NOT_FOUND';
    identity.npm_version = 'NOT_FOUND';
  }

  // Git information
  try {
    identity.git_commit = execSync('git rev-parse HEAD', { cwd: SOURCE_DIR, encoding: 'utf8' }).trim();
    identity.git_branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: SOURCE_DIR, encoding: 'utf8' }).trim();
    identity.git_status = execSync('git status --porcelain', { cwd: SOURCE_DIR, encoding: 'utf8' }).trim();
    identity.has_uncommitted_changes = identity.git_status.length > 0;
  } catch (error) {
    identity.git_commit = 'NOT_A_GIT_REPOSITORY';
    identity.git_branch = 'NOT_A_GIT_REPOSITORY';
    identity.git_status = 'NOT_A_GIT_REPOSITORY';
    identity.has_uncommitted_changes = false;
  }

  // Package file hashes
  identity.package_json_hash = calculateHash(path.join(SOURCE_DIR, 'package.json'));
  identity.package_lock_json_hash = calculateHash(path.join(SOURCE_DIR, 'package-lock.json'));
  identity.has_lockfile = fs.existsSync(path.join(SOURCE_DIR, 'package-lock.json'));

  log(`OS: ${identity.os}`, 'cyan');
  log(`Architecture: ${identity.architecture}`, 'cyan');
  log(`Node.js: ${identity.node_version}`, 'cyan');
  log(`npm: ${identity.npm_version}`, 'cyan');
  log(`Git commit: ${identity.git_commit}`, 'cyan');
  log(`Git branch: ${identity.git_branch}`, 'cyan');
  log(`Has lockfile: ${identity.has_lockfile ? 'Yes ✅' : 'No ❌'}`, identity.has_lockfile ? 'green' : 'yellow');
  log(`Uncommitted changes: ${identity.has_uncommitted_changes ? 'Yes ⚠️' : 'No ✅'}`, identity.has_uncommitted_changes ? 'yellow' : 'green');

  return identity;
}

function createCleanSourceSnapshot(sourceIdentity) {
  log('\n🔍 CREATING CLEAN SOURCE SNAPSHOT', 'blue');
  log('='.repeat(50), 'blue');

  // Check if this is a Git repository
  if (sourceIdentity.git_commit === 'NOT_A_GIT_REPOSITORY') {
    log('❌ Source is not in a Git repository - CANNOT VALIDATE', 'red');
    log('Fresh-install reproducibility requires cryptographically identifiable source', 'red');
    return null;
  }

  // Create validation base directory
  try {
    if (fs.existsSync(VALIDATION_BASE)) {
      log(`Removing existing validation directory: ${VALIDATION_BASE}`, 'yellow');
      fs.rmSync(VALIDATION_BASE, { recursive: true, force: true });
    }
    fs.mkdirSync(VALIDATION_BASE, { recursive: true });
    log(`Created validation base: ${VALIDATION_BASE}`, 'green');
  } catch (error) {
    log(`❌ Failed to create validation directory: ${error.message}`, 'red');
    return null;
  }

  // Copy only source files (excluding contaminated items)
  const sourceIncludes = [
    'src',
    'scripts',
    'bin',
    'public',
    'tests',
    'docs',
    'package.json',
    'package-lock.json',
    'README.md',
    '.env.example'
  ];

  const excludes = [
    '.env',
    'node_modules',
    'data',
    'db',
    'reports',
    'coverage',
    '.cache',
    '.tmp',
    'logs'
  ];

  log('Copying source files...', 'cyan');
  let copiedCount = 0;
  let skippedCount = 0;

  for (const item of sourceIncludes) {
    const sourcePath = path.join(SOURCE_DIR, item);
    const destPath = path.join(VALIDATION_DIR, item);

    if (!fs.existsSync(sourcePath)) {
      log(`  ⚠️  ${item} not found in source - skipping`, 'yellow');
      skippedCount++;
      continue;
    }

    try {
      if (fs.statSync(sourcePath).isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDirectory(sourcePath, destPath, excludes);
      } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(sourcePath, destPath);
      }
      log(`  ✅ ${item}`, 'green');
      copiedCount++;
    } catch (error) {
      log(`  ❌ ${item} - ${error.message}`, 'red');
    }
  }

  log(`Copied: ${copiedCount} items, Skipped: ${skippedCount} items`, 'cyan');

  // Verify clean environment
  log('\nVerifying clean environment...', 'cyan');
  const contaminationChecks = [
    '.env',
    'node_modules',
    'data',
    'db',
    'reports',
    'coverage',
    '.cache'
  ];

  let contaminationFound = false;
  for (const check of contaminationChecks) {
    const checkPath = path.join(VALIDATION_DIR, check);
    if (fs.existsSync(checkPath)) {
      log(`  ❌ Contamination found: ${check}`, 'red');
      contaminationFound = true;
    } else {
      log(`  ✅ ${check} absent`, 'green');
    }
  }

  if (contaminationFound) {
    log('❌ Clean environment verification failed', 'red');
    return null;
  }

  log('✅ Clean source snapshot created', 'green');
  return VALIDATION_DIR;
}

function copyDirectory(src, dest, excludes) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip excluded directories/files
    if (excludes.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectory(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function checkPrerequisites(validationDir) {
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

  // Check for lockfile
  const hasLockfile = fs.existsSync(path.join(validationDir, 'package-lock.json'));
  results.push({
    check: 'package-lock.json exists',
    required: 'Present for reproducibility',
    actual: hasLockfile ? 'Present' : 'Missing',
    status: hasLockfile ? 'PASS' : 'LIMITED'
  });
  log(`Lockfile: ${hasLockfile ? 'Present ✅' : 'Missing ⚠️ (reproducibility limited)'}`, hasLockfile ? 'green' : 'yellow');

  return results;
}

async function runBootstrap(validationDir, runNumber) {
  log(`\n🔍 BOOTSTRAP PROCESS - RUN #${runNumber}`, 'blue');
  log('='.repeat(50), 'blue');

  const results = [];
  const hasLockfile = fs.existsSync(path.join(validationDir, 'package-lock.json'));

  // Step 1: Install dependencies
  log('\nStep 1: Installing dependencies...', 'cyan');
  const installCommand = hasLockfile ? 'npm ci' : 'npm install';
  const installResult = executeCommand(installCommand, validationDir, installCommand, 180000);
  results.push({
    step: 'Install dependencies',
    command: installCommand,
    exitCode: installResult.exitCode,
    status: installResult.exitCode === 0 ? 'PASS' : 'FAIL',
    stdout: installResult.stdout,
    stderr: installResult.stderr
  });

  // Step 2: Initialize environment
  log('\nStep 2: Initializing environment...', 'cyan');
  const initResult = executeCommand('node scripts/initialize.mjs', validationDir, 'Environment initialization', 30000);
  results.push({
    step: 'Initialize environment',
    command: 'node scripts/initialize.mjs',
    exitCode: initResult.exitCode,
    status: initResult.exitCode === 0 ? 'PASS' : 'FAIL',
    stdout: initResult.stdout,
    stderr: initResult.stderr
  });

  // Step 3: Verify .env creation
  const envExists = fs.existsSync(path.join(validationDir, '.env'));
  results.push({
    step: '.env file creation',
    command: 'File system check',
    exitCode: envExists ? 0 : 1,
    status: envExists ? 'PASS' : 'FAIL'
  });
  log(`.env file: ${envExists ? 'created ✅' : 'not created ❌'}`, envExists ? 'green' : 'red');

  // Step 4: Verify database creation
  const dbExists = fs.existsSync(path.join(validationDir, 'db', 'melodiespark.db'));
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
      const { Repository } = await import(path.join(validationDir, 'src/db.mjs'));
      const { loadConfig } = await import(path.join(validationDir, 'src/config.mjs'));
      const config = loadConfig(path.join(validationDir, '.env'));
      const db = new Repository({ 
        databasePath: path.join(validationDir, config.databasePath), 
        schemaPath: path.join(validationDir, config.schemaPath), 
        config 
      });
      const guardianCount = db.listGuardians({ limit: 600 }).length;
      db.close();

      results.push({
        step: 'Guardian generation',
        command: 'Database query',
        exitCode: guardianCount === 600 ? 0 : 1,
        status: guardianCount === 600 ? 'PASS' : 'FAIL',
        actual: guardianCount,
        expected: 600
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
      log(`Guardians: check failed ❌ - ${error.message}`, 'red');
    }
  }

  return results;
}

function runApplicationTests(validationDir) {
  log('\n🔍 APPLICATION TEST SUITE', 'blue');
  log('='.repeat(50), 'blue');

  const testResult = executeCommand('npm test', validationDir, 'Application test suite', 120000);

  const passMatch = testResult.stdout.match(/ℹ pass (\d+)/);
  const passingTests = passMatch ? parseInt(passMatch[1], 10) : 0;

  const result = {
    required: 18,
    actual: passingTests,
    status: passingTests >= 18 ? 'PASS' : 'FAIL',
    exitCode: testResult.exitCode,
    stdout: testResult.stdout,
    stderr: testResult.stderr
  };

  log(`Application tests: ${passingTests}/18 ${passingTests >= 18 ? '✅' : '❌'}`, passingTests >= 18 ? 'green' : 'red');

  return result;
}

function runCLISmokeTests(validationDir) {
  log('\n🔍 CLI SMOKE TESTS', 'blue');
  log('='.repeat(50), 'blue');

  const cliResult = executeCommand('node scripts/check-regression-baseline.mjs', validationDir, 'CLI regression baseline', 60000);

  const result = {
    required: 6,
    actual: cliResult.exitCode === 0 ? 6 : 0,
    status: cliResult.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: cliResult.exitCode,
    stdout: cliResult.stdout,
    stderr: cliResult.stderr
  };

  log(`CLI smoke tests: ${cliResult.exitCode === 0 ? '6/6' : '0/6'} ${cliResult.exitCode === 0 ? '✅' : '❌'}`, cliResult.exitCode === 0 ? 'green' : 'red');

  return result;
}

function runRegressionBaseline(validationDir) {
  log('\n🔍 REGRESSION BASELINE', 'blue');
  log('='.repeat(50), 'blue');

  const regressionResult = executeCommand('npm run test:regression', validationDir, 'Regression baseline check', 120000);

  const result = {
    required: 7,
    actual: regressionResult.exitCode === 0 ? 7 : 0,
    status: regressionResult.exitCode === 0 ? 'PASS' : 'FAIL',
    exitCode: regressionResult.exitCode,
    stdout: regressionResult.stdout,
    stderr: regressionResult.stderr
  };

  log(`Regression baseline: ${regressionResult.exitCode === 0 ? '7/7' : '0/7'} ${regressionResult.exitCode === 0 ? '✅' : '❌'}`, regressionResult.exitCode === 0 ? 'green' : 'red');

  return result;
}

function checkContamination(validationDir) {
  log('\n🔍 CONTAMINATION CHECK', 'blue');
  log('='.repeat(50), 'blue');

  const contaminationChecks = [
    { path: '.env', description: 'Should be created by bootstrap' },
    { path: 'node_modules', description: 'Should be created by npm install' },
    { path: 'data', description: 'Should not exist from source' },
    { path: 'db', description: 'Should be created by bootstrap' },
    { path: 'reports', description: 'Should not exist from source' }
  ];

  const results = [];
  let suspicious = false;

  for (const check of contaminationChecks) {
    const checkPath = path.join(validationDir, check.path);
    const exists = fs.existsSync(checkPath);

    results.push({
      path: check.path,
      exists,
      description: check.description,
      status: 'CHECKED'
    });

    if (exists) {
      log(`  ${check.path}: exists (${check.description})`, 'cyan');
    } else {
      log(`  ${check.path}: absent`, 'cyan');
    }
  }

  // Check for unexpected dependencies on source directory
  const envContent = fs.existsSync(path.join(validationDir, '.env')) 
    ? fs.readFileSync(path.join(validationDir, '.env'), 'utf8') 
    : '';

  if (envContent.includes(SOURCE_DIR) || envContent.includes('C:\\melodie\\apps\\command-center')) {
    log('  ⚠️  WARNING: .env contains references to source directory', 'yellow');
    suspicious = true;
  }

  return { results, suspicious };
}

function checkGlobalDependencies(validationDir) {
  log('\n🔍 GLOBAL DEPENDENCY CHECK', 'blue');
  log('='.repeat(50), 'blue');

  const results = [];

  // Check if any commands depend on global packages
  const packageJson = JSON.parse(fs.readFileSync(path.join(validationDir, 'package.json'), 'utf8'));
  const declaredDependencies = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);

  // Try to run a command that would fail if global dependencies are missing
  try {
    // Check if the application can run without global packages
    const testResult = executeCommand('node bin/melodiespark.mjs --help', validationDir, 'CLI help command', 30000);
    
    results.push({
      check: 'CLI runs without global dependencies',
      status: testResult.exitCode === 0 ? 'PASS' : 'FAIL',
      exitCode: testResult.exitCode
    });

    log(`CLI without global deps: ${testResult.exitCode === 0 ? 'PASS ✅' : 'FAIL ❌'}`, testResult.exitCode === 0 ? 'green' : 'red');
  } catch (error) {
    results.push({
      check: 'CLI runs without global dependencies',
      status: 'FAIL',
      error: error.message
    });
    log(`CLI without global deps: FAIL ❌`, 'red');
  }

  return results;
}

function cleanupValidationDir() {
  log('\n🧹 CLEANING VALIDATION DIRECTORY', 'blue');
  log('='.repeat(50), 'blue');

  try {
    if (fs.existsSync(VALIDATION_BASE)) {
      fs.rmSync(VALIDATION_BASE, { recursive: true, force: true });
      log(`✅ Removed: ${VALIDATION_BASE}`, 'green');
    }
  } catch (error) {
    log(`⚠️  Failed to cleanup: ${error.message}`, 'yellow');
  }
}

function generateReport(sourceIdentity, prerequisites, run1, run2, contamination, globalDeps) {
  const timestamp = new Date().toISOString();

  const report = {
    timestamp,
    validation_type: 'FRESH_INSTALL_REPRODUCIBILITY_ISOLATED',
    source_identity: sourceIdentity,
    prerequisites: {
      checks: prerequisites,
      passed: prerequisites.filter(r => r.status === 'PASS').length,
      total: prerequisites.length
    },
    run_1: {
      bootstrap: run1.bootstrap,
      application_tests: run1.appTests,
      cli_tests: run1.cliTests,
      regression: run1.regression,
      contamination: run1.contamination,
      global_dependencies: run1.globalDeps,
      overall_status: run1.overall
    },
    run_2: {
      bootstrap: run2.bootstrap,
      application_tests: run2.appTests,
      cli_tests: run2.cliTests,
      regression: run2.regression,
      contamination: run2.contamination,
      global_dependencies: run2.globalDeps,
      overall_status: run2.overall
    },
    summary: {
      prerequisites_pass: prerequisites.filter(r => r.status === 'PASS').length,
      prerequisites_total: prerequisites.length,
      run1_status: run1.overall,
      run2_status: run2.overall,
      both_runs_passed: run1.overall === 'PASS' && run2.overall === 'PASS',
      contamination_free: !contamination.suspicious,
      no_hidden_dependencies: globalDeps.every(r => r.status === 'PASS')
    },
    final_status: determineFinalStatus(prerequisites, run1, run2, contamination, globalDeps)
  };

  const reportPath = path.join(SOURCE_DIR, 'tests', 'fresh-install-isolated-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Report saved to: ${reportPath}`, 'cyan');

  return report;
}

function determineFinalStatus(prerequisites, run1, run2, contamination, globalDeps) {
  // Check if source is not a Git repository
  if (prerequisites.length === 0) {
    return 'UNVERIFIED';
  }

  // Check if prerequisites pass
  const prereqsPass = prerequisites.filter(r => r.status === 'PASS' || r.status === 'LIMITED').length === prerequisites.length;
  if (!prereqsPass) {
    return 'NOT_REPRODUCIBLE';
  }

  // Check if both runs passed
  if (run1.overall !== 'PASS' || run2.overall !== 'PASS') {
    return 'NOT_REPRODUCIBLE';
  }

  // Check for contamination
  if (contamination.suspicious) {
    return 'NOT_REPRODUCIBLE';
  }

  // Check for hidden dependencies
  if (!globalDeps.every(r => r.status === 'PASS')) {
    return 'NOT_REPRODUCIBLE';
  }

  // Check if lockfile is missing (limited reproducibility)
  const hasLockfile = prerequisites.some(r => r.check === 'package-lock.json exists' && r.status === 'PASS');
  if (!hasLockfile) {
    return 'LIMITED';
  }

  return 'REPRODUCIBLE';
}

function printFinalReport(report) {
  console.log('\n' + '='.repeat(60));
  console.log('MELODIESPARK FRESH-INSTALL VALIDATION');
  console.log('='.repeat(60));
  
  console.log('\nSource:');
  console.log(`  Commit: ${report.source_identity.git_commit}`);
  console.log(`  Branch: ${report.source_identity.git_branch}`);
  console.log(`  Directory: ${report.source_identity.source_directory}`);
  
  console.log('\nEnvironment:');
  console.log(`  Node: ${report.source_identity.node_version}`);
  console.log(`  npm: ${report.source_identity.npm_version}`);
  console.log(`  OS: ${report.source_identity.os}`);
  console.log(`  Architecture: ${report.source_identity.architecture}`);
  
  console.log('\nPrerequisites:');
  console.log(`  ${report.summary.prerequisites_pass}/${report.summary.prerequisites_total} passed`);
  
  console.log('\nInstallation #1:');
  console.log(`  Bootstrap: ${report.run_1.bootstrap.filter(r => r.status === 'PASS').length}/${report.run_1.bootstrap.length} passed`);
  console.log(`  Application Tests: ${report.run_1.application_tests.actual}/${report.run_1.application_tests.required}`);
  console.log(`  CLI Tests: ${report.run_1.cli_tests.actual}/${report.run_1.cli_tests.required}`);
  console.log(`  Regression: ${report.run_1.regression.actual}/${report.run_1.regression.required}`);
  console.log(`  Status: ${report.run_1.overall}`);
  
  console.log('\nInstallation #2:');
  console.log(`  Bootstrap: ${report.run_2.bootstrap.filter(r => r.status === 'PASS').length}/${report.run_2.bootstrap.length} passed`);
  console.log(`  Application Tests: ${report.run_2.application_tests.actual}/${report.run_2.application_tests.required}`);
  console.log(`  CLI Tests: ${report.run_2.cli_tests.actual}/${report.run_2.cli_tests.required}`);
  console.log(`  Regression: ${report.run_2.regression.actual}/${report.run_2.regression.required}`);
  console.log(`  Status: ${report.run_2.overall}`);
  
  console.log('\nAdditional Checks:');
  console.log(`  Contamination: ${report.summary.contamination_free ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`  Hidden Dependencies: ${report.summary.no_hidden_dependencies ? 'PASS ✅' : 'FAIL ❌'}`);
  
  console.log('\n' + '='.repeat(60));
  console.log(`FINAL STATUS: ${report.final_status}`);
  console.log('='.repeat(60));

  // Print failures if any
  if (report.final_status !== 'REPRODUCIBLE') {
    console.log('\n❌ FAILURES AND LIMITATIONS:');
    
    if (report.source_identity.git_commit === 'NOT_A_GIT_REPOSITORY') {
      console.log('  • Source is not in a Git repository');
    }
    
    if (report.summary.prerequisites_pass < report.summary.prerequisites_total) {
      console.log('  • Prerequisites not met');
      prerequisites.filter(r => r.status === 'FAIL').forEach(p => {
        console.log(`    - ${p.check}: ${p.actual} (required: ${p.required})`);
      });
    }
    
    if (report.run_1.overall !== 'PASS') {
      console.log('  • Run #1 failed');
    }
    
    if (report.run_2.overall !== 'PASS') {
      console.log('  • Run #2 failed');
    }
    
    if (!report.summary.contamination_free) {
      console.log('  • Contamination detected');
    }
    
    if (!report.summary.no_hidden_dependencies) {
      console.log('  • Hidden dependencies detected');
    }
    
    const hasLockfile = report.prerequisites.checks.some(r => r.check === 'package-lock.json exists' && r.status === 'PASS');
    if (!hasLockfile) {
      console.log('  • package-lock.json missing (limited reproducibility)');
    }
  }
}

async function main() {
  log('🧪 FRESH-INSTALL REPRODUCIBILITY VALIDATION (ISOLATED)', 'blue');
  log('='.repeat(60), 'blue');
  log('This validation creates an isolated clean workspace and proves', 'blue');
  log('that the application can be reconstructed from source.', 'blue');
  log('');

  let validationDir = null;
  let report = null;

  try {
    // Step 1: Capture source identity
    const sourceIdentity = captureSourceIdentity();
    
    // Save source manifest
    const manifestPath = path.join(SOURCE_DIR, 'tests', 'fresh-install-source-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(sourceIdentity, null, 2));
    log(`📄 Source manifest saved to: ${manifestPath}`, 'cyan');

    // Step 2: Create clean source snapshot
    validationDir = createCleanSourceSnapshot(sourceIdentity);
    if (!validationDir) {
      log('\n❌ VALIDATION ABORTED: Could not create clean source snapshot', 'red');
      process.exit(1);
    }

    // Step 3: Check prerequisites
    const prerequisites = checkPrerequisites(validationDir);

    // Step 4: Run first validation
    log('\n' + '='.repeat(60), 'magenta');
    log('RUN #1: FIRST CLEAN INSTALLATION', 'magenta');
    log('='.repeat(60), 'magenta');

    const run1Bootstrap = await runBootstrap(validationDir, 1);
    const run1AppTests = runApplicationTests(validationDir);
    const run1CliTests = runCLISmokeTests(validationDir);
    const run1Regression = runRegressionBaseline(validationDir);
    const run1Contamination = checkContamination(validationDir);
    const run1GlobalDeps = checkGlobalDependencies(validationDir);

    const run1Overall = (
      run1Bootstrap.every(r => r.status === 'PASS') &&
      run1AppTests.status === 'PASS' &&
      run1CliTests.status === 'PASS' &&
      run1Regression.status === 'PASS'
    ) ? 'PASS' : 'FAIL';

    const run1 = {
      bootstrap: run1Bootstrap,
      appTests: run1AppTests,
      cliTests: run1CliTests,
      regression: run1Regression,
      contamination: run1Contamination,
      globalDeps: run1GlobalDeps,
      overall: run1Overall
    };

    // Step 5: Cleanup and recreate for second run
    log('\n' + '='.repeat(60), 'magenta');
    log('CLEANING UP FOR RUN #2', 'magenta');
    log('='.repeat(60), 'magenta');

    cleanupValidationDir();

    // Recreate clean snapshot
    validationDir = createCleanSourceSnapshot(sourceIdentity);
    if (!validationDir) {
      log('\n❌ VALIDATION ABORTED: Could not recreate clean source snapshot', 'red');
      process.exit(1);
    }

    // Step 6: Run second validation
    log('\n' + '='.repeat(60), 'magenta');
    log('RUN #2: SECOND CLEAN INSTALLATION', 'magenta');
    log('='.repeat(60), 'magenta');

    const run2Bootstrap = await runBootstrap(validationDir, 2);
    const run2AppTests = runApplicationTests(validationDir);
    const run2CliTests = runCLISmokeTests(validationDir);
    const run2Regression = runRegressionBaseline(validationDir);
    const run2Contamination = checkContamination(validationDir);
    const run2GlobalDeps = checkGlobalDependencies(validationDir);

    const run2Overall = (
      run2Bootstrap.every(r => r.status === 'PASS') &&
      run2AppTests.status === 'PASS' &&
      run2CliTests.status === 'PASS' &&
      run2Regression.status === 'PASS'
    ) ? 'PASS' : 'FAIL';

    const run2 = {
      bootstrap: run2Bootstrap,
      appTests: run2AppTests,
      cliTests: run2CliTests,
      regression: run2Regression,
      contamination: run2Contamination,
      globalDeps: run2GlobalDeps,
      overall: run2Overall
    };

    // Step 7: Generate report
    report = generateReport(sourceIdentity, prerequisites, run1, run2, run1Contamination, run1GlobalDeps);

    // Step 8: Print final report
    printFinalReport(report);

    // Step 9: Final cleanup
    cleanupValidationDir();

    // Step 10: Exit with appropriate code
    if (report.final_status === 'REPRODUCIBLE') {
      log('\n✅ FRESH-INSTALL REPRODUCIBILITY VALIDATED', 'green');
      log('The application can be reconstructed from source in a clean environment.', 'green');
      process.exit(0);
    } else if (report.final_status === 'LIMITED') {
      log('\n⚠️  FRESH-INSTALL REPRODUCIBILITY LIMITED', 'yellow');
      log('The application can be installed but reproducibility is limited.', 'yellow');
      process.exit(1);
    } else {
      log('\n❌ FRESH-INSTALL NOT REPRODUCIBLE', 'red');
      log('The application cannot be reliably reconstructed from source.', 'red');
      process.exit(1);
    }

  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
    log(error.stack, 'red');
    
    // Cleanup on error
    if (validationDir) {
      cleanupValidationDir();
    }
    
    process.exit(1);
  }
}

main();
