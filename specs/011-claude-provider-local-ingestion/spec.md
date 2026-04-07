# Feature Specification: Claude Provider Local Ingestion

**Feature Branch**: `011-claude-provider-local-ingestion`  
**Created**: 2026-04-05  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: `docs/reference-products.md`, Phase 011 research in
`/Users/hanyramadan/token traker/docs/research/phase-011-claude-provider-source-validation.md`,
the current adapter contract, current provider-status docs, and the machine's
validated Claude local file layout.

## Goal

Add **Claude** as a real local provider in Token Tracker by implementing a
Claude adapter that imports session JSONL files from `~/.claude/projects/`,
normalizes them into the canonical session model, and surfaces Claude honestly
across CLI, desktop analytics, and provider-status docs.

## Scope

- Claude source discovery from local project JSONL files
- bounded Claude session parsing into canonical session seeds
- CLI import / doctor / providers support for Claude
- desktop/provider-summary inclusion through existing shared read models
- provider-status and parity docs reconciliation
- fixture-based tests for Claude discovery, parsing, and incremental import

## Non-Goals

- no Claude browser-cookie integration
- no Claude OAuth or remote API integration
- no PTY-driven live Claude session control
- no Claude quota/reset countdown claims unless source evidence is validated
- no attempt to implement every Claude-side metric another product might expose
- no broad provider program beyond Claude in this phase

## Product Rules

- Claude support must be **local-first** and **evidence-based**.
- The product must not claim reset-window truth for Claude unless the source
  actually provides it.
- Noise files under `.claude/projects/` must not become fake sessions.
- Transcript text must remain ephemeral and privacy-safe; only bounded derived
  fields may be stored.
- Claude should feel like a first-class imported provider, not a hacked-in
  exception.

## Why This Phase Exists

The repo still describes Claude as unavailable due to lack of a validated local
session source, but that statement is now stale.

As of 2026-04-05:

- `docs/reference-products.md` already points to public products that rely on
  Claude local logs
- AI Token Monitor publicly documents
  `~/.claude/projects/**/*.jsonl` as a Claude source
- this machine currently contains real Claude project logs under
  `~/.claude/projects/`

The gap is no longer "can Claude be sourced locally?" The real gap is "can we
implement Claude cleanly, honestly, and without widening scope into unrelated
integrations?"

Phase 011 closes that gap.

## User Value

After this phase, a user who uses Claude locally should be able to:

1. import Claude sessions without special auth setup
2. see Claude alongside Codex and OpenCode in summaries and analytics
3. trust that Claude costs/tokens shown come from real local evidence
4. understand what Claude support includes and what it still does not include

## Source Strategy

### Primary source

- `~/.claude/projects/**/*.jsonl`

### Optional supplementary source

- `~/.claude/stats-cache.json`

Supplementary stats are optional. Their absence must not block Claude import.

### Explicit exclusions

OpenCode must exclude non-session or plugin-only files such as:

- `**/skill-injections.jsonl`
- any other file whose record family clearly does not represent a Claude session

If OpenCode discovers more noise-file patterns during implementation, it should
document them and exclude them explicitly.

## Required Claude Session Mapping

Claude import should produce one canonical session per validated Claude session
file.

### Required identity and timing fields

- `provider = 'claude'`
- `providerSessionId` from the best stable session identifier available
- `sourcePath` from the discovered JSONL path
- `startedAt` from the earliest trustworthy session/user timestamp
- `lastActivityAt` from the latest trustworthy record timestamp
- `endedAt` only when confidence is good enough to treat the session as ended

### Required derived session fields

- `projectPath` from observed `cwd` evidence where available
- `model` from the latest non-synthetic assistant model when available
- `modelFamily` from the parsed model string with the same boring normalization
  style used by existing adapters
- `title` derived from the first useful user prompt using existing text helpers
- `messageCount` from actual user + assistant conversation records
- `toolCallCount` only when the record shape supports it honestly; otherwise `0`
- token totals aggregated from assistant `message.usage` blocks
- cost fields computed through the existing pricing reader when model pricing is
  known

### Token mapping requirements

Claude usage should map conservatively:

