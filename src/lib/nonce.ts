import { randomBytes } from "crypto";

interface NonceEntry {
  nonce: string;
  expiresAt: number;
}

const store = new Map<string, NonceEntry>();
const TTL_MS = 5 * 60 * 1000;

export function generateNonce(address: string): string {
  const nonce = randomBytes(32).toString("hex");
  store.set(address.toLowerCase(), {
    nonce,
    expiresAt: Date.now() + TTL_MS,
  });
  return nonce;
}

export function consumeNonce(address: string): string | null {
  const key = address.toLowerCase();
  const entry = store.get(key);
  if (!entry) return null;
  store.delete(key);
  if (Date.now() > entry.expiresAt) return null;
  return entry.nonce;
}
