import fs from 'node:fs';
import os from 'node:os';

console.log('MEGA PLATFORM DOCTOR');
console.log('Node:', process.version);
console.log('OS:', os.platform(), os.release(), os.arch());
console.log('CPU cores:', os.cpus().length);
console.log('Memory GB:', (os.totalmem()/1073741824).toFixed(2));

for (const p of [
  'games/registry/catalog.json',
  'performance/ledger.json',
  'performance/hardware-ledger.schema.json',
  'apps/chatbot-hub/providers.json',
  'apps/chatbot-hub/agents.json'
]) console.log(fs.existsSync(p) ? 'PASS '+p : 'FAIL '+p);
