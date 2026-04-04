import { createHash } from 'node:crypto';

export function stableHash(parts: readonly string[]): string {
  const hash = createHash('sha256');
  for (const part of parts) {
    hash.update(part);
    hash.update('\0');
  }

  return hash.digest('hex');
}

