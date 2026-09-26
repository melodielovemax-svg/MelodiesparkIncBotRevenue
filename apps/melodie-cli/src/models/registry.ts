/**
 * Melodie CLI Agent Platform - Model Registry Manager.
 *
 * Enforces:
 *   CATALOG ENTRY != CONNECTED PROVIDER != SUCCESSFUL INFERENCE != PRODUCTION READY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ModelEntry, ModelRegistryData } from './types.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..', '..');
const CANONICAL_REGISTRY_PATH = path.join(PACKAGE_ROOT, 'models', 'registry.json');

export const DEFAULT_CANONICAL_MODELS: ModelEntry[] = [
  {
    id: 'openai/gpt-4-turbo',
    provider: 'openai',
    family: 'GPT',
    capabilities: ['chat', 'code', 'vision', 'tools', 'structured_outputs'],
    context_window: 128000,
    pricing: { input: 0.01, output: 0.03, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'OpenAI GPT-4 Turbo multimodal coding & reasoning model.',
  },
  {
    id: 'openai/gpt-4o',
    provider: 'openai',
    family: 'GPT',
    capabilities: ['chat', 'code', 'vision', 'tools', 'streaming', 'structured_outputs'],
    context_window: 128000,
    pricing: { input: 0.0025, output: 0.01, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'High-speed flagship multimodal model.',
  },
  {
    id: 'openai/gpt-4o-mini',
    provider: 'openai',
    family: 'GPT',
    capabilities: ['chat', 'code', 'vision', 'tools', 'streaming', 'structured_outputs'],
    context_window: 128000,
    pricing: { input: 0.00015, output: 0.0006, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'Fast, lightweight cost-efficient model.',
  },
  {
    id: 'anthropic/claude-3-5-sonnet',
    provider: 'anthropic',
    family: 'Claude',
    capabilities: ['chat', 'code', 'vision', 'tools', 'streaming', 'reasoning'],
    context_window: 200000,
    pricing: { input: 0.003, output: 0.015, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'Anthropic state-of-the-art coding and reasoning model.',
  },
  {
    id: 'anthropic/claude-3-opus',
    provider: 'anthropic',
    family: 'Claude',
    capabilities: ['chat', 'code', 'vision', 'tools', 'reasoning'],
    context_window: 200000,
    pricing: { input: 0.015, output: 0.075, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'High complexity analysis and reasoning model.',
  },
  {
    id: 'anthropic/claude-3-5-haiku',
    provider: 'anthropic',
    family: 'Claude',
    capabilities: ['chat', 'code', 'tools', 'streaming'],
    context_window: 200000,
    pricing: { input: 0.0008, output: 0.004, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'Fast, cost-effective Claude model for coding tasks.',
  },
  {
    id: 'google/gemini-2.0-flash',
    provider: 'google',
    family: 'Gemini',
    capabilities: ['chat', 'code', 'vision', 'tools', 'streaming'],
    context_window: 1048576,
    pricing: { input: 0.0001, output: 0.0004, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'Next-generation multimodal model with ultra-fast latency.',
  },
  {
    id: 'google/gemini-1.5-pro',
    provider: 'google',
    family: 'Gemini',
    capabilities: ['chat', 'code', 'vision', 'tools', 'reasoning'],
    context_window: 2097152,
    pricing: { input: 0.00125, output: 0.005, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'Ultra-long 2M context window model for deep repository analysis.',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    provider: 'meta',
    family: 'Llama',
    capabilities: ['chat', 'code', 'tools', 'streaming'],
    context_window: 131072,
    pricing: { input: 0.0004, output: 0.0004, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'Open-weights flagship Llama 3.3 instruction model.',
  },
  {
    id: 'deepseek/deepseek-chat',
    provider: 'deepseek',
    family: 'DeepSeek',
    capabilities: ['chat', 'code', 'reasoning', 'streaming'],
    context_window: 64000,
    pricing: { input: 0.00014, output: 0.00028, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'General language and code intelligence model.',
  },
  {
    id: 'deepseek/deepseek-coder',
    provider: 'deepseek',
    family: 'DeepSeek',
    capabilities: ['chat', 'code', 'tools', 'streaming'],
    context_window: 128000,
    pricing: { input: 0.00014, output: 0.00028, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'Specialized code generation and editing model.',
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct',
    provider: 'qwen',
    family: 'Qwen',
    capabilities: ['chat', 'code', 'tools', 'streaming'],
    context_window: 131072,
    pricing: { input: 0.0002, output: 0.0002, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'High-capability open-weights code specialist model.',
  },
  {
    id: 'openrouter/auto',
    provider: 'openrouter',
    family: 'AutoRouter',
    capabilities: ['chat', 'code', 'tools', 'streaming'],
    context_window: 128000,
    pricing: { input: null, output: null, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'OpenRouter Auto Router dynamically routing across top providers.',
  },
  {
    id: 'openrouter/flavor-pareto-code',
    provider: 'openrouter',
    family: 'ParetoRouter',
    capabilities: ['chat', 'code', 'tools', 'streaming'],
    context_window: 128000,
    pricing: { input: null, output: null, currency: 'USD' },
    source: 'openrouter',
    status: 'UNVERIFIED',
    credential_required: true,
    runtime_verified: false,
    description: 'OpenRouter Pareto Code Router optimizing cost vs coding capability.',
  },
  {
    id: 'ollama/codellama',
    provider: 'ollama',
    family: 'CodeLlama',
    capabilities: ['chat', 'code', 'local_private'],
    context_window: 16384,
    pricing: { input: 0, output: 0, currency: 'USD' },
    source: 'local',
    status: 'UNVERIFIED',
    credential_required: false,
    runtime_verified: false,
    description: 'Local private Ollama CodeLlama instance.',
  },
  {
    id: 'local/mock-coder',
    provider: 'local',
    family: 'MockEngine',
    capabilities: ['chat', 'code', 'tools', 'local_private'],
    context_window: 32768,
    pricing: { input: 0, output: 0, currency: 'USD' },
    source: 'local',
    status: 'OPERATIONAL',
    credential_required: false,
    runtime_verified: true,
    description: 'Deterministic local mock coding model for testing and offline verification.',
  },
];

export function getRegistryPath(): string {
  return process.env.MELODIESPARK_MODELS_REGISTRY || CANONICAL_REGISTRY_PATH;
}

export function loadModelRegistry(): ModelRegistryData {
  const filePath = getRegistryPath();
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ModelRegistryData;
      return data;
    } catch {
      // Fallback if corrupt
    }
  }

  // Initial seed
  const initialData: ModelRegistryData = {
    version: '1.0.0',
    updated_at: new Date().toISOString(),
    source: 'canonical-seed',
    model_count: DEFAULT_CANONICAL_MODELS.length,
    models: DEFAULT_CANONICAL_MODELS,
  };
  saveModelRegistry(initialData);
  return initialData;
}

export function saveModelRegistry(data: ModelRegistryData): void {
  const filePath = getRegistryPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function findModel(modelId: string): ModelEntry | undefined {
  const registry = loadModelRegistry();
  return registry.models.find(
    (m) => m.id.toLowerCase() === modelId.toLowerCase() || m.id.endsWith(`/${modelId}`)
  );
}

export function searchModels(query: string): ModelEntry[] {
  const registry = loadModelRegistry();
  const q = query.toLowerCase();
  return registry.models.filter(
    (m) =>
      m.id.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.family.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q)) ||
      m.capabilities.some((c) => c.toLowerCase().includes(q))
  );
}
