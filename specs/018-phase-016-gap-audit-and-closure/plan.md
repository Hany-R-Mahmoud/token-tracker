# Plan: Phase 016 Gap Audit And Closure

## Phase Path

1. audit report claims against current code
2. fix period/data truth first
3. fix tray and menubar scope truth next
4. add visible notification-state UI
5. reconcile archive and quickstart status with evidence

## Workstreams

### Workstream A: Period Truth

- fix `1h` semantics in shared data access
- bring overview onto period-scoped summary and list logic
- update export to canonical period handling

### Workstream B: Operator Spend Truth

- align tray title with scoped spend
- align menubar labeled spend with actual scoped spend data
- preserve clearly labeled all-time totals where useful

### Workstream C: Notification Visibility

- add an in-app surface for latest notification outcome or suppression reason
- keep it truthful about ambient, banner, and desktop delivery modes

### Workstream D: Archive Reconciliation

- update Phase 016 completion report
- update Phase 016 quickstart acceptance rows
- add the missing final-report artifact if the pass completes

## Risks

- true period parity can ripple through several read-service assumptions
- `1h` support may expose awkward chart-empty cases
- tray title changes need concise copy to avoid clutter

## Mitigations

- fix shared query semantics before surface copy
- keep in-app notification state compact and evidence-driven
- downgrade archive claims where implementation is intentionally deferred

## Completion Gates

- implementation gate: period parity, scoped spend truth, and visible
  notification state are actually wired
- review gate: no misleading labels remain
- verification gate: commands and targeted behavior checks pass
- docs gate: Phase 016 archive and quickstart reflect real final status
