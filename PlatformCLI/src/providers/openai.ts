/**
 * OpenAI Provider Adapter.
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

export class OpenAIAdapter implements ProviderAdapter {
  readonly name = 'openai';
  readonly displayName = 'OpenAI Direct';
  readonly baseUrl: string;
  readonly envKey = 'OPENAI_API_KEY';

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  isConfigured(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        status: 'UNVERIFIED',
        configured: false,
        reachable: false,
        message: 'OPENAI_API_KEY not set.',
      };
    }

    const key = process.env.OPENAI_API_KEY!;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${key}`,
        },
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
          message: `Connected to OpenAI API (latency ${latencyMs}ms).`,
        };
      }

      return {
        ok: false,
        status: 'BLOCKED',
        latencyMs,
        configured: true,
        reachable: false,
        message: `OpenAI returned HTTP ${res.status}: ${res.statusText}`,
      };
    } catch (err) {
      return {
        ok: false,
        status: 'UNVERIFIED',
        latencyMs: Date.now() - start,
        configured: true,
        reachable: false,
        message: `Connection failed: ${(err as Error).message}`,
      };
    }
  }

  async listModels(): Promise<ModelEntry[]> {
    const registry = loadModelRegistry();
    return registry.models.filter((m) => m.provider === 'openai');
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI is not configured. Set OPENAI_API_KEY.');
    }

    const start = Date.now();
    const key = process.env.OPENAI_API_KEY!;
    const model = req.model.replace(/^openai\//, '');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI chat error [${res.status}]: ${err}`);
    }

    const data = (await res.json()) as {
      id?: string;
      choices?: Array<{ message?: { content?: string } }>;
    };

    return {
      id: data.id || `openai-${Date.now()}`,
      model: req.model,
      content: data.choices?.[0]?.message?.content || '',
      durationMs: Date.now() - start,
    };
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate {
    return {
      inputCostUsd: (inputTokens / 1000) * 0.0025,
      outputCostUsd: (outputTokens / 1000) * 0.01,
      totalCostUsd: (inputTokens / 1000) * 0.0025 + (outputTokens / 1000) * 0.01,
      currency: 'USD',
    };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      streaming: true,
      tools: true,
      embeddings: true,
      vision: true,
      local: false,
    };
  }
}
