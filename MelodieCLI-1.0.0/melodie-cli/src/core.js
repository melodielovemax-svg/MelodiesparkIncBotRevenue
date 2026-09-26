import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync, spawn } from "node:child_process";

export const HOME = path.join(os.homedir(), ".melodie");
export const CONFIG = path.join(HOME, "config.json");
export const VAULT = path.join(HOME, "vault.enc");
export const LOG = path.join(HOME, "audit.jsonl");

export function ensureHome() {
  fs.mkdirSync(HOME, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(CONFIG)) writeJson(CONFIG, {
    defaultProvider: "ollama",
    providers: {},
    executables: { antigravity: "agy", gemini: "gemini", claude: "claude", openai: "codex" }
  });
}

export function readJson(file, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}
export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
}
export function config() { ensureHome(); return readJson(CONFIG); }
export function saveConfig(v) { ensureHome(); writeJson(CONFIG, v); }

export function audit(action, details = {}) {
  ensureHome();
  fs.appendFileSync(LOG, JSON.stringify({
    ts: new Date().toISOString(), action, ...details
  }) + "\n");
}

/* Windows DPAPI-backed secret storage. The master key is protected by the
   current Windows user; it is never printed or stored in plaintext. */
function ps(script, input = "") {
  return execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script],
    { input, encoding: "utf8", windowsHide: true }).trim();
}
export function vaultRead() {
  ensureHome();
  if (!fs.existsSync(VAULT)) return {};
  if (process.platform !== "win32") throw new Error("Encrypted vault currently requires Windows DPAPI.");
  const b64 = fs.readFileSync(VAULT, "utf8").trim();
  if (!b64) return {};
  const script = `
    $s = ConvertTo-SecureString '${b64.replace(/'/g, "''")}'
    $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
    try {[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)}
    finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)}
  `;
  const plaintext = ps(script);
  return plaintext ? JSON.parse(plaintext) : {};
}
export function vaultWrite(data) {
  ensureHome();
  if (process.platform !== "win32") throw new Error("Encrypted vault currently requires Windows DPAPI.");
  const plaintext = JSON.stringify(data);
  const encoded = Buffer.from(plaintext, "utf8").toString("base64");
  const script = `
    $b='${encoded}';
    $bytes=[Convert]::FromBase64String($b);
    $text=[Text.Encoding]::UTF8.GetString($bytes);
    $secure=ConvertTo-SecureString $text -AsPlainText -Force;
    ConvertFrom-SecureString $secure
  `;
  const protectedValue = ps(script);
  fs.writeFileSync(VAULT, protectedValue + "\n", { mode: 0o600 });
}
export function setSecret(provider, value) {
  const v = vaultRead(); v[provider] = value; vaultWrite(v);
  audit("secret.set", { provider });
}
export function deleteSecret(provider) {
  const v = vaultRead(); delete v[provider]; vaultWrite(v);
  audit("secret.delete", { provider });
}
export function hasSecret(provider) { return Object.hasOwn(vaultRead(), provider); }

export function runProcess(command, args, input = "", opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: opts.cwd || process.cwd(),
      env: { ...process.env, ...(opts.env || {}) },
      shell: false,
      windowsHide: true
    });
    let out = "", err = "";
    child.stdout?.on("data", d => { out += d; if (opts.stream) process.stdout.write(d); });
    child.stderr?.on("data", d => { err += d; if (opts.stream) process.stderr.write(d); });
    if (input) child.stdin.write(input);
    child.stdin.end();
    child.on("error", reject);
    child.on("close", code => resolve({ code, stdout: out, stderr: err }));
  });
}

export function randomId() {
  return crypto.randomUUID();
}
