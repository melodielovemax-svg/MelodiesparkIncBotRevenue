/**
 * OpenRouter Provider Adapter.
 *
 * Implements OpenRouter's OpenAI-compatible gateway across models/providers.
 * Enforces: Credential isolation, timeout limits, and explicit health probe evidence.
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

export class OpenRouterAdapter implements ProviderAdapter {
  readonly name = 'openrouter';
  readonly displayName = 'OpenRouter Gateway';
  readonly baseUrl: string;
  readonly envKey = 'OPENROUTER_API_KEY';

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  }

  isConfigured(): boolean {
    const key = process.env.OPENROUTER_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  async healthCheck(): Promise<HealthCheckResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        status: 'UNVERIFIED',
        configured: false,
        reachable: false,
        message: 'OPENROUTER_API_KEY not configured. Set environment variable to enable live gateway.',
      };
    }

    const key = process.env.OPENROUTER_API_KEY!;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.baseUrl}/auth/key`, {
        headers: {
          Authorization: `Bearer ${key}`,
          'User-Agent': 'MelodieCLI/0.1.0',
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
          message: `Connected to OpenRouter (latency ${latencyMs}ms). Key verified.`,
        };
      }

      return {
        ok: false,
        status: 'BLOCKED',
        latencyMs,
        configured: true,
        reachable: false,
        message: `OpenRouter returned HTTP ${res.status}: ${res.statusText}`,
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
    return registry.models.filter((m) => m.source === 'openrouter');
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter is not configured. Set OPENROUTER_API_KEY.');
    }

    const start = Date.now();
    const key = process.env.OPENROUTER_API_KEY!;

    const payload: Record<string, unknown> = {
      model: req.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.max_tokens ?? 4096,
    };

    if (req.tools && req.tools.length > 0) {
      payload.tools = req.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'User-Agent': 'MelodieCLI/0.1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenRouter chat failed [${res.status}]: ${errorText}`);
    }

    const data = (await res.json()) as {
      id?: string;
      model?: string;
      choices?: Array<{
        message?: {
          content?: string;
          tool_calls?: Array<{
            id: string;
            function: { name: string; arguments: string };
          }>;
        };
      }>;
      usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };

    const choice = data.choices?.[0]?.message;
    const content = choice?.content ?? '';
    const toolCalls = choice?.tool_calls?.map((tc) => {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        args = { raw: tc.function.arguments };
      }
      return {
        id: tc.id,
        name: tc.function.name,
        arguments: args,
      };
    });

    return {
      id: data.id || `openrouter-${Date.now()}`,
      model: data.model || req.model,
      content,
      toolCalls,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      durationMs: Date.now() - start,
    };
  }

  estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate {
    const registry = loadModelRegistry();
    const entry = registry.models.find((m) => m.id === model);
    const inputRate = entry?.pricing.input ?? 0.003;
    const outputRate = entry?.pricing.output ?? 0.015;

    const inputCostUsd = (inputTokens / 1000) * inputRate;
    const outputCostUsd = (outputTokens / 1000) * outputRate;

    return {
      inputCostUsd,
      outputCostUsd,
      totalCostUsd: inputCostUsd + outputCostUsd,
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
