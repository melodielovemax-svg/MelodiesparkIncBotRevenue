/**
 * Public library surface.
 *
 * Pure, dependency-free helpers. The CLI in `bin/` imports `slugify` from
 * here: the built `dist/index.js` when it exists, otherwise this TypeScript
 * source, which Node >= 22.18 can load natively.
 */

import { createHash } from 'node:crypto';

/** Matches every run of characters that cannot appear in a slug. */
const NON_SLUG = /[^a-z0-9]+/g;

/**
 * SHA-256 hex digest of `text`, encoded as UTF-8.
 *
 * Byte-exact and comparable with `sha256sum`. Not Unicode-normalizing: two
 * strings that differ only in normalization form are different byte sequences
 * and therefore hash differently.
 *
 * @param text - Input string. Encoded as UTF-8.
 * @returns Lowercase 64-character hex digest.
 */
export function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf-8').digest('hex');
}

/**
 * Lowercase, hyphen-separated slug of `text`.
 *
 * Accented Latin letters are folded to ASCII, every other run of characters
 * becomes a single hyphen, and leading or trailing hyphens are trimmed.
 * Returns an empty string when nothing usable remains.
 *
 * @param text - Input string.
 * @returns Slug string, possibly empty.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(NON_SLUG, '-')
    .replace(/^-+|-+$/g, '');
}
