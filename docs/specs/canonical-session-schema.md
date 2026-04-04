# Canonical Session Schema

## Goal

Define the single normalized shape every provider adapter must emit before data
is stored locally or analyzed.

This schema is designed for:

- local-first storage
- explainable analytics
- provider-specific extensibility
- future optional cloud export of safe aggregates

It is not designed to preserve raw transcript fidelity.

## Design Rules

- Adapters normalize provider data into one session model.
- Raw provider payloads stay out of the main analytics tables.
- Text content is minimized and marked by sensitivity.
- Every derived metric must be reproducible from stored fields.
- Unknown provider fields go into bounded metadata, not top-level drift.

## Session Shape

```ts
export type ProviderId =
  | 'codex'
  | 'claude'
  | 'cursor'
  | 'opencode';

export type SessionOutcome =
  | 'success'
  | 'partial'
  | 'abandoned'
  | 'reverted'
  | 'unknown';

export type TaskCategory =
  | 'bug_fix'
  | 'feature'
  | 'refactor'
  | 'analysis'
  | 'content'
  | 'ops'
  | 'other'
  | 'unknown';

export interface CanonicalSession {
  id: string;
  provider: ProviderId;
  providerSessionId: string;
  sourcePath: string;
  projectPath: string | null;
  startedAt: string;
  endedAt: string | null;
  lastActivityAt: string;
  durationMs: number | null;
  model: string | null;
  modelFamily: string | null;
  title: string | null;
  messageCount: number;
  toolCallCount: number;
  attemptCount: number;
  tokens: SessionTokenUsage;
  costs: SessionCostUsage;
  cache: SessionCacheUsage;
  outcome: SessionOutcome;
  outcomeConfidence: number | null;
  taskCategory: TaskCategory;
  taskCategoryConfidence: number | null;
  efficiencyScore: number | null;
  wasteScore: number | null;
  anomalyScore: number | null;
  loopCount: number;
  resetWindow: SessionResetWindow | null;
  flags: string[];
  explanation: SessionExplanation;
  metadata: SessionMetadata;
}

export interface SessionTokenUsage {
  input: number;
  output: number;
  cachedInput: number;
  cachedWrite: number;
  reasoning: number;
  total: number;
}

export interface SessionCostUsage {
  inputUsd: number;
  outputUsd: number;
  cacheReadUsd: number;
  cacheWriteUsd: number;
  totalUsd: number;
  pricingSnapshotId: string | null;
}

export interface SessionCacheUsage {
  hitRate: number | null;
  cacheEligibleTokens: number | null;
}

export interface SessionResetWindow {
  kind: 'session' | 'daily' | 'weekly' | 'monthly' | 'credits';
  resetsAt: string | null;
  remainingPercent: number | null;
}

export interface SessionExplanation {
  scoreVersion: string;
  outcomeReasons: string[];
  scoreFactors: ScoreFactor[];
  wasteReasons: string[];
}

export interface ScoreFactor {
  key: string;
  label: string;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface SessionMetadata {
  parserVersion: string;
  parserWarnings: string[];
  providerMetadata: Record<string, string | number | boolean | null>;
  containsSensitiveText: boolean;
}
```

## Required Fields

These fields must be present for every stored session:

- `id`
- `provider`
- `providerSessionId`
- `sourcePath`
- `startedAt`
- `lastActivityAt`
- `messageCount`
- `toolCallCount`
- `attemptCount`
- `tokens`
- `costs`
- `outcome`
- `taskCategory`
- `loopCount`
- `flags`
- `metadata`

## Derived Field Rules

- `id` is generated locally as a stable hash of provider, provider session id,
  source path, and session start time.
- `durationMs` is null when end time is missing or untrustworthy.
- `tokens.total` is always recomputed from token parts.
- `costs.totalUsd` is always recomputed from cost parts.
- `attemptCount`, `outcome`, `taskCategory`, `efficiencyScore`, `wasteScore`,
  `anomalyScore`, and `loopCount` are derived by analyzers, not raw adapters.

## Sensitive Data Policy

Allowed in the canonical session:

- bounded titles or short labels when already present in provider metadata
- file paths
- model names
- timestamps
- numeric usage
- analyzer explanations

Not allowed in the canonical session:

- full prompt text
- response text
- source code bodies
- tool payload bodies
- long freeform transcript excerpts

If an adapter needs transcript access for heuristics, it should use an
ephemeral parse path and persist only derived signals plus warning flags.

## Provider Adapter Contract

Each adapter should emit:

```ts
export interface ProviderAdapterResult {
  sessions: CanonicalSessionSeed[];
  checkpoint: ProviderCheckpoint;
  warnings: string[];
}
```

`CanonicalSessionSeed` is the pre-analysis subset of `CanonicalSession`.
The analysis engine enriches it into the final stored shape.
