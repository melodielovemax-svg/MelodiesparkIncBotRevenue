# Melodie CLI 1.1.0

Unified Model Registry, Provider Adapters, and PRO-MAX Orchestration for Windows.

## Architectural Concepts

Melodie enforces strict semantic separation:

- **model**: exact backend identifier (e.g., `openrouter/auto`, `mistralai/mistral-large-2407`, `gpt-4-turbo`).
- **provider**: service/runtime that executes the model (`openrouter`, `ollama`, `openai`, `gemini`, `claude`, `antigravity`).
- **profile**: Melodie orchestration policy (`instant`, `flash`, `thinking`, `deepcoder`, `pro-max`).
- **agent**: execution workflow and tool environment.

```text
PRO-MAX
  ↓
Auto Router (openrouter/auto - 2M context)
  ↓
model selection
  ↓
provider adapter
  ↓
streaming
  ↓
tool execution
  ↓
verification tests
  ↓
validated result
```

## Model Catalog & Health Distinction

Melodie distinguishes between:
- **DISCOVERED**: model found in local/remote endpoints.
- **AVAILABLE**: reachable and supported.
- **HEALTHY**: memory, context, and dependencies verified (e.g. models suffering OOM like `qwen3.8:latest` are marked unhealthy).
- **EXECUTABLE**: authenticated and operational for inference.

### Target Catalog

- **OpenRouter**:
  - `openrouter/auto` (alias: `auto`, 2M context dynamic router)
  - `mistralai/mistral-large-2407` (alias: `mistral-large`, 131K context, tools, structured output)
  - `mancer/weaver` (alias: `weaver`)
  - `undi95/remm-slerp-l2-13b` (alias: `remm-slerp`)
  - `gryphe/mythomax-l2-13b` (alias: `mythomax`)
- **OpenAI**:
  - `gpt-4-turbo` (flagship 128K context)
  - Legacy/Catalog: `gpt-4`, `gpt-3.5-turbo`, `gpt-3.5-turbo-0613`, `gpt-3.5-turbo-instruct`, `gpt-3.5-turbo-16k`, `gpt-3.5-turbo-16k-0613`
- **Ollama**:
  - Dynamically discovered models (e.g. `gemma4:latest`, `llama3:latest`, `qwen3.5:latest`), with OOM protection for `qwen3.8:latest`.

## CLI Commands

### Models

```powershell
# List active catalog models
melodie models

# Filter by provider
melodie models --provider openrouter
melodie models --provider ollama

# View historical/catalog models
melodie models --legacy

# Switch active model by alias or ID
melodie model use auto
melodie model use mistral-large
melodie model use gpt-4-turbo

# Inspect active model health
melodie model current
```

### Profiles

```powershell
# List available orchestration profiles
melodie profiles

# Switch orchestration profile
melodie profile use instant
melodie profile use flash
melodie profile use thinking
melodie profile use deepcoder
melodie profile use pro-max

# Inspect active profile
melodie profile current
```

### Execution

```powershell
# Run with active profile / model
melodie run "Explain the architecture"

# Override model or profile
melodie run --model auto "Refactor this module"
melodie run --model mistral-large "Analyze code security"
melodie run --model gpt-4-turbo "Generate unit tests"
melodie run --profile deepcoder "Generate test fixtures"
```

### Authentication & Providers

```powershell
melodie providers
melodie status

# OpenRouter API key (stored in Windows DPAPI vault)
melodie auth set openrouter YOUR_API_KEY
melodie auth status

# CLI Providers
melodie auth login antigravity
melodie auth login gemini
melodie auth login claude
melodie auth login openai
```

## Security

- Windows DPAPI-backed secret vault (`%USERPROFILE%\.melodie\vault.enc`).
- No cleartext credential storage.
- OAuth remains within provider CLIs.
