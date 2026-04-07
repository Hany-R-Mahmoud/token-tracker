# Plan: Active-Surface Truth And Notification Delivery

## Goal Summary

Build the missing runtime infrastructure behind truthful active-window-aware
context signals and desktop notification delivery.

## Constraints And Assumptions

- Phase 012 domain scaffolding already exists and should be reused where valid
- the current menubar fallback is not truthful enough to count as active-window
  behavior
- Codex and OpenCode are the primary validated targets for this phase
- browser URL truth may remain optional or partial depending on platform
- Linux/Wayland must be explicitly allowed to degrade

## Ordered Execution Plan

### Workstream A: Capability And Truth Model

1. define capability matrix types and resolution tiers
2. define user-facing copy and internal rules for each tier
3. update existing Phase 012 terminology where it implies false active truth

### Workstream B: Native Watchers

1. implement or validate native active-window watcher in the Tauri/Rust layer
2. implement or validate open-window registry snapshots
3. expose normalized watcher output to the desktop runtime
4. add degraded/unavailable capability handling

### Workstream C: Correlation And Registry

1. add provider activity correlator against local session data
2. maintain per-window registry entries and cleanup rules
3. compute active-surface resolution with truth tier and source
4. add active-surface spans/change tracking

### Workstream D: UI And Delivery

1. update menubar to distinguish active-window, fallback, and unavailable states
2. update desktop app surface to show tier/source/capability truth
3. gate notifications by truth tier, capability, and focus state
4. preserve threshold dedupe per window registry entry

### Workstream E: Verification And Docs

1. add tests for tiers, gating, and fallback labeling
2. add fixture-backed Codex/OpenCode correlation tests
3. manually validate platform/capability behavior where possible
4. reconcile docs and quickstarts

## Risks

- native watcher integration may be platform-sensitive
- browser URL truth may vary strongly by OS and permissions
- current provider-local data may not always carry enough evidence for exact
  chat correlation
- notification support can diverge between dev and installed builds

## Mitigations

- expose capability matrix and truth tier explicitly
- keep browser enrichment optional
- avoid chat-specific delivery below strong truth tiers
- prefer honest fallback copy over silent approximation

## Validation Checkpoints

- model checkpoint:
  tiers and capability states defined before UI changes
- native checkpoint:
  watcher output available or degraded states explicit
- correlation checkpoint:
  Codex/OpenCode multi-window state distinguishable
- UX checkpoint:
  menubar no longer labels fallback as active-window truth
- delivery checkpoint:
  notification gate suppresses weak/fallback targets
- docs checkpoint:
  platform caveats documented accurately

## Recommended Next Agent

`agent-pilot` should lead execution with early `agent-architect` review, then
route watcher implementation and desktop wiring to `agent-implementer`.
