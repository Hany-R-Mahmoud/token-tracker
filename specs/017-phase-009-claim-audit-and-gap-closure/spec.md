# Feature Specification: Phase 009 Claim Audit And Gap Closure

**Feature Branch**: `017-phase-009-claim-audit-and-gap-closure`  
**Created**: 2026-04-09  
**Status**: Draft  
**Primary Execution Owners**: `agent-orchestrator` for framing, `agent-reviewer` for claim/code audit, `agent-implementer` for fixes, `agent-docs` for archive reconciliation, OpenCode for execution  
**Input**:
- `/Users/hanyramadan/token traker/docs/research/phase-017-phase-009-claim-audit-and-gap-closure.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/completion-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/final-completion-report.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/quickstart.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/tasks.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`

## Goal

Reconcile what Phase 009 claimed to complete with what the repo currently
implements, then close the concrete gaps so the archive and code tell the same
truth.

## Why This Phase Exists

The repo currently carries contradictory statements about Phase 009:

- one archive path says it is fully complete with no remaining gaps
- the rewritten Phase 009 revisit spec says visual implementation is still not
  started
- at least one claimed bug fix and one claimed Overview deliverable are not
  reflected in the current code

That makes future planning unreliable.

## Problem Statement

The current Phase 009 history mixes three different things:

1. narrow success-analysis implementation
2. broader visual-analytics revisit planning
3. completion reports that speak more strongly than the current code and docs
   justify

This phase must restore one consistent source of truth.

## Scope

- audit completion claims against current code
- fix concrete code gaps that were claimed complete but are still absent or
  regressed
- reconcile Phase 009 archive documents with the current revisit spec kit
- relabel heuristic analytics views honestly when they are not based on direct
  aggregate counts
- produce a final explicit statement of what Phase 009 actually completed vs
  what remains delegated to later phases

## Non-Goals

- no full implementation of the broader Phase 009 visual redesign
- no new brand-system exploration
- no speculative redesign of overview/analytics beyond what is needed to make
  current claims truthful
- no phase renumbering or historical rewrite beyond necessary clarification

## Product And Documentation Rules

- The archive must not claim a bug is fixed if the current code still shows the
  bug.
- Reports must distinguish between:
  - original success-analysis completion
  - later visual-analytics revisit planning
- Heuristic views must be labeled as heuristic when they are not direct counts.
- Dead or unwired code should not be treated as delivered UI.

## Core Questions

1. Which Phase 009 claims are still true in the current code?
2. Which claims are false, partial, regressed, or scope-shifted?
3. Which issues need real code fixes?
4. Which issues need archive/documentation correction?
5. After this pass, can a new contributor understand exactly what Phase 009 did
   and did not finish?

## Functional Requirements

- **FR-001**: System MUST correct any current code issues that directly
  contradict archived "fixed" claims, including the provider summary SQL issue
  if still present.
- **FR-002**: System MUST reconcile Overview claim language with the actual
  wired UI, either by wiring the intended feature or downgrading the archive
  claim.
- **FR-003**: System MUST reconcile Phase 009 archive language with the later
  Phase 009 revisit spec so both can coexist without contradiction.
- **FR-004**: System MUST identify whether analytics success funnel views are
  heuristic or direct aggregate counts and label/document them honestly.
- **FR-005**: System MUST update the relevant quickstart/report/archive files so
  future handoffs do not inherit false completion assumptions.
- **FR-006**: Final reporting MUST explicitly separate:
  - what was completed in the original narrow Phase 009 success-analysis work
  - what remains part of the broader visual-analytics revisit

## Validation Requirements

- build and typecheck pass
- provider summary queries execute successfully after reconciliation
- any corrected Overview claim is reflected in the actual rendered surface or
  downgraded in docs
- Phase 009 archive documents no longer contradict the current revisit quickstart
- heuristic analytics views are labeled or documented honestly

## Recommended File Targets

- `packages/core/src/db/database.ts`
- `apps/desktop/src/index.ts`
- `docs/handoffs/phase-009/completion-report.md`
- `docs/handoffs/phase-009/final-completion-report.md`
- `specs/009-success-analysis-and-representation/quickstart.md`
- optional README or metric docs only if wording there becomes materially wrong

## Success Criteria

- **SC-001**: The repo no longer contains a Phase 009 completion claim that is
  contradicted by the current code.
- **SC-002**: The repo no longer contains mutually incompatible "Phase 009 is
  fully complete" and "implementation not started" stories without context.
- **SC-003**: Any remaining heuristic success views are described honestly.
- **SC-004**: A new implementer can tell what belongs to Phase 009 narrow
  success-analysis work versus the broader visual-analytics revisit.
