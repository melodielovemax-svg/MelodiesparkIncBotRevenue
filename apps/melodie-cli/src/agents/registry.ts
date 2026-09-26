/**
 * Melodie CLI Agent Platform - Agent Registry.
 *
 * Implements canonical agent profiles and the 80,000 logical agent abstraction.
 *
 * Enforces:
 *   80,000 logical agent definitions != 80,000 operating system processes.
 *   Logical agents map onto a bounded worker pool and task queues.
 *   Initial state: engineering_state = SCAFFOLD, runtime_state = UNVERIFIED.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AgentProfile, AgentRegistryData, AgentRole } from './types.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..', '..');
const CANONICAL_REGISTRY_PATH = path.join(PACKAGE_ROOT, 'agents', 'registry.json');
const PROFILES_DIR = path.join(PACKAGE_ROOT, 'agents', 'profiles');

export const STANDARD_ROLES: Array<{ role: AgentRole; desc: string }> = [
  { role: 'coder', desc: 'Synthesizes code edits, inspects repos, and builds patches.' },
  { role: 'tester', desc: 'Executes test suites and verifies non-regression.' },
  { role: 'security', desc: 'Validates sandbox constraints, secret leaks, and security policies.' },
  { role: 'forensic', desc: 'Audits execution traces, cryptographic hashes, and provenance.' },
  { role: 'research', desc: 'Surveys documentation, dependency trees, and external specifications.' },
  { role: 'documentation', desc: 'Maintains architecture guides, runbooks, and API specs.' },
  { role: 'product', desc: 'Tracks requirements, issue states, and project roadmaps.' },
  { role: 'sales', desc: 'Catalog presentation and developer portal integration.' },
  { role: 'revenue', desc: 'Revenue automation simulation and boundary enforcement.' },
  { role: 'web3', desc: 'Web3 contracts and safe transactional boundary scaffolding.' },
  { role: 'compliance', desc: 'Enforces governance, license validity, and Truth Protocol.' },
  { role: 'deployment', desc: 'Gated deployment verification and release controls.' },
  { role: 'observability', desc: 'Monitors runtime metrics, queue depths, and worker status.' },
  { role: 'data', desc: 'Schema validation, migrations, and catalog index persistence.' },
  { role: 'qa', desc: 'End-to-end integration and smoke test validation.' },
];

export const NAMESPACE_PROFILES: string[] = [
  'Benzen',
  'Tamtek',
  'Bitsum',
  'Gate',
  'Power',
  'Pro_Power_Shield',
  'Pro_C',
  'Top',
  'Exodius',
  'BitTheme',
  'GrapsFlix',
  'Otamzen',
  'LLM',
  'Caguran',
  'IWHYPROGATOGATE',
  'AZURIX',
  'CLI-BOT',
  'Revenue-Automation',
  'CARSESKI',
  'Phoenix_Blake',
  'HYDRA',
  'BLAZE',
  'WATSON',
  'WHATSON',
  'WHATZONE',
  'SHERLOCK_LOCK_HOLMES',
  'HOMES_DEDUCTION',
  'ARLOCKTWINS',
];

function buildDefaultProfiles(): AgentProfile[] {
  const profiles: AgentProfile[] = [];

  // 1. Standard functional profiles
  for (const { role, desc } of STANDARD_ROLES) {
    profiles.push({
      id: role,
      name: role.toUpperCase(),
      role,
      type: 'agent_profile',
      engineering_state: role === 'coder' || role === 'tester' || role === 'security' ? 'OPERATIONAL' : 'SCAFFOLD',
      runtime_state: role === 'coder' || role === 'tester' || role === 'security' ? 'VERIFIED' : 'UNVERIFIED',
      description: desc,
      system_prompt: `You are Melodie Agent [${role.toUpperCase()}]. Follow all sandbox policies and truth protocols.`,
      default_model: 'openrouter/flavor-pareto-code',
      allowed_tools: ['inspect', 'test', 'diff', 'patch'],
      permissions: {
        filesystem: 'scoped',
        shell: 'allowlist',
        network: 'restricted',
      },
    });
  }

  // 2. Named namespace profiles
  for (const name of NAMESPACE_PROFILES) {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    profiles.push({
      id,
      name,
      role: 'coder',
      namespace: 'custom',
      type: 'agent_profile',
      engineering_state: 'SCAFFOLD',
      runtime_state: 'UNVERIFIED',
      description: `Namespace specialized profile: ${name}`,
      system_prompt: `You are specialized agent ${name}. Adhere strictly to Melodie truth protocols.`,
      default_model: 'openrouter/flavor-pareto-code',
      allowed_tools: ['inspect', 'patch'],
      permissions: {
        filesystem: 'scoped',
        shell: 'allowlist',
        network: 'restricted',
      },
    });
  }

  return profiles;
}

export class AgentRegistry {
  private registryPath: string;

  constructor(customPath?: string) {
    this.registryPath = customPath || process.env.MELODIESPARK_AGENTS_REGISTRY || CANONICAL_REGISTRY_PATH;
  }

  loadRegistry(): AgentRegistryData {
    if (fs.existsSync(this.registryPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.registryPath, 'utf-8')) as AgentRegistryData;
      } catch {
        // Fallback
      }
    }

    const defaultProfiles = buildDefaultProfiles();
    const data: AgentRegistryData = {
      version: '1.0.0',
      updated_at: new Date().toISOString(),
      logical_agent_count: 80000,
      profiles: defaultProfiles,
    };
    this.saveRegistry(data);
    return data;
  }

  saveRegistry(data: AgentRegistryData): void {
    const dir = path.dirname(this.registryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.registryPath, JSON.stringify(data, null, 2), 'utf-8');

    // Also persist individual profile files
    if (!fs.existsSync(PROFILES_DIR)) {
      fs.mkdirSync(PROFILES_DIR, { recursive: true });
    }
    for (const p of data.profiles) {
      fs.writeFileSync(
        path.join(PROFILES_DIR, `${p.id}.json`),
        JSON.stringify(p, null, 2),
        'utf-8'
      );
    }
  }

  listProfiles(): AgentProfile[] {
    return this.loadRegistry().profiles;
  }

  getProfile(idOrName: string): AgentProfile | undefined {
    const reg = this.loadRegistry();
    const lower = idOrName.toLowerCase();
    return reg.profiles.find((p) => p.id.toLowerCase() === lower || p.name.toLowerCase() === lower);
  }

  /**
   * Virtual Logical Agent addressing resolution.
   * Enables addressability across 80,000 logical agent identities without OS process overhead.
   */
  resolveLogicalAgent(index: number): { id: string; profile: AgentProfile; virtualWorkerId: number } {
    const profiles = this.listProfiles();
    const boundedIndex = Math.max(0, Math.min(index, 79999));
    const profile = profiles[boundedIndex % profiles.length];
    const workerPoolSize = 32; // Active physical execution slots
    const virtualWorkerId = boundedIndex % workerPoolSize;

    return {
      id: `AGENT-${String(boundedIndex + 1).padStart(6, '0')}`,
      profile,
      virtualWorkerId,
    };
  }
}

export const agentRegistry = new AgentRegistry();
