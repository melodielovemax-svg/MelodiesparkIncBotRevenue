/**
 * `melodie init` - scaffold a project from a template.
 *
 * The Web3 template emits a read-only wallet by default. Files that can sign
 * or broadcast a transaction are withheld unless the operator passes the
 * explicit consent flag.
 */

import fs from 'node:fs';
import path from 'node:path';
import { flag, opt, type ParsedArgs } from '../args.ts';
import { appendAudit } from '../audit.ts';
import { auditLogPath } from '../paths.ts';
import { listTemplates, loadTemplate, TEMPLATE_SUFFIX, templateDir, type TemplateManifest } from '../template.ts';
import { fail, heading, line, style, table, warn } from '../output.ts';

export const SIGNING_CONSENT_FLAG = 'i-understand-this-signs-transactions';

function jsonSafe(value: string): string {
  return JSON.stringify(value).slice(1, -1);
}

function render(text: string, vars: Record<string, string>, isJson: boolean): string {
  let out = text;
  for (const [key, value] of Object.entries(vars)) {
    const replacement = isJson ? jsonSafe(value) : value;
    out = out.split(`{{${key}}}`).join(replacement);
  }
  return out;
}

function buildVariables(manifest: TemplateManifest, targetDir: string, overrides: Record<string, string>): Record<string, string> {
  const base: Record<string, string> = {
    TEMPLATE: manifest.name,
    TEMPLATE_VERSION: manifest.version,
    TEMPLATE_KIND: manifest.kind,
    PACKAGE_NAME: path.basename(targetDir),
    PACKAGE_VERSION: '0.1.0',
    DESCRIPTION: manifest.description,
    AUTHOR: 'Melodiespark',
    LICENSE: 'UNLICENSED',
    YEAR: String(new Date().getFullYear()),
    GENERATED_AT: new Date().toISOString(),
    CLI_BIN: 'melodie-app',
    PY_MODULE: path.basename(targetDir).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
    CONSENT_FLAG: SIGNING_CONSENT_FLAG,
  };
  const merged = { ...base, ...manifest.variables, ...overrides };
  return merged;
}

function isNonEmpty(dir: string): boolean {
  return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
}

