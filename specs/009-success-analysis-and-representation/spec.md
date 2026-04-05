# Feature Specification: Success Analysis And Representation

**Feature Branch**: `009-success-analysis-and-representation`  
**Created**: 2026-04-05  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Phase 009 research cornerstone in
`/Users/hanyramadan/token traker/docs/research/phase-009-success-analysis-research.md`,
current analysis model in `packages/core/src/analysis/`, current session domain
types in `packages/core/src/domain/session.ts`, and current multi-surface
product behavior in CLI, desktop, menubar, and leaderboard.

## Goal

Make Token Tracker analyze whether token consumption produced successful
progress, not just how much was consumed.

Phase 009 introduces the project's first explicit **success-truth layer**:

- separate completion from verification
- distinguish useful progress from expensive churn
- make confidence visible
- represent that truth consistently across all product surfaces

## Scope

- shared-core success analysis model
- evidence synthesis subsystem
- backward-compatible session model extension
- CLI success-aware output
- desktop overview and analytics success-aware representation
- menubar compact success cue
- leaderboard aggregated success-aware metrics
- docs reconciliation

## Non-Goals

- no cloud telemetry
- no external provider APIs
- no adapter-level scoring policy
- no exposure of raw git diffs, raw test logs, or private local evidence in
  shared surfaces
- no claim of perfect success truth where evidence is only partial

## Product Rules

- Raw token totals are not value metrics by themselves.
- Missing verification evidence must reduce confidence, not imply failure.
- Provider-native completion signals are useful but insufficient alone.
- Shared analysis policy must live outside adapters.
- Leaderboard surfaces may only use aggregated, privacy-safe outputs.

## Analysis Model

Keep existing fields for backward compatibility:

- `efficiencyScore`
- `wasteScore`
- `outcome`
- `outcomeConfidence`

Add these derived fields to the canonical session layer:

- `completionState: 'completed' | 'partial' | 'abandoned' | 'reverted' | 'unknown'`
- `verificationState: 'verified' | 'probable' | 'contradicted' | 'missing'`
- `successScore: number | null`
- `executionQualityScore: number | null`
- `reworkScore: number | null`
- `valueDensityScore: number | null`
- `analysisConfidence: number | null`
- `successSignals: SuccessSignal[]`

Add typed signal support:

```ts
type SuccessSignalKind =
  | 'provider_completion'
  | 'verification_command'
  | 'repo_change'
  | 'repair_loop'
  | 'error_burst'
  | 'revert_indicator'
  | 'cache_efficiency'
  | 'human_stop';

interface SuccessSignal {
  kind: SuccessSignalKind;
  direction: 'positive' | 'negative' | 'neutral';
  weight: number;
  confidence: number;
  label: string;
  evidence: string;
}
```

## Metric Intent

- `successScore`: did this session likely produce useful progress?
- `executionQualityScore`: how efficiently was that progress reached?
- `reworkScore`: how much churn, repair, or reversal burden happened?
- `valueDensityScore`: how much useful progress relative to spend, tokens, and time?
- `analysisConfidence`: how much trustworthy evidence exists?

## Evidence Collection

Do not move scoring logic into adapters.

Create a shared analysis/evidence subsystem that derives signals from:

- provider-native completion and metadata already present in canonical sessions
- optional local repo / git evidence when `projectPath` is a git repo
- optional verification-command evidence when observable
- loop, retry, task-complete, and error markers
- contradiction signals such as revert-like patterns or completion without
  verification

### Evidence Levels

- **Level 1**: current provider/session evidence only
- **Level 2**: local repo diff / git evidence
- **Level 3**: verification-command evidence when detectable

If Level 2 or 3 evidence is unavailable:

- fall back safely
- lower confidence
- do not imply failure

## Decision Rules

### Completion State

- `completed`: strong provider-native completion evidence
- `partial`: some progress, but no strong completion
- `abandoned`: session stopped without completion and with weak forward signal
- `reverted`: signals suggest reversal or contradiction after apparent progress
- `unknown`: not enough evidence to classify

### Verification State

- `verified`: explicit technical or durable completion evidence exists
- `probable`: positive completion signals exist, but proof is incomplete
- `contradicted`: evidence undermines apparent success
- `missing`: verification evidence was not observed

### Confidence Behavior

Confidence must combine:

- quantity of evidence
- diversity of evidence
- consistency of evidence
- contradiction penalties

Missing verification should lower confidence more than success.

## Representation Across All Surfaces

### CLI

- add success-aware summary output
- show verification state and confidence
- show major positive and negative success signals
- explain rework / waste burden

### Desktop Overview

- move from cost-only framing to outcome-aware framing
- add success-quality hero
- add cost-vs-success visual
- surface verification-state distribution

### Analytics

- add success funnel
- add verification breakdown
- add cost-to-success trend
- add rework concentration or recovery-burden view
- add provider/model value-density comparison

### Menubar

- add compact success-quality cue
- preserve glanceability
- surface verified/probable/missing state compactly
- avoid cluttering the compact view with full evidence detail

### Leaderboard

- use privacy-safe aggregated success-aware metrics only
- do not expose raw git/test details
- use the richer model only through aggregated scoring-safe outputs

## Technical Guardrails

- keep adapters boring and predictable
- centralize scoring policy in shared analysis code
- preserve backward compatibility for existing fields
- do not break existing routes or readers
- keep evidence collection best-effort and local-only

## Privacy And Trust Guardrails

- never expose raw git diff content
- never expose raw test output or raw local command traces in leaderboard or
  shared views
- when evidence is weak, say so explicitly
- do not overclaim "verified" unless real verification evidence exists

## OpenCode Execution Contract

OpenCode must use:

1. `agent-orchestrator`
2. `agent-implementer`
3. `agent-tester`
4. `agent-reviewer`
5. `agent-docs`
6. `agent-debugging`

Optional:

- `agent-security` only if local evidence collection or shared-surface
  representation raises sensitive data-boundary concerns

OpenCode must implement:

1. shared analysis model
2. evidence subsystem
3. backward-compatible storage/domain updates
4. CLI representation
5. desktop + analytics representation
6. menubar representation
7. leaderboard aggregated representation
8. docs reconciliation

## Acceptable Completion

- sessions carry the richer success-analysis model
- adapters remain policy-free
- all surfaces can represent success truth without overclaiming certainty
- missing evidence lowers confidence instead of implying failure
- docs describe the model honestly
