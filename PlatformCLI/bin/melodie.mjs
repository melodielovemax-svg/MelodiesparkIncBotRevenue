#!/usr/bin/env node
/**
 * Launcher for @melodiespark/cli.
 *
 * Prefers the compiled build in `dist/`. Falls back to running the TypeScript
 * sources directly, which Node 22.18+ / 23.6+ can do natively via type
 * stripping. That keeps the CLI usable straight from a git clone while still
 * shipping compiled JavaScript in the published tarball.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const compiled = path.join(here, '..', 'dist', 'index.js');
const sources = path.join(here, '..', 'src', 'index.ts');

const entry = fs.existsSync(compiled) ? compiled : sources;

if (!fs.existsSync(entry)) {
  process.stderr.write(
    'melodie: neither dist/index.js nor src/index.ts was found.\n' +
      'Reinstall the package, or run `npm run build` in apps/melodie-cli.\n'
  );
  process.exit(1);
}

await import(pathToFileURL(entry).href);