- `input` from `usage.input_tokens`
- `output` from `usage.output_tokens`
- `cachedInput` from `usage.cache_read_input_tokens`
- `cachedWrite` from `usage.cache_creation_input_tokens` if that mapping is
  consistent enough, otherwise `0` with a documented warning
- `reasoning` only if the source provides a clearly separate field; otherwise `0`
- `total` recomputed from the token parts the adapter trusts

### Metadata requirements

Persist only bounded metadata that materially helps analysis or debugging, such
as:

- parser version
- parser warnings
- Claude entrypoint/version if present
- git branch if present
- synthetic-record counts
- whether optional supplementary stats were found

Do not persist raw prompt text, raw assistant text, or long freeform transcript
content.

## Parsing Guardrails

### Session-file qualification

A Claude JSONL file qualifies as a session file only if it contains a plausible
conversation record family, not just plugin instrumentation or metadata noise.

Examples of qualifying evidence:

- `type: "user"` with user message content
- `type: "assistant"` with assistant message and/or usage
- stable session id or trustworthy timestamp chain

### Synthetic / error record handling

Synthetic assistant records and transient error records may exist.

Rules:

- synthetic records may contribute timing evidence
- synthetic records must not override a better real model selection
- synthetic-only files should not create misleading high-confidence sessions
- parse warnings should capture degraded confidence cases

### Supplementary stats handling

If `~/.claude/stats-cache.json` exists and the schema is safe to consume:

- use it only for narrow enrichments that are reproducible and clearly labeled
- do not make the adapter depend on it
- do not block import when it is missing or malformed

## Surface Requirements

### Core / storage layer

Required:

- `ClaudeAdapter` in the core adapter layer
- export from the core package
- incremental checkpointing using file-based cursor strategy
- fixture tests and malformed-input handling

### CLI

Required:

- `ttm import` includes Claude automatically
- `ttm doctor` reports Claude source health
- `ttm providers` reports Claude as validated once the adapter ships

Required behavior:

- missing Claude sources produce honest warnings, not crashes
- provider output must distinguish "validated provider with no files found" from
  "provider unavailable / unsupported"

### Desktop / analytics

Required:

- Claude sessions appear in summary and analytics through existing shared read
  models once imported
- provider summaries, filters, tables, and charts must include Claude without
  special-case breakage
- no Claude reset UI should imply true quota support if reset data is absent

### Docs

Required:

- reconcile `docs/reference-products.md` implication mismatch if needed
- update provider status docs and provider matrix docs
- document Claude support as local JSONL import
- document missing quota/reset truth honestly

## Acceptance Scenarios

1. **Given** Claude project JSONL files exist under `~/.claude/projects/`,
   **When** the user runs import, **Then** Claude sessions are stored and appear
   in summaries and analytics.
2. **Given** only noise files such as `skill-injections.jsonl` exist,
   **When** the adapter discovers sources, **Then** it does not create fake
   Claude sessions.
3. **Given** `~/.claude/stats-cache.json` is missing, **When** import runs,
   **Then** Claude import still succeeds without pretending supplementary data
   exists.
4. **Given** Claude model pricing is unknown, **When** Claude sessions are
   imported, **Then** token data still imports and pricing remains honestly
   unpriced.
5. **Given** Claude sessions lack reset-window truth, **When** the user views
   desktop or CLI surfaces, **Then** the product does not imply a real reset
   countdown for Claude.

## OpenCode Execution Contract

OpenCode must:

- start with `agent-orchestrator`
- use `agent-implementer` for the adapter and wiring work
- use `agent-tester` for fixtures, duplicate-import checks, and CLI validation
- use `agent-reviewer` for architectural fit and honesty checks
- use `agent-docs` only after implementation and validation are real

OpenCode must keep the phase narrow:

- Claude local ingestion first
- optional `stats-cache.json` enrichment second
- no browser/OAuth/auth-flow expansion unless the prompt is explicitly changed

## Acceptance Standard

Phase 011 is complete only when:

- a real `ClaudeAdapter` exists and is wired into import + doctor
- Claude sessions import from `~/.claude/projects/**/*.jsonl`
- known noise files do not create fake sessions
- Claude appears in existing summary/analytics flows after import
- provider-status/docs move from "unavailable" to an honest supported state
- no surface falsely claims Claude quota/reset truth
- tests cover discovery, parsing, malformed input, and duplicate import behavior
