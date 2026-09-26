import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateGuardianProfiles } from '../src/catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'data');
fs.mkdirSync(outputDir, { recursive: true });
const profiles = generateGuardianProfiles(600);
const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  notice: 'These are deterministic configuration profiles, not autonomous legal entities or guaranteed active agents. A profile becomes operational only after assignment to a real task and successful validation.',
  count: profiles.length,
  profiles
};
fs.writeFileSync(path.join(outputDir, 'guardians-600.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Generated ${profiles.length} guardian profiles at data/guardians-600.json`);
