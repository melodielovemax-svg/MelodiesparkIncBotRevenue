import fs from 'node:fs';

const files=[
 'games/registry/catalog.json',
 'performance/ledger.json',
 'performance/hardware-ledger.schema.json',
 'apps/chatbot-hub/providers.json',
 'apps/chatbot-hub/agents.json'
];

let ok=true;
for(const f of files){
 if(!fs.existsSync(f)){ console.error('FAIL',f); ok=false; }
}
const games=JSON.parse(fs.readFileSync('games/registry/catalog.json'));
const ledger=JSON.parse(fs.readFileSync('performance/ledger.json'));
if(games.capacity_target!==15000) { console.error('FAIL game capacity'); ok=false; }
if(!Array.isArray(ledger.entries)) { console.error('FAIL ledger'); ok=false; }

console.log(ok ? 'ALL PLATFORM STRUCTURE CHECKS PASSED' : 'PLATFORM CHECK FAILED');
process.exit(ok?0:1);
