import { db } from "@/db";
import {
  providers,
  models,
  toolCapabilities,
  permissionProfiles,
  probeResults,
  sessions,
  auditEvents,
} from "@/db/schema";

const defaultProviders = [
  {
    name: "openrouter" as const,
    displayName: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    isConfigured: true,
    isReachable: true,
  },
  {
    name: "openai" as const,
    displayName: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    isConfigured: false,
    isReachable: false,
  },
  {
    name: "anthropic" as const,
    displayName: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    isConfigured: false,
    isReachable: false,
  },
  {
    name: "google" as const,
    displayName: "Google AI",
    baseUrl: "https://generativelanguage.googleapis.com/v1",
    isConfigured: false,
    isReachable: false,
  },
  {
    name: "mistral" as const,
    displayName: "Mistral AI",
    baseUrl: "https://api.mistral.ai/v1",
    isConfigured: false,
    isReachable: false,
  },
  {
    name: "local" as const,
    displayName: "Local (Ollama)",
    baseUrl: "http://localhost:11434/v1",
    isConfigured: false,
    isReachable: false,
  },
];

const defaultTools = [
  {
    toolName: "filesystem",
    displayName: "Filesystem",
    category: "core",
    description: "Read, write, and navigate repository files",
    isEnabled: true,
    requiresApproval: false,
    permissionsJson: { read: true, write: true, delete: false },
    lastTestStatus: "PASS" as const,
  },
  {
    toolName: "shell",
    displayName: "Shell",
    category: "core",
    description: "Execute shell commands with timeout and isolation",
    isEnabled: true,
    requiresApproval: false,
    permissionsJson: { enabled: true, timeout_seconds: 120 },
    lastTestStatus: "PASS" as const,
  },
  {
    toolName: "git",
    displayName: "Git",
    category: "vcs",
    description: "Clone, diff, commit, and manage git repositories",
    isEnabled: true,
    requiresApproval: false,
    permissionsJson: { enabled: true, commit: false, push: false },
    lastTestStatus: "PASS" as const,
  },
  {
    toolName: "search",
    displayName: "Search",
    category: "discovery",
    description: "Semantic and keyword search across repository contents",
    isEnabled: true,
    requiresApproval: false,
    permissionsJson: { enabled: true },
    lastTestStatus: "PASS" as const,
  },
  {
    toolName: "patch",
    displayName: "Patch Engine",
    category: "core",
    description: "Apply unified diffs and structured patches to files",
    isEnabled: true,
    requiresApproval: false,
    permissionsJson: { enabled: true },
    lastTestStatus: "PASS" as const,
  },
  {
    toolName: "terminal",
    displayName: "Terminal",
    category: "core",
    description: "Interactive terminal for build and test execution",
    isEnabled: true,
    requiresApproval: false,
    permissionsJson: { enabled: true },
    lastTestStatus: "PASS" as const,
  },
  {
    toolName: "diagnostics",
    displayName: "Diagnostics",
    category: "verification",
    description: "TypeScript, lint, and build error diagnostics",
    isEnabled: true,
    requiresApproval: false,
    permissionsJson: { enabled: true },
    lastTestStatus: "PASS" as const,
  },
  {
    toolName: "browser",
    displayName: "Browser",
    category: "network",
    description: "Headless browser for web scraping and UI testing",
    isEnabled: false,
    requiresApproval: true,
    permissionsJson: { enabled: false },
    lastTestStatus: "SKIP" as const,
  },
];

const defaultPermissionProfile = {
  name: "default",
  description: "Default safe permission profile for autonomous agents",
  isDefault: true,
  permissionsJson: {
    filesystem: { read: true, write: true },
    shell: { enabled: true, timeout_seconds: 120 },
    git: { enabled: true, commit: false, push: false },
    network: { enabled: false },
    destructive: { enabled: false },
    package_install: { require_approval: true },
  },
};

