/** Template manifest contract and loader. */

import fs from 'node:fs';
import path from 'node:path';
import { CatalogError } from './store.ts';
import { resolvePaths } from './paths.ts';

export interface TemplateWeb3 {
  mode: 'READ-ONLY' | 'READ-ONLY+INTENTS';
  signing: 'DISABLED' | 'CONSENT_GATED';
  broadcasting: 'DISABLED';
  custody: 'NONE';
  private_keys: 'NOT GENERATED';
  consent_flag: string;
}

export interface TemplateManifest {
  name: string;
  version: string;
  description: string;
  kind: 'node' | 'python' | 'web3' | 'unreal' | 'monorepo';
  targets: string[];
  install: Record<string, string>;
  run: Record<string, string>;
  variables: Record<string, string>;
  consent_gated_files: string[];
  web3: TemplateWeb3 | null;
  files: string[];
  notes: string[];
}

export const TEMPLATE_SUFFIX = '.tmpl';

export function templateDir(name: string): string {
  return path.join(resolvePaths().templatesDir, name);
}

export function loadTemplate(name: string): TemplateManifest {
  const dir = templateDir(name);
  const manifestPath = path.join(dir, 'template.json');
  if (!fs.existsSync(manifestPath)) {
    // A CatalogError, not a plain Error: the dispatcher prints CatalogError
    // cleanly and sets a non-zero exit code, whereas a plain Error surfaces as
    // "Unexpected error" and exits 0.
    throw new CatalogError(
      `Template not found: ${name}\n` +
        `Searched: ${dir}\n` +
        `List available templates with:  melodie template list`
    );
  }
  let manifest: TemplateManifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as TemplateManifest;
  } catch (error) {
    throw new CatalogError(`Template manifest at ${manifestPath} is not valid JSON: ${(error as Error).message}`);
  }
  if (!manifest.files || manifest.files.length === 0) {
    throw new CatalogError(`Template ${name} declares no files in its manifest.`);
  }
  return manifest;
}

export function listTemplates(): TemplateManifest[] {
  const root = resolvePaths().templatesDir;
  if (!fs.existsSync(root)) return [];
  const out: TemplateManifest[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(root, entry.name, 'template.json');
    if (!fs.existsSync(manifestPath)) continue;
    out.push(JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as TemplateManifest);
  }
  return out.sort((a, b) => (a.name < b.name ? -1 : 1));
}

export function walkTemplateFiles(root: string, current = root, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const abs = path.join(current, entry.name);
    if (entry.isDirectory()) walkTemplateFiles(root, abs, acc);
    else acc.push(path.relative(root, abs).split(path.sep).join('/'));
  }
  return acc;
}
