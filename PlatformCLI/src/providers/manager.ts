/**
 * Melodie CLI Agent Platform - Provider Manager.
 *
 * Manages provider adapters, status checking, and credential resolution.
 * Never leaks raw secrets or persists credentials in repositories.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ProviderAdapter, HealthCheckResult } from './adapter.ts';
import type { ProviderConfig, ProvidersData } from '../models/types.ts';
import { OpenRouterAdapter } from './openrouter.ts';
import { OpenAIAdapter } from './openai.ts';
import { AnthropicAdapter } from './anthropic.ts';
import { GoogleAdapter } from './google.ts';
import { OllamaAdapter } from './ollama.ts';
import { LocalAdapter } from './local.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..', '..');
const CANONICAL_PROVIDERS_PATH = path.join(PACKAGE_ROOT, 'models', 'providers.json');

export const DEFAULT_PROVIDERS_CONFIG: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'openrouter',
    displayName: 'OpenRouter Unified Gateway',
    type: 'gateway',
    baseUrl: 'https://openrouter.ai/api/v1',
    envKey: 'OPENROUTER_API_KEY',
    capabilities: ['chat', 'streaming', 'tools', 'routing', 'fallbacks'],
    status: 'UNVERIFIED',
    isConfigured: false,
    isReachable: false,
    supportsDynamicCatalog: true,
    notes: 'Primary gateway for multi-model access and dynamic catalog sync.',
  },
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI Direct API',
    type: 'direct',
    baseUrl: 'https://api.openai.com/v1',
    envKey: 'OPENAI_API_KEY',
    capabilities: ['chat', 'streaming', 'tools', 'embeddings', 'structured_outputs'],
    status: 'UNVERIFIED',
    isConfigured: false,
    isReachable: false,
    supportsDynamicCatalog: false,
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic Direct API',
    type: 'direct',
    baseUrl: 'https://api.anthropic.com/v1',
    envKey: 'ANTHROPIC_API_KEY',
    capabilities: ['chat', 'streaming', 'tools', 'reasoning'],
    status: 'UNVERIFIED',
    isConfigured: false,
    isReachable: false,
    supportsDynamicCatalog: false,
  },
  {
    id: 'google',
    name: 'google',
    displayName: 'Google Gemini Direct API',
    type: 'direct',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    envKey: 'GEMINI_API_KEY',
    capabilities: ['chat', 'streaming', 'tools', 'vision'],
    status: 'UNVERIFIED',
    isConfigured: false,
    isReachable: false,
    supportsDynamicCatalog: false,
  },
  {
    id: 'ollama',
    name: 'ollama',
    displayName: 'Ollama Local Daemon',
    type: 'local',
    baseUrl: 'http://127.0.0.1:11434',
    envKey: null,
    capabilities: ['chat', 'streaming', 'tools', 'local_private'],
    status: 'UNVERIFIED',
    isConfigured: true,
    isReachable: false,
    supportsDynamicCatalog: false,
  },
  {
    id: 'local',
    name: 'local',
    displayName: 'Local Mock Deterministic Engine',
    type: 'mock',
    baseUrl: null,
    envKey: null,
    capabilities: ['chat', 'tools', 'offline_testing'],
    status: 'OPERATIONAL',
    isConfigured: true,
    isReachable: true,
    supportsDynamicCatalog: false,
  },
];

export class ProviderManager {
  private adapters: Map<string, ProviderAdapter> = new Map();

  constructor() {
    this.registerAdapter(new OpenRouterAdapter());
    this.registerAdapter(new OpenAIAdapter());
    this.registerAdapter(new AnthropicAdapter());
    this.registerAdapter(new GoogleAdapter());
    this.registerAdapter(new OllamaAdapter());
    this.registerAdapter(new LocalAdapter());
  }

  registerAdapter(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
  }

  getAdapter(name: string): ProviderAdapter | undefined {
    return this.adapters.get(name.toLowerCase());
  }

  getProvidersPath(): string {
    return process.env.MELODIESPARK_PROVIDERS_CONFIG || CANONICAL_PROVIDERS_PATH;
  }

  loadProvidersData(): ProvidersData {
    const filePath = this.getProvidersPath();
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ProvidersData;
      } catch {
        // Fallback
      }
    }

    const initial: ProvidersData = {
      version: '1.0.0',
      updated_at: new Date().toISOString(),
      providers: DEFAULT_PROVIDERS_CONFIG,
    };
    this.saveProvidersData(initial);
    return initial;
  }

  saveProvidersData(data: ProvidersData): void {
    const filePath = this.getProvidersPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  listConfigs(): ProviderConfig[] {
    const data = this.loadProvidersData();
    return data.providers.map((p) => {
      const adapter = this.adapters.get(p.name.toLowerCase());
      const isConfigured = adapter ? adapter.isConfigured() : false;
      return {
        ...p,
        isConfigured,
      };
    });
  }

  async verifyProvider(name: string): Promise<HealthCheckResult & { provider: string }> {
    const adapter = this.getAdapter(name);
    if (!adapter) {
      return {
        provider: name,
        ok: false,
        status: 'UNVERIFIED',
        configured: false,
        reachable: false,
        message: `Unknown provider adapter: ${name}`,
      };
    }

    const check = await adapter.healthCheck();
    // Update providers.json status
    const data = this.loadProvidersData();
    const target = data.providers.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (target) {
      target.status = check.status;
      target.isConfigured = check.configured;
      target.isReachable = check.reachable;
      data.updated_at = new Date().toISOString();
      this.saveProvidersData(data);
    }

    return {
      provider: name,
      ...check,
    };
  }

  addProvider(config: ProviderConfig): void {
    const data = this.loadProvidersData();
    const idx = data.providers.findIndex((p) => p.name.toLowerCase() === config.name.toLowerCase());
    if (idx >= 0) {
      data.providers[idx] = config;
    } else {
      data.providers.push(config);
    }
    data.updated_at = new Date().toISOString();
    this.saveProvidersData(data);
  }

  removeProvider(name: string): boolean {
    const data = this.loadProvidersData();
    const initialLen = data.providers.length;
    data.providers = data.providers.filter((p) => p.name.toLowerCase() !== name.toLowerCase());
    if (data.providers.length !== initialLen) {
      data.updated_at = new Date().toISOString();
      this.saveProvidersData(data);
      return true;
    }
    return false;
  }
}

export const providerManager = new ProviderManager();
