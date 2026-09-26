import { getAddress, isAddress, verifyMessage } from 'viem';
import { SUPPORTED_CHAINS } from './catalog.mjs';

const allowedChains = new Set(SUPPORTED_CHAINS.map((chain) => chain.id));

export function normalizeAddress(value) {
  if (!isAddress(String(value || ''))) throw new Error('Invalid EVM wallet address.');
  return getAddress(String(value));
}

export function assertSupportedChain(chainId) {
  const parsed = Number.parseInt(chainId, 10);
  if (!allowedChains.has(parsed)) throw new Error('Unsupported chain. Use Ethereum Mainnet or Sepolia in v0.1.');
  return parsed;
}

export async function verifyWalletSignature({ address, message, signature }) {
  const normalized = normalizeAddress(address);
  const valid = await verifyMessage({ address: normalized, message: String(message || ''), signature: String(signature || '') });
  if (!valid) throw new Error('Wallet signature verification failed.');
  return normalized;
}

export function toHexMessage(message) {
  const bytes = new TextEncoder().encode(String(message));
  let hex = '0x';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

export function atomicEthAmount(amountDisplay) {
  const value = Number(amountDisplay);
  if (!Number.isFinite(value) || value <= 0 || value > 1000) {
    throw new Error('ETH amount must be greater than 0 and no more than 1000.');
  }
  const atomic = BigInt(Math.round(value * 1e6));
  if (atomic <= 0n) throw new Error('Amount is below the supported precision.');
  return atomic.toString();
}
