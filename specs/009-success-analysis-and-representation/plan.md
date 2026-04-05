# Plan: Success Analysis And Representation

## Phase Path

1. Lock the success-analysis model
2. Build the evidence subsystem
3. Extend the canonical session/domain layer
4. Wire shared analysis outputs into all surfaces
5. Validate compatibility and honesty
6. Reconcile docs and handoff artifacts

## Implementation Strategy

### Stage 1: Shared Model Lock

- extend session domain types with completion, verification, confidence, and
  success-signal fields
- preserve existing `outcome`, `efficiencyScore`, and `wasteScore`
- define a typed signal vocabulary that can grow without moving policy into
  adapters

### Stage 2: Evidence Subsystem

- create a shared evidence collector in `packages/core/src/analysis/`
- derive signals from current provider metadata first
- add optional local repo / git evidence when `projectPath` resolves inside a
  git repo
- add optional verification-command evidence when detectable
- classify evidence into positive, negative, neutral, and contradictory signals

### Stage 3: Score Composition

- compute:
  - `completionState`
  - `verificationState`
  - `successScore`
  - `executionQualityScore`
  - `reworkScore`
  - `valueDensityScore`
  - `analysisConfidence`
- map the old fields from the richer model instead of replacing them abruptly

### Stage 4: Cross-Surface Representation

- CLI gets success-aware summaries and explanations
- overview gets success-quality framing
- analytics gets funnel / verification / rework views
- menubar gets compact success cue
- leaderboard gets aggregated success-aware metrics only

### Stage 5: Validation

- verify compatibility with old data
- verify weak-evidence sessions do not show false failure
- verify contradiction signals reduce confidence
- verify no shared surface leaks private local evidence

## Risks To Name Early

- local git evidence may be noisy when sessions happen outside tracked repos
- verification-command detection may be sparse or inconsistent across providers
- over-aggressive contradiction logic could undercount useful progress
- cross-surface rollout raises coordination cost; representation must stay simple

## Success Test

If a user asks, "Was this spend worth it?", Token Tracker should now answer with:

- a likely success judgment
- a verification state
- a confidence level
- a concise explanation of what raised or lowered trust in that judgment

instead of only showing token totals and cost.
