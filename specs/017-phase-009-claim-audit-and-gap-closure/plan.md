# Plan: Phase 009 Claim Audit And Gap Closure

## Phase Path

1. audit the archive claims against live code
2. fix concrete code contradictions first
3. reconcile Overview and analytics truth next
4. reconcile archive/spec language last
5. validate build, queries, and updated documentation together

## Workstreams

### Workstream A: Claim Audit

- map each major claim in the completion reports
- classify as:
  - still true
  - partial
  - false
  - regressed
  - scope-shifted

### Workstream B: Code Gap Closure

- fix provider summary SQL if still malformed
- resolve any unwired or placeholder Overview success blocks that were claimed
  complete
- review heuristic success-funnel semantics

### Workstream C: Archive Reconciliation

- update phase-009 reports so they reflect current truth
- make the narrow-vs-revisit distinction explicit
- ensure the quickstart and archive no longer contradict each other

## Risks

- archive cleanup can accidentally erase useful historical context
- code gaps may reveal wider regressions than the reports captured
- wording changes can become too vague if they try to reconcile everything at
  once

## Mitigations

- preserve history, but annotate scope explicitly
- distinguish code fixes from narrative fixes
- prefer precise "partial because..." wording over blanket "complete" language

## Completion Gates

- implementation gate: concrete code contradictions fixed
- review gate: claim-to-code mapping is explicit and defensible
- verification gate: build/typecheck/query validation passes
- docs gate: phase archive and current spec kit no longer contradict each other
