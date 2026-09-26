import { runProcess } from "../core.js";

export async function run(prompt, options = {}, executable = "agy") {
  const args = ["-p", prompt];
  const r = await runProcess(executable, args, "", { stream: options.stream });
  if (r.code !== 0) {
    throw new Error(`Antigravity CLI (${executable}) exited with code ${r.code}: ${r.stderr}`);
  }
  return r.stdout;
}

export function checkHealth(executable = "agy") {
  return {
    discovered: true,
    available: true,
    healthy: true,
    executable: true,
    command: executable
  };
}
