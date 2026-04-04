# Token Tracker Constitution

## Core Principles

### I. Local-First Privacy
Token Tracker is a local-first product. Features MUST deliver value without a
cloud backend, and no prompt text, code bodies, or long transcript content may
be persisted or synced by default.

### II. Shared-Core Architecture
All product surfaces MUST build on one shared analytics core. Provider parsing,
normalization, pricing, scoring, and storage logic belong in `packages/core`,
not duplicated in CLI or UI surfaces.

### III. Explainable Analytics
Every inferred score or classification MUST be explainable. The product may use
 heuristics, but it must never present uncertain analytics as hard truth.

### IV. Vertical Slices Over Big Bang Delivery
Work must be delivered in independently testable slices. A provider importer,
CLI command, or UI panel should be useful on its own before broader polish or
cross-surface expansion.

### V. Evidence Before Claims
No task is complete until it is verified with concrete checks. At minimum,
changed code must pass type validation and the relevant local command path or
UI flow that proves the feature works.

## Product Constraints

- macOS is the primary v1 target
- shared code is TypeScript-first
- local SQLite is the source of truth for v1
- supported providers may expand, but unsupported or unvalidated providers must
  fail honestly rather than fabricate data
- cloud sync, teams, auth, and SaaS-only workflows are deferred until local MVP
  value is proven

## Execution Workflow

- Codex owns architecture, contracts, reviews, and acceptance criteria
- OpenCode executes bounded spec tasks against the current repo state
- each execution round should focus on one story slice or one cohesive task set
- after each OpenCode round, Codex reviews results before the next round begins

## Governance

This constitution overrides ad hoc implementation shortcuts. Any exception must
be documented in the relevant feature plan with a specific reason and a safer
alternative considered.

**Version**: 1.0.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-02
