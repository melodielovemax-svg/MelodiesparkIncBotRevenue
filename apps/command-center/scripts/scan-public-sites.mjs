import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportDir = path.join(root, 'reports');
fs.mkdirSync(reportDir, { recursive: true });
const targets = [
  'https://app-scanner-plus--melodiesparkmax.replit.app',
  'https://melodie-spark-nexus.base44.app',
  'https://melodiespark-ecosystem--demigodmelodeat.replit.app',
  'https://melodie-wealth-flow.base44.app',
  'https://melodiespark.base44.app',
  'https://sparkmelodie.base44.app',
  'https://melodiesparkinc.base44.app',
  'https://melodieinc.base44.app/revenue-hub',
  'https://quantummelodie.base44.app/wallet',
  'https://revenue-sync-module--melodiesparkmax.replit.app/'
];

const results = [];
for (const url of targets) {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000), headers: { 'User-Agent': 'Melodiespark-Public-Site-Inventory/0.1', Accept: 'text/html,application/xhtml+xml' } });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('text/html') ? await response.text() : '';
    const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() || null;
    const description = body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)?.[1] || null;
    const links = [...new Set([...body.matchAll(/href=["']([^"'#]+)["']/gi)].map((match) => match[1]).filter((item) => item.startsWith('/')).map((item) => item.split('?')[0]))].slice(0, 100);
    results.push({ url, checkedAt, status: response.status, ok: response.ok, finalUrl: response.url, title, description, internalLinks: links });
  } catch (error) {
    results.push({ url, checkedAt, status: null, ok: false, error: error.message });
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  scope: 'Single unauthenticated public GET per configured URL; no exploitation, credential testing, private endpoint discovery, or high-rate scanning.',
  results
};
fs.writeFileSync(path.join(reportDir, 'public-site-scan.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const markdown = [
  '# Public Site Inventory', '',
  `Generated: ${report.generatedAt}`, '',
  report.scope, '',
  '| URL | Status | Title | Internal routes |',
  '|---|---:|---|---:|',
  ...results.map((item) => `| ${item.url} | ${item.status ?? 'error'} | ${(item.title || item.error || '').replaceAll('|', '\\|')} | ${item.internalLinks?.length || 0} |`),
  '', '## Interpretation', '',
  '- A 200 response proves only that a public page loaded.',
  '- A 404 means the configured URL is unavailable; it does not prove the backing project is gone.',
  '- Client-rendered dashboards require authenticated functional testing in each application.',
  '- Duplicate product concepts should be consolidated into one versioned source of truth.',
  '- No credentials are required or accepted by this scanner.'
].join('\n');
fs.writeFileSync(path.join(reportDir, 'public-site-scan.md'), `${markdown}\n`, 'utf8');
console.log(`Scanned ${results.length} public URLs. Reports written to reports/.`);
