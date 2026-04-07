# Plan: Window-Scoped Context Notifications

## Goal Summary

Phase 012 adds a live, window-aware context signal to Token Tracker and wires it
to threshold-based notifications for the currently active provider window.

## Constraints And Assumptions

- current repo already has context-usage derivation but not active-window
  identity
- desktop shell is Tauri-based, so the cleanest long-term active-window path is
  Rust/Tauri-backed rather than Electron-only patterns
- Codex and OpenCode are the only providers that must be fully implemented in
  this phase
- Claude and Cursor should get matcher contracts, not speculative full support
- threshold alerts must be sparse and deduped

## Ordered Execution Plan

### Workstream A: Architecture And Contracts

1. define `ExternalWindowSnapshot`, `ActiveContextMatch`,
   `WindowContextSignal`, and `NotificationCheckpoint`
2. define provider matcher contract and active-window resolver boundary
3. define threshold-crossing, cooldown, and dedupe policy
4. define unresolved/low-confidence fallback behavior

### Workstream B: Active Window Resolution

1. choose the concrete active-window implementation path for Tauri, preferring a
   Rust-native library such as `x-win` if it validates cleanly
2. add a desktop-native resolver service that polls or subscribes to active
   window changes
3. normalize external window metadata into a repo-local model
4. debounce noisy focus/window churn before it reaches product logic

### Workstream C: Provider Matchers

1. implement Codex matcher using provider app/process/title evidence
2. implement OpenCode matcher using provider app/process/title evidence
3. add matcher confidence scoring and reason strings
4. stub Claude and Cursor matcher interface points without pretending support is
   complete

### Workstream D: Signal And Notification Policy

1. derive threshold band from `contextUsagePercent`
2. persist per-window notification checkpoint state
3. fire notifications only on upward threshold crossings
4. reset eligibility only when usage drops below the relevant threshold

### Workstream E: Menubar / Desktop Surface Wiring

1. surface the active-window context signal in tray/menubar
2. add richer active-window status to the desktop popover/app surface
3. add unresolved and low-confidence fallback states
4. ensure switching external windows updates the rendered signal

### Workstream F: Verification And Docs

1. add unit coverage for threshold logic, dedupe, and fallback behavior
2. add fixture coverage for provider matchers
3. manually validate multi-window switching behavior
4. reconcile docs and handoff artifacts

## Risks

- active-window metadata may vary across platforms
- multiple windows from the same provider may be hard to distinguish on weak
  title evidence
- OS notifications can become noisy if threshold dedupe is wrong
- focus event handling can be unreliable if wired directly without normalization

## Mitigations

- isolate platform-specific detection behind one resolver
- use confidence scoring instead of binary certainty
- add threshold checkpoint persistence and cooldowns
- require fixture-backed and manual multi-window verification before closure

## Validation Checkpoints

- architecture checkpoint:
  contracts and service boundaries approved before heavy implementation
- implementation checkpoint:
  active-window resolver + Codex/OpenCode matchers producing stable snapshots
- UX checkpoint:
  tray/menubar and desktop surfaces follow active-window switching
- notification checkpoint:
  alerts fire only on threshold crossings
- honesty checkpoint:
  unresolved cases do not claim false session precision
- docs checkpoint:
  phase docs and prompt reflect actual shipped limits

## Recommended Next Agent

`agent-pilot` should lead execution, with early `agent-architect` involvement
before `agent-implementer` starts the active-window and notification slices.
