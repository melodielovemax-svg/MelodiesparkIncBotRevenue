/**
 * Intelligent Model Router.
 *
 * Classifies tasks across:
 *   CODE, REASONING, DEBUGGING, SECURITY, DOCUMENTATION,
 *   FAST_CHAT, LONG_CONTEXT, VISION, LOCAL_PRIVATE.
 *
 * Resolves optimal model candidates based on requirements, cost policies,
 * provider verification states, and fallback chains.
 */

import type { ModelEntry } from '../models/types.ts';
import { loadModelRegistry } from '../models/registry.ts';
import { providerManager } from '../providers/manager.ts';

export type TaskCategory =
  | 'code'
  | 'reasoning'
  | 'debugging'
  | 'security'
  | 'documentation'
  | 'fast_chat'
  | 'long_context'
  | 'vision'
  | 'local_private';

export interface RoutingRequirements {
  tools?: boolean;
  structured_output?: boolean;
  minimum_context?: number;
  local_only?: boolean;
  vision?: boolean;
  max_cost_usd?: number;
  human_approval?: boolean;
}

export interface RoutingPolicy {
  task: TaskCategory;
  requirements: RoutingRequirements;
  preferred_models: string[];
  fallbacks: string[];
}

export interface RouteResolution {
  task: TaskCategory;
  selectedModel: string;
  provider: string;
  isVerified: boolean;
  isConfigured: boolean;
  reasons: string[];
  fallbacks: string[];
}

export class ModelRouter {
  classifyTask(prompt: string): TaskCategory {
    const text = prompt.toLowerCase();

    if (text.includes('security') || text.includes('vulnerability') || text.includes('leak') || text.includes('audit')) {
      return 'security';
    }
    if (text.includes('debug') || text.includes('fix bug') || text.includes('exception') || text.includes('error')) {
      return 'debugging';
    }
    if (
      text.includes('function') ||
      text.includes('class') ||
      text.includes('refactor') ||
      text.includes('typescript') ||
      text.includes('python') ||
      text.includes('implement') ||
      text.includes('code')
    ) {
      return 'code';
    }
    if (text.includes('prove') || text.includes('analyze logic') || text.includes('complex algorithm') || text.includes('reason')) {
      return 'reasoning';
    }
    if (text.includes('readme') || text.includes('documentation') || text.includes('spec') || text.includes('markdown')) {
      return 'documentation';
    }
    if (text.includes('large file') || text.includes('entire repository') || text.includes('monorepo analysis')) {
      return 'long_context';
    }
    if (text.includes('image') || text.includes('screenshot') || text.includes('ui mock') || text.includes('diagram')) {
      return 'vision';
    }
    if (text.includes('private') || text.includes('offline') || text.includes('local only') || text.includes('no cloud')) {
      return 'local_private';
    }

    return 'fast_chat';
  }

  getPolicyForTask(task: TaskCategory): RoutingPolicy {
    switch (task) {
      case 'code':
      case 'debugging':
        return {
          task,
          requirements: { tools: true, structured_output: true, minimum_context: 64000 },
          preferred_models: [
            'anthropic/claude-3-5-sonnet',
            'openai/gpt-4o',
            'qwen/qwen-2.5-coder-32b-instruct',
            'openrouter/flavor-pareto-code',
          ],
          fallbacks: ['deepseek/deepseek-coder', 'ollama/codellama', 'local/mock-coder'],
        };
      case 'security':
        return {
          task,
          requirements: { tools: true, structured_output: true, minimum_context: 128000 },
          preferred_models: [
            'anthropic/claude-3-5-sonnet',
            'openai/gpt-4-turbo',
            'anthropic/claude-3-opus',
          ],
          fallbacks: ['openai/gpt-4o', 'local/mock-coder'],
        };
      case 'reasoning':
        return {
          task,
          requirements: { structured_output: true, minimum_context: 128000 },
          preferred_models: [
            'anthropic/claude-3-opus',
            'openai/gpt-4-turbo',
            'deepseek/deepseek-chat',
          ],
          fallbacks: ['openai/gpt-4o', 'local/mock-coder'],
        };
      case 'long_context':
        return {
          task,
          requirements: { minimum_context: 1000000 },
          preferred_models: ['google/gemini-1.5-pro', 'google/gemini-2.0-flash'],
          fallbacks: ['anthropic/claude-3-5-sonnet', 'local/mock-coder'],
        };
      case 'vision':
        return {
          task,
          requirements: { vision: true },
          preferred_models: ['openai/gpt-4o', 'google/gemini-2.0-flash', 'anthropic/claude-3-5-sonnet'],
          fallbacks: ['openai/gpt-4-turbo', 'local/mock-coder'],
        };
      case 'local_private':
        return {
          task,
          requirements: { local_only: true },
          preferred_models: ['ollama/codellama', 'local/mock-coder'],
          fallbacks: ['local/mock-coder'],
        };
      case 'documentation':
      case 'fast_chat':
      default:
        return {
          task,
          requirements: { minimum_context: 32000 },
          preferred_models: ['openai/gpt-4o-mini', 'anthropic/claude-3-5-haiku', 'google/gemini-2.0-flash'],
          fallbacks: ['openrouter/auto', 'local/mock-coder'],
        };
    }
  }

  resolveRoute(prompt: string, explicitModel?: string): RouteResolution {
    const task = this.classifyTask(prompt);
    const policy = this.getPolicyForTask(task);
    const registry = loadModelRegistry();
    const reasons: string[] = [`Classified task as '${task}'`];

    // If explicit model requested
    if (explicitModel) {
      const match = registry.models.find((m) => m.id.toLowerCase() === explicitModel.toLowerCase());
      if (match) {
        const adapter = providerManager.getAdapter(match.provider) || providerManager.getAdapter(match.source);
        const configured = adapter ? adapter.isConfigured() : false;
        return {
          task,
          selectedModel: match.id,
          provider: match.provider,
          isVerified: match.runtime_verified,
          isConfigured: configured,
          reasons: [`Explicit model override: ${match.id}`],
          fallbacks: policy.fallbacks,
        };
      }
    }

    // Try candidate chain
    const candidates = [...policy.preferred_models, ...policy.fallbacks];
    for (const candidateId of candidates) {
      const model = registry.models.find((m) => m.id === candidateId);
      if (!model) continue;

      const adapter = providerManager.getAdapter(model.provider) || providerManager.getAdapter(model.source);
      const configured = adapter ? adapter.isConfigured() : false;

      // Local mock is always operational and verified
      if (model.id === 'local/mock-coder') {
        reasons.push('Selected local deterministic fallback for zero-credential safety.');
        return {
          task,
          selectedModel: model.id,
          provider: 'local',
          isVerified: true,
          isConfigured: true,
          reasons,
          fallbacks: [],
        };
      }

      if (configured) {
        reasons.push(`Provider for ${model.id} is configured.`);
        return {
          task,
          selectedModel: model.id,
          provider: model.provider,
          isVerified: model.runtime_verified,
          isConfigured: true,
          reasons,
          fallbacks: policy.fallbacks.filter((f) => f !== model.id),
        };
      }
    }

    // If no external provider configured, default safely to local mock
    reasons.push('No external provider credentials configured in environment. Routed to local mock.');
    return {
      task,
      selectedModel: 'local/mock-coder',
      provider: 'local',
      isVerified: true,
      isConfigured: true,
      reasons,
      fallbacks: [],
    };
  }
}

export const modelRouter = new ModelRouter();
