import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../src/security.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const password = process.env.MELODIESPARK_PASSWORD || '';
if (!fs.existsSync(envPath)) throw new Error('Run initialization before setting a password.');
if (password.length < 12) throw new Error('MELODIESPARK_PASSWORD must contain at least 12 characters.');
const hash = await hashPassword(password);
let content = fs.readFileSync(envPath, 'utf8');
if (/^ADMIN_PASSWORD_HASH=.*$/m.test(content)) content = content.replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH=${hash}`);
else content += `\nADMIN_PASSWORD_HASH=${hash}\n`;
fs.writeFileSync(envPath, content, { encoding: 'utf8', mode: 0o600 });
delete process.env.MELODIESPARK_PASSWORD;
console.log('Administrator password hash updated. Existing sessions will be revoked on next start.');
