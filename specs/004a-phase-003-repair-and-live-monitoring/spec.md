# Feature Specification: Phase 003 Repair And Live Monitoring

**Feature Branch**: `004a-phase-003-repair-and-live-monitoring`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: Child spec under Phase 004 competitive parity program.

## Goal

Repair the remaining drift and inconsistencies from Phase 003, then add the
live monitoring foundation needed for true ambient product behavior.

## Scope

This spec must cover all of the following:

- Phase 003 doc/roadmap/task honesty fixes
- reconciliation of claimed vs actual shipped behavior
- real-time file watching for supported local sources
- live refresh cadence controls
- first-class reset countdown UX
- session meters and weekly meters
- foundation for richer status refresh behavior

## Mandatory Repair Items From Phase 003

- remove inaccurate doc claims such as filter pills / clear-all if they are not
  actually shipped
- align `README.md`, `PROJECT_PLAN.md`, and `specs/003-monitoring-and-glanceable-ux/tasks.md`
  with reality
- resolve whether T019-T021 remain open, get implemented here, or are
  intentionally closed with explicit reasoning
- reconcile any drift introduced by `specs/004-ui-refinement/` and
  `specs/005-ui-polish/`
- reduce obvious maintainability risks in `apps/desktop/src/index.ts` if they
  block watcher/live-monitoring changes

## User Stories

### Story 1 - Honest Phase Closure

The repo accurately describes what Phase 003 did and did not ship.

### Story 2 - Real-Time Monitoring

Supported providers update automatically when source files change, without the
user manually refreshing the whole product.

### Story 3 - Reset Countdown And Metering

The product exposes first-class countdowns and session/weekly meters, not just
raw reset percentages.

### Story 4 - Local Monitoring Preferences

The user can control refresh cadence and default monitoring window with local
preferences.

## Requirements

- Implement file watching for supported local sources where technically
  practical.
- Add a refresh lifecycle that can be surfaced safely in desktop and menu bar.
- Add explicit 7-day and 30-day monitoring windows where relevant.
- Add human-readable countdowns for reset timing.
- Add session and weekly meter presentations where the data supports them.
- Add minimal local-only preferences for refresh cadence and default window.
- Keep all new behavior local-first by default.

## Mandatory Agents

- `agent-orchestrator`
- `agent-impeccable`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-debugging`

Use `agent-security` if any auth/token/cookie behavior is touched during this
spec.
