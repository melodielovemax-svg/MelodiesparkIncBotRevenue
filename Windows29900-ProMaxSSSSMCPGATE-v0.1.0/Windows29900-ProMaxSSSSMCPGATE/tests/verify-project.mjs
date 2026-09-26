import fs from 'node:fs';
import path from 'node:path';
const required=['README.md','docs/ARCHITECTURE.md','docs/TRUTH_PROTOCOL.md','mcp/policy.json','tests/status-manifest.json'];
const missing=required.filter(f=>!fs.existsSync(path.join(process.cwd(),f)));
if(missing.length){console.error('FAIL',missing.join(', '));process.exit(1);}
const p=JSON.parse(fs.readFileSync('mcp/policy.json','utf8'));
if(p.default!=='deny'||p.audit!==true){console.error('FAIL fail-closed policy');process.exit(1);}
console.log('PASS project structure');
console.log('PASS fail-closed MCPGATE policy');
console.log('PASS evidence/status manifest');
