# Melodie CLI Agent Platform - Provider Architecture

## 1. Provider Design & Gateway Layer

Instead of coupling the coding-agent engine to a single proprietary vendor, Melodie utilizes a unified adapter interface (`ProviderAdapter`) with OpenRouter as the primary multi-model gateway.

```text
                    ProviderAdapter
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
    OpenAI            Anthropic           Google
       │                  │                  │
 OpenRouter            Ollama          Local/Mock
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                     ModelRouter
```

---

## 2. Supported Adapters

| Provider | Type | Default Endpoint | Environment Variable | Capabilities | Default Status |
|---|---|---|---|---|---|
| **OpenRouter** | Gateway | `https://openrouter.ai/api/v1` | `OPENROUTER_API_KEY` | Chat, Stream, Tools, Dynamic Sync, Routing | `UNVERIFIED` until key configured |
| **OpenAI** | Direct | `https://api.openai.com/v1` | `OPENAI_API_KEY` | Chat, Stream, Tools, Embeddings, Structured Outputs | `UNVERIFIED` until key configured |
| **Anthropic** | Direct | `https://api.anthropic.com/v1` | `ANTHROPIC_API_KEY` | Chat, Stream, Tools, Extended Reasoning | `UNVERIFIED` until key configured |
| **Google** | Direct | `https://generativelanguage.googleapis.com` | `GEMINI_API_KEY` | Chat, Stream, Tools, Vision, Long Context | `UNVERIFIED` until key configured |
| **Ollama** | Local | `http://127.0.0.1:11434` | None | Local / Private Inference, Chat | `UNVERIFIED` until daemon running |
| **Local Mock** | Mock/Engine | Local process | None | Deterministic Testing, Offline Safe Execution | `OPERATIONAL` on tested paths |

---

## 3. Credential Resolution Rules

Provider credentials flow strictly through environment variables:
```text
environment variables
        ↓
secret manager
        ↓
provider adapter
```

Credentials are **never**:
- stored in source code
- committed to git repositories
- stored in database seeds
- bundled in client builds
- passed into child processes spawned by agents

---

## 4. Dynamic Catalog Synchronization

Run:
```bash
melodie models sync
```
Connects to `https://openrouter.ai/api/v1/models` and updates `models/registry.json` dynamically with latest context window limits, pricing, and modal capabilities.
