# Melodie CLI Agent Platform - Security & Sandbox Plane

## 1. Security Philosophy

The Melodie CLI Agent Platform treats autonomous execution as an untrusted boundary. Agents operate under strict confinement, resource caps, and immutable audit logging.

```text
Filesystem sandbox
Command allowlist
Network allowlist
Timeout
CPU limit
Memory limit
Process limit
Output limit
Secret isolation
Prompt/tool boundary
Audit log
Approval gate
Rollback
```

---

## 2. Mandatory Attack Defenses

The sandbox engine (`src/sandbox/sandbox.ts`) validates all filesystem operations and subprocess commands against standard attack vectors:

| Attack Vector | Defense Mechanism | Verified in Tests |
|---|---|---|
| `../` traversal | Canonical path resolution with root prefix check | `test/sandbox-security.test.mjs` |
| Deep traversal (`sub/../../outside`) | Absolute path relative check | `test/sandbox-security.test.mjs` |
| Null bytes (`\0`) | Explicit null byte scanning in path resolver | `test/sandbox-security.test.mjs` |
| Absolute path escape | Comparison against workspace root boundary | `test/sandbox-security.test.mjs` |
| Command injection (`;`, `&`, `\|`, `` ` ``, `$`) | Metacharacter regex denial & array-based spawning | `test/sandbox-security.test.mjs` |
| Unallowlisted executables (`curl`, `wget`, `nc`) | Strict executable allowlist (`git`, `npm`, `tsc`, `node`) | `test/sandbox-security.test.mjs` |
| Credential file tampering (`.env`, `.pem`, `id_rsa`) | Deny-by-default on secret file basenames | `test/sandbox-security.test.mjs` |
| Secret exposure in subprocesses | Environment scrubbing of API keys before spawning | `test/sandbox-security.test.mjs` |
| Autonomous shell mutation | Required human approval flag (`--i-approve-execution`) | `test/agent-engine.test.mjs` |

---

## 3. Human Approval Gates

1. **Agent Shell Execution (`melodie agent execute`)**:
   - Holds status in `PENDING` unless `--i-approve-execution` is passed.
   - Logs `GATE_HELD` audit event.

2. **Deployment Release (`melodie deployment release`)**:
   - Rejects release (`BLOCKED`) unless explicit `--i-approve-deployment` flag is provided and target cloud provider is verified.

3. **Autonomous Financial Transfers & Blockchain Broadcasting**:
   - Permanently `BLOCKED` in code and governance rules.
   - Zero private keys generated or broadcast autonomously.
