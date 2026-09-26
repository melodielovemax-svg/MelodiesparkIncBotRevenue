import { runProcess } from "../core.js";

export async function run(prompt, options = {}, executable = "codex") {
  const args = ["exec", prompt];
  const r = await runProcess(executable, args, "", { stream: options.stream });
  if (r.code !== 0) {
    throw new Error(`OpenAI CLI (${executable}) exited with code ${r.code}: ${r.stderr}`);
  }
  return r.stdout;
}

export function checkHealth(executable = "codex") {
  return {
    discovered: true,
    available: true,
    healthy: true,
    executable: true,
    command: executable
  };
}