export async function seedDatabase() {
  // Insert providers
  const insertedProviders = await db
    .insert(providers)
    .values(defaultProviders)
    .onConflictDoNothing()
    .returning();

  // Get the openrouter provider id
  const orProvider = insertedProviders.find((p) => p.name === "openrouter");
  if (!orProvider) return;

  // Insert models
  const openrouterModels = [
    {
      providerId: orProvider.id,
      modelId: "openai/gpt-4-turbo",
      displayName: "GPT-4 Turbo",
      status: "OPERATIONAL" as const,
      role: "coder" as const,
      contextWindow: 128000,
      inputPricePer1k: 0.01,
      outputPricePer1k: 0.03,
      supportsTools: true,
      supportsVision: true,
      supportsStreaming: true,
      lastProbeResult: "PASS" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "openai/gpt-4",
      displayName: "GPT-4",
      status: "OPERATIONAL" as const,
      role: "architect" as const,
      contextWindow: 8192,
      inputPricePer1k: 0.03,
      outputPricePer1k: 0.06,
      supportsTools: true,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PASS" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "mistralai/mistral-large",
      displayName: "Mistral Large",
      status: "OPERATIONAL" as const,
      role: "coder" as const,
      contextWindow: 32768,
      inputPricePer1k: 0.008,
      outputPricePer1k: 0.024,
      supportsTools: true,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PASS" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "openai/gpt-3.5-turbo",
      displayName: "GPT-3.5 Turbo",
      status: "OPERATIONAL" as const,
      role: "coder" as const,
      contextWindow: 16385,
      inputPricePer1k: 0.0005,
      outputPricePer1k: 0.0015,
      supportsTools: true,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PASS" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "openai/gpt-3.5-turbo-instruct",
      displayName: "GPT-3.5 Turbo Instruct",
      status: "SCAFFOLD" as const,
      role: "general" as const,
      contextWindow: 4096,
      inputPricePer1k: 0.0015,
      outputPricePer1k: 0.002,
      supportsTools: false,
      supportsVision: false,
      supportsStreaming: false,
      lastProbeResult: "PENDING" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "openai/gpt-3.5-turbo-16k",
      displayName: "GPT-3.5 Turbo 16K",
      status: "UNVERIFIED" as const,
      role: "coder" as const,
      contextWindow: 16384,
      inputPricePer1k: 0.001,
      outputPricePer1k: 0.002,
      supportsTools: true,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PENDING" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "openrouter/auto",
      displayName: "OpenRouter Auto",
      status: "OPERATIONAL" as const,
      role: "orchestrator" as const,
      contextWindow: null,
      inputPricePer1k: null,
      outputPricePer1k: null,
      supportsTools: true,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PASS" as const,
      notes: "Dynamic routing — selects best model per request",
    },
    {
      providerId: orProvider.id,
      modelId: "openai/gpt-3.5-turbo-batch",
      displayName: "GPT-3.5 Turbo Batch",
      status: "PLANNED" as const,
      role: "general" as const,
      contextWindow: 16385,
      inputPricePer1k: 0.00025,
      outputPricePer1k: 0.00075,
      supportsTools: false,
      supportsVision: false,
      supportsStreaming: false,
      lastProbeResult: "PENDING" as const,
      notes: "Batch workloads — async processing",
    },
    {
      providerId: orProvider.id,
      modelId: "mancer/weaver",
      displayName: "Mancer Weaver",
      status: "UNVERIFIED" as const,
      role: "general" as const,
      contextWindow: 8192,
      inputPricePer1k: null,
      outputPricePer1k: null,
      supportsTools: false,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PENDING" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "gryphe/remm-slerp-l2-13b",
      displayName: "ReMM SLERP 13B",
      status: "UNVERIFIED" as const,
      role: "general" as const,
      contextWindow: 4096,
      inputPricePer1k: null,
      outputPricePer1k: null,
      supportsTools: false,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PENDING" as const,
    },
    {
      providerId: orProvider.id,
      modelId: "gryphe/mythomax-l2-13b",
      displayName: "MythoMax 13B",
      status: "UNVERIFIED" as const,
      role: "general" as const,
      contextWindow: 4096,
      inputPricePer1k: null,
      outputPricePer1k: null,
      supportsTools: false,
      supportsVision: false,
      supportsStreaming: true,
      lastProbeResult: "PENDING" as const,
    },
  ];

  await db.insert(models).values(openrouterModels).onConflictDoNothing();

  // Insert tool capabilities
  await db.insert(toolCapabilities).values(defaultTools).onConflictDoNothing();

  // Insert permission profile
  await db
    .insert(permissionProfiles)
    .values(defaultPermissionProfile)
    .onConflictDoNothing();

  // Insert sample probe results
  const allModels = await db.select().from(models);
  const gpt4TurboModel = allModels.find(
    (m) => m.modelId === "openai/gpt-4-turbo"
  );

  const probeCategories = [
    {
      category: "Runtime",
      checks: [
        "CLI",
        "Agent loop",
        "Tool registry",
        "Session manager",
        "Audit logger",
      ],
    },
    {
      category: "Repository",
      checks: [
        "Git repository",
        "File access",
        "Patch engine",
        "Test discovery",
      ],
    },
    {
      category: "Providers",
      checks: ["OpenRouter configuration", "API authentication"],
    },
    {
      category: "Tool capabilities",
      checks: ["filesystem", "shell", "git", "search", "tests"],
    },
    {
      category: "Sandbox",
      checks: [
        "command timeout",
        "environment isolation",
        "network policy",
      ],
    },
    {
      category: "Agent integration",
      checks: ["planning", "execution", "verification", "recovery"],
    },
  ];

  const probeRows: Array<{
    category: string;
    checkName: string;
    status: "PASS" | "FAIL" | "SKIP" | "PENDING";
    message: string;
    durationMs: number;
    modelId: string | null;
  }> = [];

  for (const cat of probeCategories) {
    for (const check of cat.checks) {
      probeRows.push({
        category: cat.category,
        checkName: check,
        status: "PASS",
        message: `${check} verified successfully`,
        durationMs: Math.floor(Math.random() * 200) + 20,
        modelId: gpt4TurboModel?.id ?? null,
      });
    }
  }

  await db.insert(probeResults).values(probeRows).onConflictDoNothing();

  // Insert sample sessions
  const operationalModel = allModels.find(
    (m) => m.modelId === "openai/gpt-4-turbo"
  );
  const sampleSessions = [
    {
      taskDescription: "Implement authentication and run the tests",
      modelId: operationalModel?.id ?? null,
      role: "coder" as const,
      status: "completed" as const,
      totalToolCalls: 14,
      totalModelCalls: 6,
      durationMs: 42300,
    },
    {
      taskDescription: "Design the system architecture for microservices",
      modelId: operationalModel?.id ?? null,
      role: "architect" as const,
      status: "completed" as const,
      totalToolCalls: 8,
      totalModelCalls: 4,
      durationMs: 28100,
    },
    {
      taskDescription: "Refactor database access layer with connection pooling",
      modelId: operationalModel?.id ?? null,
      role: "coder" as const,
      status: "failed" as const,
      totalToolCalls: 5,
      totalModelCalls: 3,
      durationMs: 12400,
      errorMessage: "TypeScript type mismatch in repository pattern",
    },
    {
      taskDescription: "Add end-to-end tests for payment flow",
      modelId: operationalModel?.id ?? null,
      role: "tester" as const,
      status: "executing" as const,
      totalToolCalls: 3,
      totalModelCalls: 2,
      durationMs: null,
    },
  ];

  const insertedSessions = await db
    .insert(sessions)
    .values(sampleSessions)
    .onConflictDoNothing()
    .returning();

  if (insertedSessions.length === 0) return;

  // Insert sample audit events for the first session
  const firstSession = insertedSessions[0];
  if (!firstSession) return;

  const sampleAuditEvents = [
    {
      sessionId: firstSession.id,
      eventType: "session_start" as const,
      agentModel: "openai/gpt-4-turbo",
      message: "Session started: Implement authentication and run the tests",
    },
    {
      sessionId: firstSession.id,
      eventType: "plan_created" as const,
      agentModel: "openai/gpt-4-turbo",
      message: "Planning phase: 5 steps identified",
    },
    {
      sessionId: firstSession.id,
      eventType: "tool_call" as const,
      agentModel: "openai/gpt-4-turbo",
      tool: "filesystem",
      path: "src/auth/",
      action: "read",
      result: "success" as const,
      durationMs: 23,
      message: "Read repository structure",
    },
    {
      sessionId: firstSession.id,
      eventType: "model_call" as const,
      agentModel: "openai/gpt-4-turbo",
      result: "success" as const,
      durationMs: 2340,
      message: "Generated authentication service implementation",
    },
    {
      sessionId: firstSession.id,
      eventType: "tool_call" as const,
      agentModel: "openai/gpt-4-turbo",
      tool: "filesystem",
      path: "src/auth/service.ts",
      action: "write",
      result: "success" as const,
      durationMs: 12,
      message: "Wrote authentication service",
    },
    {
      sessionId: firstSession.id,
      eventType: "tool_call" as const,
      agentModel: "openai/gpt-4-turbo",
      tool: "shell",
      action: "run",
      result: "success" as const,
      durationMs: 8420,
      message: "Ran: npm test -- --testPathPattern=auth",
    },
    {
      sessionId: firstSession.id,
      eventType: "task_completed" as const,
      agentModel: "openai/gpt-4-turbo",
      result: "success" as const,
      message: "All 12 tests passed. Authentication implemented successfully.",
    },
    {
      sessionId: firstSession.id,
      eventType: "session_end" as const,
      agentModel: "openai/gpt-4-turbo",
      message: "Session completed in 42.3s",
    },
  ];

  await db.insert(auditEvents).values(sampleAuditEvents).onConflictDoNothing();
}
