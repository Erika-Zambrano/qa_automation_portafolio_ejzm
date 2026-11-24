import { createHash } from 'node:crypto';
import { ApiError } from './errors';

type Entry = { fingerprint: string; status: number; body: unknown };
const store = new Map<string, Entry>();

export const fingerprint = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function lookup(scopeKey: string, bodyFingerprint: string): Entry | undefined {
  const entry = store.get(scopeKey);
  if (!entry) return undefined;
  if (entry.fingerprint !== bodyFingerprint) {
    throw new ApiError(422, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency-Key was already used with a different request body');
  }
  return entry;
}

export function save(scopeKey: string, entry: Entry) {
  store.set(scopeKey, entry);
}

export function resetIdempotency() {
  store.clear();
}
