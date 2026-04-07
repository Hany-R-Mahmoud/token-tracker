# Phase 011 Research: Claude Provider Source Validation

**Created**: 2026-04-05  
**Purpose**: establish whether Claude can move from "blocked / unavailable" to a
validated local provider in Token Tracker without drifting into browser auth,
cloud sync, or speculative quota claims.

## Executive Decision

Phase 011 should implement **Claude local session ingestion** now.

This decision is justified by two independent reference products and current
on-device evidence:

- `docs/reference-products.md` already records that AI Token Monitor reads
  `~/.claude/projects/**/*.jsonl` and optionally `~/.claude/stats-cache.json`.
- CodexBar publicly documents Claude support via multiple strategies and also
  documents local Claude cost scanning as part of its product surface.
- This machine currently has active Claude project logs under
  `~/.claude/projects/`, including normal session JSONL files for this repo.

The right Phase 011 posture is therefore:

- implement a **local-file Claude adapter**
- treat `stats-cache.json` as **optional enrichment only**
- do **not** claim quota/reset truth for Claude unless validated separately
- do **not** chase browser cookies, OAuth, PTY control, or remote APIs in this
  phase

## Reference Product Evidence

### AI Token Monitor

Public README / repo positioning shows:

- tracks Claude Code and Codex usage in real time
- reads Claude session files from `~/.claude/projects/**/*.jsonl`
- optionally reads `~/.claude/stats-cache.json`
- stays offline by default unless leaderboard is enabled

Why it matters:

- proves a local Claude file strategy is product-real, not hypothetical
- validates the same path family we can use in Token Tracker
- suggests `stats-cache.json` is supplementary, not mandatory

Source:

- <https://github.com/soulduse/ai-token-monitor>

### CodexBar

Public README / docs positioning shows:

- Claude is a supported provider
- Claude support can use OAuth API, browser cookies, or CLI PTY fallback
- local cost usage scan exists for Codex + Claude
- privacy-first local parsing is part of product positioning

Why it matters:

- proves Claude belongs in the practical provider set, not just the aspirational
  one
- confirms that broader Claude integrations exist, but they are not required to
  achieve a useful product increment
- reinforces that a narrow local-first first step is reasonable

Source:

- <https://github.com/steipete/CodexBar>

## Current Repo Evidence

### What already exists

- `ProviderId` already includes `claude` in
  `packages/core/src/domain/session.ts`.
- `ProviderPaths` already includes `claudeRoot` in
  `packages/core/src/adapters/types.ts`.
- The provider adapter contract already calls out `claude` checkpoint strategy in
  `docs/specs/provider-adapter-contract.md`.
- Context-budget logic already knows several Claude model names in
  `packages/core/src/domain/context-audit.ts`.

### What is currently wrong

- `packages/core/src/adapters/types.ts` still marks Claude as
  `strategyStatus: 'unavailable'` with note `no validated local session source`.
- `specs/006e-provider-validation-and-support-closure/provider-matrix.md` says
  no validated local Claude session source exists.
- CLI import/doctor wiring only instantiates `CodexAdapter` and
  `OpenCodeAdapter`.

This is now stale relative to both public reference products and this machine's
actual file system.

## On-Device Validation (2026-04-05)

### Observed paths

- `~/.claude/` exists on this machine.
- `~/.claude/projects/` exists and contains project-scoped JSONL files.
- Example noise path observed:
  `~/.claude/projects/.../vercel-plugin/skill-injections.jsonl`
- Example real session paths observed:
  `~/.claude/projects/-Users-hanyramadan-token-traker/<uuid>.jsonl`

### Observed record families

Real session files on this machine include top-level record types such as:

- `user`
- `assistant`
- `system`
- `permission-mode`
- `file-history-snapshot`
- `last-prompt`

### Observed useful fields

Useful fields observed in real session files:

- top-level `sessionId`
- top-level `timestamp`
- top-level `cwd`
- top-level `gitBranch`
- `message.role`
- `message.model`
- `message.content`
- `message.usage.input_tokens`
- `message.usage.output_tokens`
- `message.usage.cache_read_input_tokens`
- `message.usage.cache_creation_input_tokens`

### Observed edge cases

The adapter must account for these:

- `skill-injections.jsonl` exists under project trees and is not a real Claude
  conversation session file
- some assistant messages are synthetic or error-oriented and use model
  `"<synthetic>"`
- some assistant records expose usage but have only `thinking` content
- `~/.claude/stats-cache.json` is **absent** on this machine right now

## Parsing Implications

### Safe conclusions

- A Claude adapter can discover from `~/.claude/projects/**/*.jsonl`.
- It must explicitly ignore known non-session files such as
  `skill-injections.jsonl`.
- It should derive one canonical session per real session file.
- It can aggregate usage from assistant message `usage` blocks.
- It should prefer non-synthetic assistant models when choosing the session
  model.
- It can derive `projectPath` from observed `cwd` values in user/system records.

### Things Phase 011 must not pretend are validated

- true Claude quota windows
- real reset countdowns
- browser-authenticated dashboard data
- OAuth-backed usage APIs
- reliable tool-call counts unless a stable tool-use record shape is observed and
  tested

## Recommended Phase 011 Product Position

Ship Claude as:

- **validated local provider**
- **session / cost / token analytics capable**
- **no quota/reset truth**
- **offline/local-first**

Update repo language accordingly:

- Claude becomes supported for local import
- Claude remains unsupported for quota-backed reset windows unless future
  evidence lands

## Recommended Implementation Target

Minimum credible implementation:

1. add `packages/core/src/adapters/claude.ts`
2. export it from `packages/core/src/index.ts`
3. wire it into CLI import + doctor
4. update provider status / docs from unavailable to validated
5. add fixture-based tests for discovery, parsing, malformed lines, noise-file
   exclusion, and duplicate import

Optional but acceptable in the same phase:

- opportunistic `stats-cache.json` enrichment if the file exists and the schema
  is simple enough

Not required for phase completion:

- new UI shells
- browser/OAuth auth flows
- reset-window meters for Claude
- leaderboard changes
