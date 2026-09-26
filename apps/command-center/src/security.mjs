import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const PASSWORD_KEY_LENGTH = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function hmacHex(secret, value) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function safeEqualText(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function hashPassword(password, options = {}) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) {
    throw new Error('Password must contain between 12 and 256 characters.');
  }
  const cost = options.cost || SCRYPT_COST;
  const salt = options.salt || crypto.randomBytes(16);
  const derived = await scrypt(password.normalize('NFKC'), salt, PASSWORD_KEY_LENGTH, {
    N: cost,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
    maxmem: 64 * 1024 * 1024
  });
  return [
    'scrypt',
    cost,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt.toString('base64url'),
    derived.toString('base64url')
  ].join('$');
}

export async function verifyPassword(password, encoded) {
  try {
    const [algorithm, costRaw, blockRaw, parallelRaw, saltRaw, hashRaw] = String(encoded || '').split('$');
    if (algorithm !== 'scrypt') return false;
    const cost = Number.parseInt(costRaw, 10);
    const blockSize = Number.parseInt(blockRaw, 10);
    const parallelization = Number.parseInt(parallelRaw, 10);
    const salt = Buffer.from(saltRaw, 'base64url');
    const expected = Buffer.from(hashRaw, 'base64url');
    const actual = await scrypt(String(password).normalize('NFKC'), salt, expected.length, {
      N: cost,
      r: blockSize,
      p: parallelization,
      maxmem: 64 * 1024 * 1024
    });
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function parseCookies(header = '') {
  const cookies = {};
  for (const part of String(header).split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  }
  return cookies;
}

export function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || '/'}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  if (options.httpOnly !== false) parts.push('HttpOnly');
  parts.push(`SameSite=${options.sameSite || 'Strict'}`);
  if (options.secure) parts.push('Secure');
  return parts.join('; ');
}

export function securityHeaders(config) {
  const headers = {
    'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; manifest-src 'self'; worker-src 'self'",
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  };
  if (config.isProduction) headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  return headers;
}

export function clientIp(req, trustProxy = false) {
  if (trustProxy) {
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function pseudonymize(value, secret) {
  return hmacHex(secret, String(value || 'unknown')).slice(0, 24);
}

export class RateLimiter {
  constructor({ windowMs = 60_000, max = 30 } = {}) {
    this.windowMs = windowMs;
    this.max = max;
    this.buckets = new Map();
  }

  consume(key, now = Date.now()) {
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      const next = { count: 1, resetAt: now + this.windowMs };
      this.buckets.set(key, next);
      return { allowed: true, remaining: this.max - 1, resetAt: next.resetAt };
    }
    current.count += 1;
    return {
      allowed: current.count <= this.max,
      remaining: Math.max(0, this.max - current.count),
      resetAt: current.resetAt
    };
  }

  sweep(now = Date.now()) {
    for (const [key, value] of this.buckets) {
      if (value.resetAt <= now) this.buckets.delete(key);
    }
  }
}

export function canonicalWithdrawalIntent(intent) {
  const required = ['id', 'walletBindingId', 'chainId', 'asset', 'amountAtomic', 'destination', 'nonce', 'expiresAt'];
  for (const field of required) {
    if (intent[field] === undefined || intent[field] === null || intent[field] === '') {
      throw new Error(`Missing withdrawal intent field: ${field}`);
    }
  }
  return [
    'MELODIESPARK_WITHDRAWAL_INTENT_V1',
    intent.id,
    intent.walletBindingId,
    String(intent.chainId),
    String(intent.asset).toUpperCase(),
    String(intent.amountAtomic),
    String(intent.destination).toLowerCase(),
    intent.nonce,
    intent.expiresAt
  ].join('|');
}

export function isValidEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function maskEmail(value) {
  const [name, domain] = String(value).split('@');
  if (!domain) return 'invalid';
  return `${name.slice(0, 2)}***@${domain}`;
}

export function redact(value) {
  if (value === undefined || value === null) return value;
  return String(value)
    .replace(/(sk_(live|test)_[A-Za-z0-9_-]+)/g, '[REDACTED_STRIPE_KEY]')
    .replace(/(Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi, '$1[REDACTED]')
    .replace(/((?:client_secret|access_token|password|private_key)\s*[=:]\s*)[^\s,;]+/gi, '$1[REDACTED]');
}
