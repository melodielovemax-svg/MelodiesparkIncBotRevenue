/**
 * Ollama Local Provider Adapter.
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

export class OllamaAdapter implements ProviderAdapter {
  readonly name = 'ollama';
  readonly displayName = 'Ollama Local Daemon';
  readonly baseUrl: string;
  readonly envKey = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  }

  isConfigured(): boolean {
    return true; // Local service needs no secret key by default
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const latencyMs = Date.now() - start;

      if (res.ok) {
        return {
          ok: true,
          status: 'OPERATIONAL',
          latencyMs,
          configured: true,
          reachable: true,
          message: `Connected to Ollama daemon on ${this.baseUrl} (${latencyMs}ms).`,
        };
      }

      return {
        ok: false,
        status: 'UNVERIFIED',
        latencyMs,
        configured: true,
        reachable: false,
        message: `Ollama returned HTTP ${res.status}`,
      };
    } catch {
      return {
        ok: false,
        status: 'UNVERIFIED',
        configured: true,
        reachable: false,
        message: `Ollama daemon not reachable on ${this.baseUrl}. Is Ollama running?`,
      };
    }
  }

  async listModels(): Promise<ModelEntry[]> {
    const registry = loadModelRegistry();
    return registry.models.filter((m) => m.provider === 'ollama');
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const start = Date.now();
    const model = req.model.replace(/^ollama\//, '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: req.messages,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Ollama chat error [${res.status}]: ${await res.text()}`);
    }

    const data = (await res.json()) as { message?: { content?: string } };
    return {
      id: `ollama-${Date.now()}`,
      model: req.model,
      content: data.message?.content || '',
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
      streaming: true,
      tools: false,
      embeddings: true,
      vision: false,
      local: true,
    };
  }
}
