/**
 * Dynamic Model Catalog Synchronization.
 *
 * Discovers and syncs live model catalog metadata from OpenRouter API
 * rather than hard-coding historical lists.
 *
 * Enforces:
 *   CATALOG ENTRY != CONNECTED PROVIDER != SUCCESSFUL INFERENCE != PRODUCTION READY
 */

import type { ModelEntry, ModelCapability, ModelRegistryData } from './types.ts';
import { loadModelRegistry, saveModelRegistry } from './registry.ts';

export interface SyncResult {
  ok: boolean;
  source: string;
  modelsFound: number;
  modelsUpdated: number;
  timestamp: string;
  message: string;
  error?: string;
}

interface OpenRouterRawModel {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
}

export function parseFamily(id: string): string {
  const lower = id.toLowerCase();
  if (lower.includes('gpt') || lower.includes('o1') || lower.includes('o3')) return 'GPT';
  if (lower.includes('claude')) return 'Claude';
  if (lower.includes('gemini')) return 'Gemini';
  if (lower.includes('llama')) return 'Llama';
  if (lower.includes('mistral') || lower.includes('codestral')) return 'Mistral';
  if (lower.includes('deepseek')) return 'DeepSeek';
  if (lower.includes('qwen')) return 'Qwen';
  if (lower.includes('gemma')) return 'Gemma';
  if (lower.includes('phi')) return 'Phi';
  if (lower.includes('router') || lower.includes('auto')) return 'AutoRouter';
  return 'General';
}

export function inferCapabilities(raw: OpenRouterRawModel): ModelCapability[] {
  const caps: ModelCapability[] = ['chat'];
  const text = `${raw.id} ${raw.name || ''} ${raw.description || ''}`.toLowerCase();

  if (text.includes('code') || text.includes('coder') || text.includes('coding') || text.includes('program')) {
    caps.push('code');
  }
  if (text.includes('vision') || text.includes('multimodal') || text.includes('image') || raw.architecture?.modality?.includes('image')) {
    caps.push('vision');
  }
  if (text.includes('tool') || text.includes('function') || text.includes('instruct') || text.includes('turbo') || text.includes('claude-3') || text.includes('gpt-4')) {
    caps.push('tools');
  }
  if (text.includes('reason') || text.includes('thought') || text.includes('o1') || text.includes('o3') || text.includes('deepseek-r1')) {
    caps.push('reasoning');
  }
  caps.push('streaming');
  return [...new Set(caps)];
}

export async function syncModelsFromOpenRouter(apiKey?: string): Promise<SyncResult> {
  const currentRegistry = loadModelRegistry();
  const timestamp = new Date().toISOString();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'MelodieCLI/0.1.0 (MelodieOS Agent Platform)',
  };

  const key = apiKey || process.env.OPENROUTER_API_KEY;
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        ok: false,
        source: 'openrouter',
        modelsFound: currentRegistry.models.length,
        modelsUpdated: 0,
        timestamp,
        message: `OpenRouter returned HTTP ${res.status} ${res.statusText}. Using existing verified/canonical registry.`,
      };
    }

    const payload = (await res.json()) as { data?: OpenRouterRawModel[] };
    const rawList = payload.data || [];

    if (!Array.isArray(rawList) || rawList.length === 0) {
      return {
        ok: false,
        source: 'openrouter',
        modelsFound: currentRegistry.models.length,
        modelsUpdated: 0,
        timestamp,
        message: 'No model entries received from OpenRouter. Registry preserved.',
      };
    }

    // Existing map by ID
    const existingMap = new Map(currentRegistry.models.map((m) => [m.id, m]));
    let updatedCount = 0;

    for (const raw of rawList) {
      const parts = raw.id.split('/');
      const provider = parts.length > 1 ? parts[0] : 'openrouter';
      const promptPrice = raw.pricing?.prompt ? parseFloat(raw.pricing.prompt) : null;
      const completionPrice = raw.pricing?.completion ? parseFloat(raw.pricing.completion) : null;

      const existing = existingMap.get(raw.id);
      const entry: ModelEntry = {
        id: raw.id,
        provider: provider || 'unknown',
        family: parseFamily(raw.id),
        capabilities: inferCapabilities(raw),
        context_window: raw.context_length || raw.top_provider?.context_length || 128000,
        pricing: {
          input: Number.isFinite(promptPrice) ? promptPrice : null,
          output: Number.isFinite(completionPrice) ? completionPrice : null,
          currency: 'USD',
        },
        source: 'openrouter',
        // Critical governance rule: Dynamic entry in catalog is UNVERIFIED until connection/testing
        status: existing?.status || 'UNVERIFIED',
        credential_required: true,
        runtime_verified: existing?.runtime_verified || false,
        description: raw.description || raw.name || `Model ${raw.id} synced from OpenRouter`,
      };

      existingMap.set(raw.id, entry);
      updatedCount += 1;
    }

    const updatedModels = Array.from(existingMap.values());
    const newRegistryData: ModelRegistryData = {
      version: '1.0.0',
      updated_at: timestamp,
      source: 'openrouter-dynamic-sync',
      model_count: updatedModels.length,
      models: updatedModels,
    };

    saveModelRegistry(newRegistryData);

    return {
      ok: true,
      source: 'openrouter',
      modelsFound: updatedModels.length,
      modelsUpdated: updatedCount,
      timestamp,
      message: `Successfully synchronized ${updatedCount} models from OpenRouter catalog. Total in registry: ${updatedModels.length}.`,
    };
  } catch (err) {
    const errorMsg = (err as Error).message || String(err);
    return {
      ok: false,
      source: 'openrouter',
      modelsFound: currentRegistry.models.length,
      modelsUpdated: 0,
      timestamp,
      message: `Could not reach OpenRouter API (${errorMsg}). Canonical registry maintained.`,
      error: errorMsg,
    };
  }
}
