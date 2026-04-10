# Feature Specification: Phase 016 Gap Audit And Closure

**Feature Branch**: `018-phase-016-gap-audit-and-closure`  
**Created**: 2026-04-09  
**Status**: Draft  
**Primary Execution Owners**: `agent-orchestrator` for framing, `agent-reviewer` for claim/code audit, `agent-implementer` for fixes, `agent-docs` for archive reconciliation, OpenCode for execution  
**Input**:
- `/Users/hanyramadan/token traker/docs/research/phase-018-phase-016-gap-audit-and-closure.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-016/completion-report.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/spec.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/quickstart.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/packages/core/src/db/desktop-period.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`

## Goal

Close the remaining implementation and reporting gaps left after Phase 016 so
the repo can truthfully claim period parity, scoped operator spend, and visible
notification state.

## Why This Phase Exists

Phase 016 moved the product in the right direction, but several items marked
`PASS` in the report and quickstart are still partial in the code:

- export is still old-contract
- tray title is still all-time
- menubar labels today's spend but feeds it all-time data
- overview is not fully period-scoped
- `1h` semantics are not actually truthful
- notification state is inspectable via API but not visibly surfaced in-app

## Problem Statement

The current Phase 016 state is dangerous in one specific way:

- several surfaces now *look* period-aware and operator-aware
- but not all of them are fed by period-correct data

That creates a truth mismatch, not just a missing enhancement.

## Scope

- correct true `1h / 1d / 7d / 1m / all` period semantics across data access
- bring overview into the same period contract as analytics
- bring export into the same period contract as analytics
- make tray title semantics match the intended scoped spend behavior
- make menubar scoped spend truthful rather than just relabeled
- add visible in-app notification-state UI or equivalent inspectable surface
- reconcile the Phase 016 archive and quickstart language with the actual
  implementation status
- complete the Phase 016 handoff archive

## Non-Goals

- no broad visual redesign beyond what is needed to expose notification state
  and truthful period semantics
- no new provider support work
- no unrelated analytics redesign

## Product Rules

- Scope labels and scope values must match.
- `1h` must mean a real rolling hour, not 24 hours, same-day, or a fallback.
- Overview, analytics, export, menubar, and tray must not diverge on period
  meaning.
- Notification state is not considered "visible" if it only exists in JSON or
  logs.
- Reports must not mark `PASS` for requirements that remain partial.

## Functional Requirements

- **FR-001**: System MUST implement truthful rolling-hour behavior for the `1h`
  period across all relevant query paths.
- **FR-002**: Overview MUST use period-scoped summary and session data rather
  than mostly all-time data.
- **FR-003**: Export MUST accept and honor the same canonical period contract as
  analytics.
- **FR-004**: Tray title and tooltip MUST use scoped spend or clearly labeled
  all-time spend, but not mix them.
- **FR-005**: Menubar MUST not label all-time spend as `Today spend`.
- **FR-006**: App MUST visibly surface latest notification delivery mode or
  suppression reason somewhere in-product.
- **FR-007**: Phase 016 quickstart and completion report MUST be updated to
  reflect final truth after fixes.
- **FR-008**: Phase 016 handoff archive MUST include the expected final report
  artifact if execution completes.

## Validation Requirements

- build and typecheck pass
- `1h` demonstrably differs from `1d` on period-aware queries where data allows
- overview, analytics, export, menubar, and tray agree on the selected scope
- notification-state UI is visible without inspecting network/API output
- Phase 016 archive no longer overclaims remaining partial behavior

## Recommended File Targets

- `packages/core/src/db/desktop-period.ts`
- `packages/core/src/db/database.ts`
- `packages/core/src/db/read-service.ts`
- `apps/desktop/src/index.ts`
- `apps/desktop/src/menubar.ts`
- `apps/desktop-tauri/src-tauri/src/lib.rs`
- `docs/handoffs/phase-016/completion-report.md`
- `specs/016-operator-time-windows-and-analytics-clarity/quickstart.md`
- `docs/handoffs/phase-016/` archive files

## Success Criteria

- **SC-001**: Phase 016 no longer claims export parity if export still uses the
  old contract.
- **SC-002**: Tray and menubar scoped spend are truthful, not just relabeled.
- **SC-003**: Overview joins analytics in using real period-scoped data.
- **SC-004**: `1h` is a real rolling-hour period.
- **SC-005**: Notification-state visibility exists in-app, not just via API.
