import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const CONTAMINATED_ITEMS = [
  { path: '.env', description: 'Environment configuration file' },
  { path: 'node_modules', description: 'Installed dependencies directory' },
  { path: 'data', description: 'Data directory' },
  { path: 'db', description: 'Database directory' },
  { path: 'reports', description: 'Reports directory' },
  { path: 'package-lock.json', description: 'Dependency lock file' },
  { path: '.env.local', description: 'Local environment file' },
  { path: '.env.production', description: 'Production environment file' }
];

function checkContamination() {
  console.log('🔍 ENVIRONMENT CONTAMINATION CHECK');
  console.log('='.repeat(50));
  
  const contaminated = [];
  const clean = [];
  
  for (const item of CONTAMINATED_ITEMS) {
    const itemPath = path.join(ROOT_DIR, item.path);
    const exists = fs.existsSync(itemPath);
    
    if (exists) {
      contaminated.push(item);
      console.log(`❌ ${item.path} - ${item.description}`);
    } else {
      clean.push(item);
      console.log(`✅ ${item.path} - Not found (clean)`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Contaminated items: ${contaminated.length}`);
  console.log(`Clean items: ${clean.length}`);
  
  return { contaminated, clean };
}

function generateCleanupCommands(contaminated) {
  if (contaminated.length === 0) {
    console.log('\n✅ Environment is already clean!');
    console.log('You can run: node scripts/validate-fresh-install.mjs');
    return;
  }
  
  console.log('\n📋 CLEANUP COMMANDS (PowerShell)');
  console.log('='.repeat(50));
  console.log('⚠️  WARNING: These commands will DELETE files permanently!');
  console.log('⚠️  Make sure you have backups if needed!\n');
  
  for (const item of contaminated) {
    if (item.path.includes('node_modules')) {
      console.log(`Remove-Item node_modules -Recurse -Force`);
    } else {
      console.log(`Remove-Item ${item.path} -Force`);
    }
  }
  
  console.log('\n📋 CLEANUP COMMANDS (Bash/Git Bash)');
  console.log('='.repeat(50));
  console.log('⚠️  WARNING: These commands will DELETE files permanently!');
  console.log('⚠️  Make sure you have backups if needed!\n');
  
  for (const item of contaminated) {
    if (item.path.includes('node_modules')) {
      console.log(`rm -rf node_modules`);
    } else {
      console.log(`rm -f ${item.path}`);
    }
  }
}

function suggestAlternativeApproach() {
  console.log('\n💡 ALTERNATIVE: Clean Directory Approach');
  console.log('='.repeat(50));
  console.log('Instead of cleaning the current directory, consider:');
  console.log('');
  console.log('1. Create a new clean directory:');
  console.log('   mkdir C:\\melodie-test-fresh');
  console.log('   cd C:\\melodie-test-fresh');
  console.log('');
  console.log('2. Copy only source files (excluding contaminated items):');
  console.log('   - src/');
  console.log('   - scripts/');
  console.log('   - public/');
  console.log('   - docs/');
  console.log('   - tests/');
  console.log('   - package.json');
  console.log('   - README.md');
  console.log('   - .env.example');
  console.log('');
  console.log('3. Run the validation:');
  console.log('   node scripts/validate-fresh-install.mjs');
  console.log('');
  console.log('This preserves your current development environment while');
  console.log('providing a truly clean validation environment.');
}

function main() {
  console.log('🧹 CLEAN ENVIRONMENT PREPARATION');
  console.log('='.repeat(50));
  console.log('This script helps prepare a clean environment for');
  console.log('fresh-install reproducibility validation.\n');
  
  const { contaminated, clean } = checkContamination();
  generateCleanupCommands(contaminated);
  suggestAlternativeApproach();
  
  console.log('\n' + '='.repeat(50));
  console.log('NEXT STEPS');
  console.log('='.repeat(50));
  console.log('1. Choose cleanup method (cleanup current dir OR new clean dir)');
  console.log('2. Execute cleanup/copy commands');
  console.log('3. Run: node scripts/validate-fresh-install.mjs');
  console.log('4. Review: tests/fresh-install-report.json');
  console.log('');
  console.log('📄 Full documentation: docs/FRESH_INSTALL_VALIDATION.md');
}

main();
