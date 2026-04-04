# Implementation Plan: Competitive Parity Program

**Branch**: `004-competitive-parity` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/004-competitive-parity/spec.md`

## Summary

Phase 004 is a multi-spec program that closes the remaining competitive gaps
versus AI Token Monitor and CodexBar. It starts by repairing Phase 003 drift,
then adds live monitoring, richer analytics and sharing, stronger ambient
surfaces, and broader provider/status coverage.

## Execution Order

### Step 1 - Repair And Live Monitoring

Execute:

- `/Users/hanyramadan/token traker/specs/004a-phase-003-repair-and-live-monitoring/`

### Step 2 - Analytics, Sharing, And Themes

Execute:

- `/Users/hanyramadan/token traker/specs/004b-analytics-sharing-and-theme-parity/`

### Step 3 - Ambient Surfaces And Platform Parity

Execute:

- `/Users/hanyramadan/token traker/specs/004c-ambient-surfaces-and-platform-parity/`

### Step 4 - Provider Expansion And Status Layer

Execute:

- `/Users/hanyramadan/token traker/specs/004d-provider-expansion-and-status-layer/`

## Mandatory Validation Gates

- Gate A: Spec 004a must pass before 004b starts.
- Gate B: Spec 004b must pass before 004c starts.
- Gate C: Spec 004c must pass before 004d starts.
- Gate D: Every spec must end with `agent-tester` and `agent-reviewer`.
- Gate E: `agent-docs` must reconcile README / PROJECT_PLAN / spec tasks after
  each completed spec.

## Architecture Constraints

- Preserve the current monorepo.
- Prefer extending `packages/core` read models and adapters.
- Preserve `apps/desktop/src/index.ts` route model unless a split is needed for
  maintainability.
- Use `apps/desktop-tauri` for native wrapper, tray, menu bar, and widget-adjacent
  native integration work where appropriate.

## Risk Areas

- watcher / polling correctness
- auth / cookie / token security
- provider overclaiming
- UI density regressions
- doc drift

## Reference Inputs

- `/Users/hanyramadan/token traker/docs/reference-products.md`
- public repos for AI Token Monitor and CodexBar

## Delivery Rule

OpenCode must report back after each child spec, not just at the very end, so
we can stop scope drift early if needed.
