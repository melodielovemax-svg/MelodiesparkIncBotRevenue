import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const safeRunner = path.join(root, 'scripts', 'run-safe-cycle.mjs');
const phases = [
  ['alpha', 'health'],
  ['beta', 'data-integrity'],
  ['theta', 'integration-status'],
  ['delta', 'security-config'],
  ['bravo', 'catalog-integrity'],
  ['gamma', 'audit-and-karma']
];

function boundedInteger(raw, fallback, min, max, name) {
  if (raw === undefined) return fallback;
  if (!/^\d+$/.test(raw)) throw new Error(`${name} must be an integer.`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error(`${name} must be between ${min} and ${max}.`);
  return value;
}

function parseArgs(argv) {
  const cycles = boundedInteger(argv[0], 1, 1, 10_000, 'cycles');
  const interval = boundedInteger(argv.find((value) => value.startsWith('--interval='))?.split('=')[1], 30, 30, 86_400, 'interval');
  if (argv.includes('--infinite') || argv.includes('--polygon-live') || argv.includes('--financial')) {
    throw new Error('Only finite, local, non-financial matrix cycles are supported.');
  }
  return { cycles, interval };
}

const { cycles, interval } = parseArgs(process.argv.slice(2));
console.log(JSON.stringify({
  component: 'quantum-matrix',
  status: 'SCAFFOLD',
  mode: 'bounded-local',
  cycles,
  intervalSeconds: interval,
  phases,
  boundaries: ['no infinite loop', 'no financial action', 'no blockchain broadcast', 'no autonomous agents']
}));

const child = spawn(process.execPath, [safeRunner, String(cycles), `--interval=${interval}`], {
  cwd: root,
  stdio: 'inherit',
  windowsHide: true
});

const shutdown = () => child.kill('SIGINT');
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

child.once('error', (error) => {
  console.error(JSON.stringify({ component: 'quantum-matrix', status: 'failed', failureClass: 'runner-start', message: error.message }));
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  if (signal && signal !== 'SIGINT') process.exitCode = 1;
  else if (code !== 0 && code !== null) process.exitCode = code;
});
