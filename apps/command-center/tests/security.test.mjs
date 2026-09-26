import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalWithdrawalIntent, hashPassword, verifyPassword, safeEqualText } from '../src/security.mjs';
import { atomicEthAmount } from '../src/wallet.mjs';

test('password hashes verify without storing plaintext', async () => {
  const encoded = await hashPassword('correct horse battery staple', { cost: 1024 });
  assert.match(encoded, /^scrypt\$/);
  assert.equal(encoded.includes('correct horse battery staple'), false);
  assert.equal(await verifyPassword('correct horse battery staple', encoded), true);
  assert.equal(await verifyPassword('incorrect password', encoded), false);
});

test('withdrawal intent canonicalization is deterministic and amount-bound', () => {
  const intent = {
    id: 'intent-1',
    walletBindingId: 'binding-1',
    chainId: 1,
    asset: 'eth',
    amountAtomic: '1000000',
    destination: '0x1111111111111111111111111111111111111111',
    nonce: 'nonce-1',
    expiresAt: '2026-09-24T12:00:00.000Z'
  };
  const first = canonicalWithdrawalIntent(intent);
  const second = canonicalWithdrawalIntent({ ...intent });
  assert.equal(first, second);
  assert.notEqual(first, canonicalWithdrawalIntent({ ...intent, amountAtomic: '2000000' }));
  assert.match(first, /^MELODIESPARK_WITHDRAWAL_INTENT_V1\|/);
});

test('atomic ETH conversion rejects invalid or imprecise values', () => {
  assert.equal(atomicEthAmount('0.1'), '100000');
  assert.throws(() => atomicEthAmount('0'), /greater than 0/);
  assert.throws(() => atomicEthAmount('1001'), /no more than 1000/);
  assert.throws(() => atomicEthAmount('0.0000001'), /below the supported precision/);
});

test('constant-time text comparison handles unequal lengths', () => {
  assert.equal(safeEqualText('abc', 'abc'), true);
  assert.equal(safeEqualText('abc', 'abcd'), false);
});
