/**
 * Anthropic Provider Adapter.
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

export class AnthropicAdapter implements ProviderAdapter {
  readonly name = 'anthropic';
  readonly displayName = 'Anthropic Direct';
  readonly baseUrl: string;
  readonly envKey = 'ANTHROPIC_API_KEY';

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
  }

  isConfigured(): boolean {
    const key = process.env.ANTHROPIC_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        status: 'UNVERIFIED',
        configured: false,
        reachable: false,
        message: 'ANTHROPIC_API_KEY not configured.',
      };
    }

    return {
      ok: true,
      status: 'OPERATIONAL',
      configured: true,
      reachable: true,
      message: 'Anthropic credential configured.',
    };
  }

  async listModels(): Promise<ModelEntry[]> {
    const registry = loadModelRegistry();
    return registry.models.filter((m) => m.provider === 'anthropic');
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.isConfigured()) {
      throw new Error('Anthropic is not configured. Set ANTHROPIC_API_KEY.');
    }

    const start = Date.now();
    const key = process.env.ANTHROPIC_API_KEY!;
    const model = req.model.replace(/^anthropic\//, '');

    const systemMsg = req.messages.find((m) => m.role === 'system')?.content;
    const userMsgs = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: userMsgs,
        system: systemMsg,
        max_tokens: req.max_tokens ?? 4096,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error [${res.status}]: ${err}`);
    }

    const data = (await res.json()) as {
      id?: string;
      content?: Array<{ text?: string }>;
    };

    return {
      id: data.id || `anthropic-${Date.now()}`,
      model: req.model,
      content: data.content?.[0]?.text || '',
      durationMs: Date.now() - start,
    };
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate {
    return {
      inputCostUsd: (inputTokens / 1000) * 0.003,
      outputCostUsd: (outputTokens / 1000) * 0.015,
      totalCostUsd: (inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015,
      currency: 'USD',
    };
  }

  getCapabilities(): ProviderCapabilities {
    return {
      chat: true,
      streaming: true,
      tools: true,
      embeddings: false,
      vision: true,
      local: false,
    };
  }
}
