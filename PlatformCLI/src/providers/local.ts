/**
 * Local Deterministic Provider Adapter.
 *
 * Provides safe, offline, zero-credential execution for automated testing,
 * verified code generation, and smoke tests.
 */

import type {
  ProviderAdapter,
  HealthCheckResult,
  ChatRequest,
  ChatResponse,
  CostEstimate,
  ProviderCapabilities,
} from './adapter.ts';
import type { ModelEntry } from '../models/types.ts';
import { loadModelRegistry } from '../models/registry.ts';

export class LocalAdapter implements ProviderAdapter {
  readonly name = 'local';
  readonly displayName = 'Local Deterministic Engine';
  readonly baseUrl = null;
  readonly envKey = null;

  isConfigured(): boolean {
    return true;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      ok: true,
      status: 'OPERATIONAL',
      latencyMs: 1,
      configured: true,
      reachable: true,
      message: 'Local mock provider is active and operational on tested paths.',
    };
  }

  async listModels(): Promise<ModelEntry[]> {
    const registry = loadModelRegistry();
    return registry.models.filter((m) => m.provider === 'local');
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const lastUser = [...req.messages].reverse().find((m) => m.role === 'user')?.content || '';

    let content = `[LOCAL ENGINE RESPONSE] Processed prompt (${req.messages.length} messages).`;
    if (lastUser.toLowerCase().includes('plan')) {
      content = JSON.stringify({
        summary: 'Deconstructed coding task plan',
        steps: [
          'Inspect project files and configuration',
          'Formulate targeted code patch',
          'Run tests and assert zero regressions',
          'Record execution evidence',
        ],
      }, null, 2);
    } else if (lastUser.toLowerCase().includes('code')) {
      content = '// Local generated code patch\nexport function patchApplied(): boolean { return true; }\n';
    } else if (lastUser.toLowerCase().includes('review')) {
      content = 'Code review: Pass. No security violations or secret leakage detected.';
    }

    return {
      id: `local-exec-${Date.now()}`,
      model: req.model,
      content,
      usage: {
        promptTokens: 50,
        completionTokens: 80,
        totalTokens: 130,
      },
      durationMs: Date.now() - start,
    };
  }

  estimateCost(): CostEstimate {
    return {
      inputCostUsd: 0,
      outputCostUsd: 0,
      totalCostUsd: 0,
      currency: 'USD',
    };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      streaming: false,
      tools: true,
      embeddings: true,
      vision: false,
      local: true,
    };
  }
}
