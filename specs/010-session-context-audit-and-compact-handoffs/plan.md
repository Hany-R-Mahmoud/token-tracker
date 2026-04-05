# Plan: Session Context Audit And Compact Handoffs

## Phase Path

1. Define the shared context-audit model and derivation rules
2. Implement the session-detail audit surface first
3. Roll context-pressure summaries into overview, analytics, menubar, and CLI
4. Adopt compact prompt/report protocol files for the phase handoff itself
5. Verify privacy boundaries and docs honesty

## Workstreams

### Workstream A: Shared Context Audit Model

- derive context breakdown categories
- derive pressure state
- derive warning heuristics
- bridge to Phase 009 success outputs

### Workstream B: Product Surfaces

- session detail
- overview
- analytics
- menubar
- CLI

### Workstream C: Prompt And Reporting Efficiency

- use compact execution/reporting baseline files
- keep the Phase 010 prompt short and file-referenced
- archive prompt/report artifacts in the phase handoff folder

## Risks

- data precision may differ by provider
- context-limit evidence may be missing on some sessions
- message lineage may become noisy if displayed without hierarchy
- dense detail UI could become visually heavy if too many charts are added

## Mitigations

- label heuristic or missing states explicitly
- use one primary composition chart instead of many
- keep the detail screen dense but structured
- keep compact surfaces to one or two cues only

## Completion Gates

- implementation gate: context audit model and all required surfaces wired
- review gate: no odd patterns, no architectural drift
- verification gate: required checks pass and the new surfaces render
- security gate: no raw private content leaks into shared surfaces
- docs gate: handoff protocol and phase docs match reality
