/**
 * Melodie CLI Agent Platform - Model Registry Types.
 *
 * Distinguishes:
 *   CATALOG ENTRY != CONNECTED PROVIDER != SUCCESSFUL INFERENCE != PRODUCTION READY
 */

export type ModelCapability =
  | 'chat'
  | 'code'
  | 'vision'
  | 'tools'
  | 'embeddings'
  | 'streaming'
  | 'reasoning'
  | 'structured_outputs'
  | 'local_private';

export type ModelStatus =
  | 'OPERATIONAL'
  | 'SCAFFOLD'
  | 'PLANNED'
  | 'BLOCKED'
  | 'UNVERIFIED'
  | 'FICTIONAL';

export interface ModelPricing {
  input: number | null;
  output: number | null;
  currency: string;
}

export interface ModelEntry {
  id: string;
  provider: string;
  family: string;
  capabilities: ModelCapability[];
  context_window: number;
  pricing: ModelPricing;
  source: 'openrouter' | 'direct' | 'local' | 'catalog';
  status: ModelStatus;
  credential_required: boolean;
  runtime_verified: boolean;
  description?: string;
}

export interface ModelRegistryData {
  version: string;
  updated_at: string;
  source: string;
  model_count: number;
  models: ModelEntry[];
}

export interface ProviderConfig {
  id: string;
  name: string;
  displayName: string;
  type: 'gateway' | 'direct' | 'local' | 'mock';
  baseUrl: string | null;
  envKey: string | null;
  capabilities: string[];
  status: ModelStatus;
  isConfigured: boolean;
  isReachable: boolean;
  supportsDynamicCatalog: boolean;
  notes?: string;
}

export interface ProvidersData {
  version: string;
  updated_at: string;
  providers: ProviderConfig[];
}
