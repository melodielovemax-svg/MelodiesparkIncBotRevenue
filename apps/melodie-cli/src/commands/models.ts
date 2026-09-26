/**
 * Melodie CLI Agent Platform - Models Command.
 *
 * Implements:
 *   melodie models
 *   melodie models sync
 *   melodie models search <query>
 *   melodie models inspect <model>
 *   melodie models test <model>
 */

import type { parseArgs } from '../args.ts';
import { heading, line, table, style, fail } from '../output.ts';
import { loadModelRegistry, findModel, searchModels, saveModelRegistry } from '../models/registry.ts';
import { syncModelsFromOpenRouter } from '../models/sync.ts';
import { providerManager } from '../providers/manager.ts';

export async function runModels(args: ReturnType<typeof parseArgs>): Promise<void> {
  const jsonMode = args.flags.has('json');
  const sub = args.positionals[0];

  // 1. melodie models sync
  if (sub === 'sync') {
    heading('Model Catalog Synchronization');
    line(style.dim('Syncing dynamic catalog metadata from OpenRouter API...\n'));

    const result = await syncModelsFromOpenRouter();
    if (jsonMode) {
      line(JSON.stringify(result, null, 2));
      return;
    }

    if (result.ok) {
      line(style.green(`Sync successful: ${result.message}`));
    } else {
      line(style.yellow(`Sync notice: ${result.message}`));
    }
    return;
  }

  // 2. melodie models search <query>
  if (sub === 'search') {
    const query = args.positionals[1];
    if (!query) {
      fail('Search requires a query: melodie models search <query>');
      process.exitCode = 1;
      return;
    }

    const matches = searchModels(query);
    if (jsonMode) {
      line(JSON.stringify(matches, null, 2));
      return;
    }

    heading(`Model Search Results for "${query}" (${matches.length} matches)`);
    if (matches.length === 0) {
      line(style.dim('No models found matching query.'));
      return;
    }

    const rows = matches.map((m) => [
      m.id,
      m.provider,
      m.family,
      m.capabilities.join(','),
      String(m.context_window),
      m.status,
    ]);
    table(rows, ['Model ID', 'Provider', 'Family', 'Capabilities', 'Context', 'Status']);
    return;
  }

  // 3. melodie models inspect <model>
  if (sub === 'inspect') {
    const modelId = args.positionals[1];
    if (!modelId) {
      fail('Inspect requires a model ID: melodie models inspect <model>');
      process.exitCode = 1;
      return;
    }

    const model = findModel(modelId);
    if (!model) {
      fail(`Model not found in registry: ${modelId}`);
      process.exitCode = 1;
      return;
    }

    if (jsonMode) {
      line(JSON.stringify(model, null, 2));
      return;
    }

    heading(`Model Metadata: ${model.id}`);
    line(`Provider:            ${model.provider}`);
    line(`Family:              ${model.family}`);
    line(`Capabilities:        ${model.capabilities.join(', ')}`);
    line(`Context Window:      ${model.context_window.toLocaleString()} tokens`);
    line(`Pricing (Input):     ${model.pricing.input !== null ? `$${model.pricing.input}/1K` : 'Dynamic/Unknown'}`);
    line(`Pricing (Output):    ${model.pricing.output !== null ? `$${model.pricing.output}/1K` : 'Dynamic/Unknown'}`);
    line(`Source:              ${model.source}`);
    line(`Status:              ${model.status}`);
    line(`Credential Required: ${model.credential_required ? 'Yes' : 'No'}`);
    line(`Runtime Verified:    ${model.runtime_verified ? style.green('Yes') : style.yellow('No (UNVERIFIED)')}`);
    if (model.description) {
      line(`Description:         ${style.dim(model.description)}`);
    }
    line();
    line(style.dim('Note: Catalog entry does not imply connected provider or successful inference.'));
    return;
  }

  // 4. melodie models test <model>
  if (sub === 'test') {
    const modelId = args.positionals[1];
    if (!modelId) {
      fail('Test requires a model ID: melodie models test <model>');
      process.exitCode = 1;
      return;
    }

    const model = findModel(modelId);
    if (!model) {
      fail(`Model not found: ${modelId}`);
      process.exitCode = 1;
      return;
    }

    heading(`Testing Model Inference: ${model.id}`);
    const adapter = providerManager.getAdapter(model.provider) || providerManager.getAdapter(model.source);

    if (!adapter) {
      fail(`No provider adapter available for provider '${model.provider}'.`);
      process.exitCode = 1;
      return;
    }

    if (!adapter.isConfigured() && model.provider !== 'local') {
      line(style.yellow(`Provider '${model.provider}' is unconfigured (missing API key in environment).`));
      line(style.dim(`To test live inference, set ${adapter.envKey || 'provider API key'}.`));
      if (jsonMode) {
        line(JSON.stringify({ ok: false, status: 'UNCONFIGURED', model: model.id }, null, 2));
      }
      return;
    }

    try {
      line(`Executing inference test probe with ${adapter.displayName}...`);
      const res = await adapter.chat({
        model: model.id,
        messages: [{ role: 'user', content: 'Melodie platform verification test: respond with OK.' }],
      });

      // Update model runtime verification state
      const registry = loadModelRegistry();
      const target = registry.models.find((m) => m.id === model.id);
      if (target) {
        target.runtime_verified = true;
        target.status = 'OPERATIONAL';
        saveModelRegistry(registry);
      }

      line(style.green(`Inference succeeded in ${res.durationMs}ms.`));
      line(`Response: ${style.dim(res.content.slice(0, 100))}`);
      line(style.green(`Model ${model.id} is now runtime_verified: true`));

      if (jsonMode) {
        line(JSON.stringify({ ok: true, durationMs: res.durationMs, model: model.id }, null, 2));
      }
    } catch (err) {
      fail(`Inference test failed: ${(err as Error).message}`);
      process.exitCode = 1;
    }
    return;
  }

  // 5. Default: melodie models [list]
  const registry = loadModelRegistry();
  if (jsonMode) {
    line(JSON.stringify(registry, null, 2));
    return;
  }

  heading(`Model Registry (${registry.models.length} models)`);
  line(style.dim('Discovered and synced AI model catalog entries.\n'));

  const rows = registry.models.map((m) => [
    m.id,
    m.provider,
    m.family,
    m.capabilities.slice(0, 3).join(','),
    String(m.context_window),
    m.runtime_verified ? style.green('VERIFIED') : style.yellow(m.status),
  ]);

  table(rows, ['Model ID', 'Provider', 'Family', 'Capabilities', 'Context', 'Status']);
  line();
  line(style.dim('Run `melodie models sync` to discover latest models from OpenRouter.'));
  line(style.dim('Run `melodie models inspect <id>` for pricing and context details.'));
}
