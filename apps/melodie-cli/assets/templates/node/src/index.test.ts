import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sha256, slugify } from './index.js';

/** Published SHA-256 vectors, used as regression anchors. */
const SHA256_VECTORS: ReadonlyArray<readonly [string, string]> = [
  ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
  ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  [
    'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
    '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
  ],
];

/** U+00E9, precomposed "e with acute". */
const PRECOMPOSED_E_ACUTE = String.fromCodePoint(0x00e9);
/** "e" followed by U+0301, combining acute accent. */
const DECOMPOSED_E_ACUTE = `e${String.fromCodePoint(0x0301)}`;

describe('sha256', () => {
  it('matches the known vector for the empty string', () => {
    assert.equal(sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('matches the known vector for "abc"', () => {
    assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('matches every known vector', () => {
    for (const [input, expected] of SHA256_VECTORS) {
      assert.equal(sha256(input), expected, `sha256(${JSON.stringify(input)})`);
    }
  });

  it('returns a lowercase 64-character hex digest', () => {
    assert.match(sha256('melodiespark'), /^[a-f0-9]{64}$/);
  });

  it('is byte-exact, so normalization forms differ', () => {
    // UTF-8 encodes code points, so NFC and NFD forms are different bytes.
    assert.notEqual(sha256(PRECOMPOSED_E_ACUTE), sha256(DECOMPOSED_E_ACUTE));
    assert.notEqual(sha256(PRECOMPOSED_E_ACUTE), sha256('e'));
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates words', () => {
    assert.equal(slugify('Hello, World!'), 'hello-world');
  });

  it('collapses runs of punctuation into a single hyphen', () => {
    assert.equal(slugify('a   b'), 'a-b');
    assert.equal(slugify('a---b'), 'a-b');
    assert.equal(slugify('a/ b\\c'), 'a-b-c');
  });

  it('trims leading and trailing hyphens', () => {
    assert.equal(slugify('  --hello--  '), 'hello');
    assert.equal(slugify('!!!'), '');
  });

  it('folds accented Latin letters to ASCII', () => {
    assert.equal(slugify('Crème Brûlée'), 'creme-brulee');
  });

  it('keeps digits', () => {
    assert.equal(slugify('Version 2 Point 0'), 'version-2-point-0');
  });

  it('returns an empty string when nothing usable remains', () => {
    assert.equal(slugify(''), '');
    assert.equal(slugify('   '), '');
    assert.equal(slugify('***'), '');
  });

  it('is idempotent', () => {
    const once = slugify('The Long Song');
    assert.equal(slugify(once), once);
  });
});
