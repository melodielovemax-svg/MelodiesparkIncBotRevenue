import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config.mjs';
import { Repository } from '../src/db.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (!fs.existsSync(envPath)) {
  const template = fs.existsSync(examplePath) ? fs.readFileSync(examplePath, 'utf8') : 'NODE_ENV=development\nAPP_MODE=demo\nHOST=127.0.0.1\nPORT=4173\n';
  const sessionSecret = crypto.randomBytes(32).toString('base64url');
  const portalSecret = crypto.randomBytes(32).toString('base64url');
  const content = `${template.trim()}\nSESSION_SECRET=${sessionSecret}\nPORTAL_SECRET=${portalSecret}\n`;
  fs.writeFileSync(envPath, content, { encoding: 'utf8', mode: 0o600 });
  console.log('Created .env with random session secrets. Set an admin password next.');
} else {
  console.log('.env already exists; it was not overwritten.');
}

for (const directory of ['data', 'data\\exports', 'reports']) fs.mkdirSync(path.join(root, directory), { recursive: true });
const config = loadConfig();
const db = new Repository({ databasePath: config.databasePath, schemaPath: config.schemaPath, config });
console.log(`Initialized SQLite database at ${config.databasePath}`);
console.log(`Guardian configurations: ${db.listGuardians({ limit: 600 }).length}`);
db.close();
