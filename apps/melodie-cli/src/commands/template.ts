/** `melodie template` - list and describe scaffolding templates. */

import { flag, opt, type ParsedArgs } from '../args.ts';
import { listTemplates, loadTemplate, walkTemplateFiles, templateDir } from '../template.ts';
import { heading, line, style, table } from '../output.ts';
import path from 'node:path';

/**
 * `list` is a subcommand word meaning "show me every template", never a
 * template name. `melodie template list` is far more likely to be read as a
 * command than as a request for a template that happens to be called "list".
 */
const LIST_WORD = 'list';

/**
 * `show` is a subcommand prefix that takes the name as its argument, so both
 * `template <name>` and `template show <name>` describe one template.
 */
const SHOW_WORD = 'show';

export function runTemplate(args: ParsedArgs): void {
  const positionals = args.positionals;
  // `show` shifts the name along; `list` is swallowed entirely.
  const name = positionals[0] === SHOW_WORD ? positionals[1] : positionals[0];
  const listRequested =
    !name || name === LIST_WORD || positionals[0] === LIST_WORD || flag(args, 'list');

  if (listRequested) {
    const templates = listTemplates();
    if (flag(args, 'json')) {
      line(JSON.stringify(templates, null, 2));
      return;
    }
    heading(`Templates (${templates.length})`);
    if (templates.length === 0) {
      line(style.yellow('No templates found.'));
      line(style.dim(`Searched: ${templateDir('.')}`));
      return;
    }
    table(
      templates.map((t) => [t.name, t.kind, t.targets.join(', '), t.description]),
      ['NAME', 'KIND', 'TARGETS', 'DESCRIPTION']
    );
    line();
    line(style.dim('Detail:  melodie template show <name>      Scaffold:  melodie init <dir> --template <name>'));
    return;
  }

  const manifest = loadTemplate(name);
  if (flag(args, 'files') || flag(args, 'json')) {
    const files = walkTemplateFiles(templateDir(name));
    if (flag(args, 'json')) {
      line(JSON.stringify({ ...manifest, files: files }, null, 2));
      return;
    }
    heading(`Files in template ${name} (${files.length})`);
    for (const file of files) {
      const gated = manifest.consent_gated_files.includes(file);
      line(`  ${gated ? style.yellow('[consent-gated] ') : ''}${file}`);
    }
    return;
  }

  heading(`Template ${manifest.name} v${manifest.version}`);
  line(`  kind        ${manifest.kind}`);
  line(`  targets     ${manifest.targets.join(', ')}`);
  line(`  description ${manifest.description}`);
  line(`  root        ${templateDir(name)}`);

  heading('Install');
  table(Object.entries(manifest.install).map(([k, v]) => [k, v]), ['TARGET', 'COMMAND']);
  heading('Run');
  table(Object.entries(manifest.run).map(([k, v]) => [k, v]), ['EXAMPLE', 'COMMAND']);

  if (manifest.web3) {
    heading('Web3 safety posture');
    const rows = Object.entries(manifest.web3).map(([k, v]) => [k, String(v)]);
    table(rows, ['PROPERTY', 'VALUE']);
    if (manifest.consent_gated_files.length > 0) {
      line();
      line(style.yellow(`Consent-gated files (never emitted without the consent flag):`));
      for (const f of manifest.consent_gated_files) line(`  ${f}`);
    }
  }

  const files = walkTemplateFiles(templateDir(name));
  heading(`Files (${files.length})`);
  for (const file of files.slice(0, 40)) {
    const gated = manifest.consent_gated_files.includes(file);
    line(`  ${gated ? style.yellow('[gated] ') : ''}${file}`);
  }
  if (files.length > 40) line(style.dim(`... ${files.length - 40} more`));
}
