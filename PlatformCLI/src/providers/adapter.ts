/**
 * Melodie CLI Agent Platform - Provider Architecture Interface.
 *
 * All adapters implement the same ProviderAdapter interface.
 * Credentials come strictly from environment variables or a secret store.
 * Never source code, database seed, git repository, frontend bundle, or agent prompt.
 */

import type { ModelEntry } from '../models/types.ts';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  tools?: ToolDefinition[];
  stream?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatResponse {
  id: string;
  model: string;
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface ChatChunk {
  delta: string;
  done: boolean;
}

export interface HealthCheckResult {
  ok: boolean;
  status: 'OPERATIONAL' | 'UNVERIFIED' | 'BLOCKED' | 'SCAFFOLD';
  latencyMs?: number;
  message: string;
  configured: boolean;
  reachable: boolean;
}

export interface CostEstimate {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  currency: string;
}

export interface ProviderCapabilities {
  chat: boolean;
  streaming: boolean;
  tools: boolean;
  embeddings: boolean;
  vision: boolean;
  local: boolean;
}

export interface ProviderAdapter {
  readonly name: string;
  readonly displayName: string;
  readonly baseUrl: string | null;
  readonly envKey: string | null;

  isConfigured(): boolean;
  healthCheck(): Promise<HealthCheckResult>;
  listModels(): Promise<ModelEntry[]>;
  chat(req: ChatRequest): Promise<ChatResponse>;
  stream?(req: ChatRequest): AsyncIterable<ChatChunk>;
  estimateCost(model: string, inputTokens: number, outputTokens: number): CostEstimate;
  getCapabilities(model?: string): ProviderCapabilities;
}