export function runInit(args: ParsedArgs): void {
  const targetArg = args.positionals[0];
  const name = opt(args, 'template');

  if (flag(args, 'list')) {
    const templates = listTemplates();
    heading('Available templates');
    table(templates.map((t) => [t.name, t.kind, t.description]), ['NAME', 'KIND', 'DESCRIPTION']);
    return;
  }

  if (!targetArg || !name) {
    fail('Usage: melodie init <directory> --template <name>');
    line(style.dim('List templates with: melodie template list'));
    process.exitCode = 1;
    return;
  }

  let manifest: TemplateManifest;
  try {
    manifest = loadTemplate(name);
  } catch (error) {
    fail((error as Error).message);
    process.exitCode = 1;
    return;
  }

  const targetDir = path.resolve(targetArg);
  const force = flag(args, 'force');
  const consent = flag(args, SIGNING_CONSENT_FLAG);

  if (isNonEmpty(targetDir) && !force) {
    fail(`${targetDir} is not empty. Re-run with --force to write into it.`);
    process.exitCode = 1;
    return;
  }

  const overrides: Record<string, string> = {};
  for (const [key, value] of args.options) {
    if (['template', 'out', 'catalog', 'name', 'description', 'bin'].includes(key)) continue;
    if (key === 'name') overrides.PACKAGE_NAME = value;
    if (key === 'description') overrides.DESCRIPTION = value;
    if (key === 'bin') overrides.CLI_BIN = value;
  }

  const vars = buildVariables(manifest, targetDir, overrides);
  const srcRoot = templateDir(name);
  const gated = new Set(manifest.consent_gated_files);
  const blocked = [...gated].filter((f) => !consent);

  heading('Scaffolding');
  line(`  template     ${manifest.name} v${manifest.version}`);
  line(`  destination  ${targetDir}`);
  line(`  kind         ${manifest.kind}`);

  if (manifest.web3) {
    heading('Web3 safety posture');
    table(
      [
        ['mode', manifest.web3.mode],
        ['signing', consent ? style.yellow(manifest.web3.signing === 'CONSENT_GATED' ? 'CONSENT GIVEN' : manifest.web3.signing) : manifest.web3.signing],
        ['broadcasting', manifest.web3.broadcasting],
        ['custody', manifest.web3.custody],
        ['private keys', manifest.web3.private_keys],
      ],
      ['PROPERTY', 'VALUE']
    );
    if (blocked.length > 0) {
      line();
      warn(`${blocked.length} consent-gated file(s) will NOT be written:`);
      for (const f of blocked) line(`  ${f}`);
      line();
      line(style.dim(`To include them you must pass --${SIGNING_CONSENT_FLAG} and take full`));
      line(style.dim('responsibility for the signing and broadcasting code it produces.'));
    }
  }

  const written: string[] = [];
  const skipped: string[] = [];

  const walk = (current: string, rel: string): void => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name);
      // `rel` is the path in template space, used for consent gating and for
      // the emitted manifest. Directory names may contain {{TOKEN}} (for
      // example src/{{PY_MODULE}}), so the path is rendered before it is used
      // on disk.
      const templateRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(abs, templateRel);
        continue;
      }
      if (templateRel === 'template.json') continue;
      if (gated.has(templateRel) && !consent) {
        skipped.push(templateRel);
        continue;
      }
      const isTemplateFile = entry.name.endsWith(TEMPLATE_SUFFIX);
      const outName = isTemplateFile ? entry.name.slice(0, -TEMPLATE_SUFFIX.length) : entry.name;
      const rawRel = templateRel === entry.name ? outName : `${templateRel.slice(0, templateRel.lastIndexOf('/') + 1)}${outName}`;
      const outRel = render(rawRel, vars, false);
      const outAbs = path.join(targetDir, outRel.split('/').join(path.sep));
      fs.mkdirSync(path.dirname(outAbs), { recursive: true });
      if (isTemplateFile) {
        const raw = fs.readFileSync(abs, 'utf-8');
        const isJson = outName.endsWith('.json');
        fs.writeFileSync(outAbs, render(raw, vars, isJson), 'utf-8');
      } else {
        fs.copyFileSync(abs, outAbs);
      }
      written.push(outRel);
    }
  };

  walk(srcRoot, '');

  // Provenance stamp: what generated this, from which template, under which
  // consent. Generated projects must not look hand-authored.
  fs.writeFileSync(
    path.join(targetDir, 'MELODIESPARK_SCAFFOLD.json'),
    `${JSON.stringify(
      {
        generated_at: vars.GENERATED_AT,
        generator: '@melodiespark/cli',
        template: manifest.name,
        template_version: manifest.version,
        template_kind: manifest.kind,
        web3_consent_flag_given: consent,
        status: 'SCAFFOLD',
        disclaimer:
          'Generated scaffold. Its presence is not evidence that any described capability is built, tested, or operational.',
      },
      null,
      2
    )}\n`,
    'utf-8'
  );
  written.push('MELODIESPARK_SCAFFOLD.json');

  appendAudit(auditLogPath(targetDir), {
    action: 'TEMPLATE_INIT',
    target: manifest.name,
    outcome: 'ALLOWED',
    bytes: 0,
    authorization: consent,
    reason: `Scaffolded ${written.length} files from template ${manifest.name}.`,
    content_signals: [],
    catalog: 'n/a',
  });

  heading('Written');
  for (const file of written) line(`  ${file}`);
  if (skipped.length > 0) {
    line();
    line(style.yellow(`Withheld (consent-gated): ${skipped.join(', ')}`));
  }

  heading('Next');
  for (const [target, command] of Object.entries(manifest.install)) {
    line(`  ${target.padEnd(8)} ${render(command, vars, false)}`);
  }
  line();
  for (const [example, command] of Object.entries(manifest.run)) {
    line(`  ${example.padEnd(18)} ${render(command, vars, false)}`);
  }
  line();
  line(style.bold('Status: SCAFFOLD. Nothing here has been built, tested, or deployed.'));
}
