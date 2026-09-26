/**
 * Melodie CLI Agent Platform - Provider Management Command.
 *
 * Implements:
 *   melodie provider list
 *   melodie provider verify <name>
 *   melodie provider add <name>
 *   melodie provider remove <name>
 */

import type { parseArgs } from '../args.ts';
import { heading, line, table, style, fail } from '../output.ts';
import { providerManager } from '../providers/manager.ts';

export async function runProvider(args: ReturnType<typeof parseArgs>): Promise<void> {
  const jsonMode = args.flags.has('json');
  const sub = args.positionals[0];

  // 1. melodie provider verify <name>
  if (sub === 'verify') {
    const name = args.positionals[1];
    if (!name) {
      fail('Provider verify requires a provider name: melodie provider verify <name>');
      process.exitCode = 1;
      return;
    }

    heading(`Verifying Provider: ${name}`);
    const result = await providerManager.verifyProvider(name);

    if (jsonMode) {
      line(JSON.stringify(result, null, 2));
      return;
    }

    if (result.ok) {
      line(style.green(`Provider ${name} verified: ${result.message}`));
    } else {
      line(style.yellow(`Provider ${name} check: ${result.message}`));
      line(style.dim('Status remains unverified until credentials and connectivity are established.'));
    }
    return;
  }

  // 2. melodie provider add <name>
  if (sub === 'add') {
    const name = args.positionals[1];
    if (!name) {
      fail('Provider add requires a name: melodie provider add <name>');
      process.exitCode = 1;
      return;
    }

    const baseUrl = args.options.get('base-url') || null;
    const envKey = args.options.get('env-key') || `${name.toUpperCase()}_API_KEY`;

    providerManager.addProvider({
      id: name.toLowerCase(),
      name: name.toLowerCase(),
      displayName: `${name} Custom Provider`,
      type: 'direct',
      baseUrl,
      envKey,
      capabilities: ['chat'],
      status: 'UNVERIFIED',
      isConfigured: false,
      isReachable: false,
      supportsDynamicCatalog: false,
    });

    line(style.green(`Provider '${name}' added to registry. Set ${envKey} in environment to configure.`));
    return;
  }

  // 3. melodie provider remove <name>
  if (sub === 'remove') {
    const name = args.positionals[1];
    if (!name) {
      fail('Provider remove requires a name: melodie provider remove <name>');
      process.exitCode = 1;
      return;
    }

    const removed = providerManager.removeProvider(name);
    if (removed) {
      line(style.green(`Provider '${name}' removed from registry.`));
    } else {
      fail(`Provider '${name}' not found.`);
      process.exitCode = 1;
    }
    return;
  }

  // 4. Default: melodie provider [list]
  const configs = providerManager.listConfigs();
  if (jsonMode) {
    line(JSON.stringify(configs, null, 2));
    return;
  }

  heading(`AI Providers (${configs.length} registered)`);
  line(style.dim('Model gateway provider adapters and credential connection states.\n'));

  const rows = configs.map((c) => {
    let stat = style.yellow(c.status);
    if (c.status === 'OPERATIONAL') stat = style.green(c.status);
    if (c.status === 'BLOCKED') stat = style.red(c.status);

    const cred = c.envKey
      ? c.isConfigured
        ? style.green('[CONFIGURED]')
        : style.dim(`[UNSET: ${c.envKey}]`)
      : style.cyan('[LOCAL / NO KEY]');

    return [c.name, c.displayName, c.type, cred, stat];
  });

  table(rows, ['Provider', 'Display Name', 'Type', 'Credential State', 'Status']);
  line();
  line(style.dim('Run `melodie provider verify <name>` to test live connection.'));
}
