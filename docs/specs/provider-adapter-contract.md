# Provider Adapter Contract

## Goal

Every provider implementation must look boring and predictable.

Adapters should only do four things:

1. discover source files or databases
2. parse incrementally
3. normalize into canonical seeds
4. report health, warnings, and checkpoints

They should not own product logic, scoring, or UI-oriented decisions.

## Interface

```ts
import type { CanonicalSession } from './canonical-session-schema';

export interface ProviderAdapter {
  readonly provider: ProviderId;
  readonly version: string;

  discover(context: AdapterContext): Promise<DiscoveryResult>;
  import(context: AdapterContext): Promise<ImportResult>;
  healthCheck(context: AdapterContext): Promise<AdapterHealth>;
}

export interface AdapterContext {
  storage: AdapterStorage;
  pricing: PricingReader;
  clock: Date;
  paths: ProviderPaths;
  limits: AdapterLimits;
}

export interface DiscoveryResult {
  sources: DiscoveredSource[];
  warnings: string[];
}

export interface ImportResult {
  sessions: CanonicalSessionSeed[];
  checkpointWrites: ProviderCheckpoint[];
  warnings: string[];
  metrics: AdapterImportMetrics;
}

export interface AdapterHealth {
  status: 'ok' | 'degraded' | 'broken';
  sourcesFound: number;
  lastSuccessfulImportAt: string | null;
  issues: string[];
}
```

## Responsibilities

### Adapter owns

- source path discovery
- provider-specific parsing
- mapping raw usage fields to canonical numeric fields
- stable checkpointing for incremental imports
- parser warnings and diagnostics

### Adapter does not own

- efficiency scoring
- outcome classification policy
- anomaly detection
- storage schema decisions
- UI formatting
- export shaping

## Discovery Rules

- Discovery must be explicit and testable.
- Every adapter returns the exact sources it plans to read.
- Missing sources should produce warnings, not crashes.
- Provider-specific path assumptions must be documented.

## Checkpoint Rules

Checkpointing must support incremental import without duplicate sessions.

```ts
export interface ProviderCheckpoint {
  provider: ProviderId;
  sourceId: string;
  cursorType: 'byte_offset' | 'mtime' | 'row_id' | 'timestamp';
  cursorValue: string;
  updatedAt: string;
}
```

Recommended checkpoint strategy:

- `codex`: byte offset or file timestamp plus stable session id guard
- `claude`: byte offset or file timestamp plus stable session id guard
- `cursor`: depends on validated source shape
- `opencode`: row id or timestamp for SQLite-backed sources

## Import Guarantees

Each import pass must be:

- idempotent
- bounded
- resumable
- debuggable

Import code must never assume:

- files are well-formed
- sessions are complete
- token fields are present
- timestamps are ordered

## Warning Categories

Use stable warning keys:

- `source_not_found`
- `source_unreadable`
- `malformed_record`
- `unknown_model`
- `missing_token_fields`
- `timestamp_repaired`
- `partial_session`
- `provider_format_changed`

Warnings should be machine-readable and also human-explainable in CLI output.

## Test Contract

Each adapter needs:

- fixture-based import tests
- malformed input tests
- duplicate import tests
- checkpoint resume tests
- health check tests

## Rollout Order

Build adapters in this order:

1. `codex`
2. `claude`
3. `opencode`
4. `cursor` as experimental until source validation is complete
