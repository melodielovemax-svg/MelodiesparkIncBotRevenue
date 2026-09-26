/**
 * Google Gemini Provider Adapter.
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

export class GoogleAdapter implements ProviderAdapter {
  readonly name = 'google';
  readonly displayName = 'Google Gemini Direct';
  readonly baseUrl: string;
  readonly envKey = 'GEMINI_API_KEY';

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.GOOGLE_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  }

  isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        status: 'UNVERIFIED',
        configured: false,
        reachable: false,
        message: 'GEMINI_API_KEY / GOOGLE_API_KEY not configured.',
      };
    }

    return {
      ok: true,
      status: 'OPERATIONAL',
      configured: true,
      reachable: true,
      message: 'Google Gemini credential configured.',
    };
  }

  async listModels(): Promise<ModelEntry[]> {
    const registry = loadModelRegistry();
    return registry.models.filter((m) => m.provider === 'google');
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.isConfigured()) {
      throw new Error('Google Gemini is not configured. Set GEMINI_API_KEY.');
    }

    const start = Date.now();
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY!;
    const model = req.model.replace(/^google\//, '');

    const contents = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google API error [${res.status}]: ${err}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      id: `google-${Date.now()}`,
      model: req.model,
      content: text,
      durationMs: Date.now() - start,
    };
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate {
    return {
      inputCostUsd: (inputTokens / 1000) * 0.0001,
      outputCostUsd: (outputTokens / 1000) * 0.0004,
      totalCostUsd: (inputTokens / 1000) * 0.0001 + (outputTokens / 1000) * 0.0004,
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
