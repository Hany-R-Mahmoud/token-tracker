# Feature Specification: Session Context Audit And Compact Handoffs

**Feature Branch**: `010-session-context-audit-and-compact-handoffs`  
**Created**: 2026-04-05  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Phase 010 research cornerstone in
`/Users/hanyramadan/token traker/docs/research/phase-010-session-context-and-prompt-efficiency.md`,
Phase 009 success model, current desktop session detail and analytics surfaces,
current CLI output, and current handoff archive/protocol docs.

## Goal

Add a first-class **session context audit** layer to Token Tracker and reduce
Codex↔OpenCode handoff waste by moving repeated prompt/report boilerplate into
shared files.

This phase should make heavy or suspicious sessions explainable.

## Scope

- session-level context audit model and derived metrics
- session detail context audit UI
- overview / analytics / menubar / CLI context-pressure representation
- compact prompt/report protocol adoption
- docs and handoff structure updates required for the compact workflow

## Non-Goals

- no raw transcript export
- no cloud tracing backend
- no attempt to fully clone OpenCode's session page
- no rewrite of the current app shell or routing model
- no design-system overhaul beyond what this information architecture requires

## Product Rules

- Session context inspection must explain composition, not just totals.
- Context pressure must connect back to Phase 009 success analysis.
- Raw evidence must remain privacy-safe and local-first.
- Detail surfaces may be dense; ambient surfaces must remain compact.
- Prompt compaction must reduce repeated boilerplate, not reduce clarity.

## Why This Phase Exists

Token Tracker currently explains cost, provider state, and success truth better
than before, but it still does not explain **why a specific session consumed so
much context**.

Phase 010 closes that gap.

## Core User Questions

For any session, the product should answer:

1. How large was this session relative to its context budget?
2. What categories consumed the context?
3. Was the session tool-heavy, retry-heavy, cache-heavy, or otherwise unusual?
4. Did the context spend lead to useful progress?
5. What should the user look at next?

## Session Context Audit Model

Add a shared derived context-audit layer for session detail and rollups.

### Required derived fields

- `contextLimit: number | null`
- `contextUsagePercent: number | null`
- `contextPressureState: 'low' | 'medium' | 'high' | 'critical' | 'unknown'`
- `inputTokens: number | null`
- `outputTokens: number | null`
- `reasoningTokens: number | null`
- `cacheReadTokens: number | null`
- `cacheWriteTokens: number | null`
- `userMessages: number | null`
- `assistantMessages: number | null`
- `toolCallCount: number | null`
- `contextBreakdown: ContextBreakdown[]`
- `contextWarnings: string[]`

### Required breakdown type

```ts
type ContextBreakdownKind =
  | 'user'
  | 'assistant'
  | 'tool'
  | 'cache'
  | 'reasoning'
  | 'verification'
  | 'other';

interface ContextBreakdown {
  kind: ContextBreakdownKind;
  tokens: number;
  percent: number | null;
  label: string;
}
```

## Context Audit Decision Rules

### Pressure State

- `low`: comfortably below the context budget
- `medium`: moderate usage but not risky
- `high`: meaningfully close to the limit
- `critical`: near-limit or limit-risk behavior
- `unknown`: missing context-limit evidence

### Warning Heuristics

Derive warnings such as:

- tool-call dominance
- retry / repair inflation
- near-limit session
- high spend with low value density
- low cache benefit
- verification-heavy but low success outcome

Warnings must be evidence-based and never imply exact truth when data is weak.

## Surface Requirements

### Session Detail

Session detail is the primary Phase 010 destination.

Required:

- context facts grid
- primary stacked context breakdown bar
- context pressure badge
- context warning list
- raw message / event lineage section
- bridge card tying context pressure to Phase 009 success analysis

### Overview

Required:

- summary card for context health
- count of near-limit sessions
- count of tool-heavy sessions
- "most context-heavy sessions" panel

### Analytics

Required:

- context composition by provider
- context pressure distribution
- top sessions by context usage percent
- cost vs context pressure view
- success vs context pressure view

### Menubar

Required:

- compact context health cue
- near-limit session count or equivalent compact signal
- no dense evidence list in the compact shell

### CLI

Required:

- context breakdown in session detail output
- pressure state and warning lines
- concise formatting by default

## Data And Privacy Guardrails

- never expose raw prompt text or transcripts in shared surfaces
- never expose raw message content in leaderboard or exported public views
- raw lineage in session detail must remain local-only
- if breakdown precision is heuristic, label it honestly

## Handoff Compaction Stream

Phase 010 also introduces a reusable prompt/report compaction baseline.

### Required repo-level outcome

Future Codex↔OpenCode handoffs should reference:

- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

instead of repeating large stable blocks inline.

### Required behavioral rule

The inline prompt should contain only:

- current mission
- read-first files
- phase-specific constraints
- phase-specific acceptance criteria

## OpenCode Execution Contract

OpenCode must use the compact handoff protocol files above and keep the prompt
focused on the phase-specific mission.

OpenCode must still start with `agent-orchestrator`, then use the specialist set
needed by the actual work.

## Acceptance Standard

Phase 010 is complete only when:

- context audit is available in session detail
- context pressure and composition are visible across the required surfaces
- Phase 009 success metrics and Phase 010 context metrics are bridged
- compact handoff protocol files are adopted for this phase's own execution and
  reporting
- docs describe the new surface honestly
