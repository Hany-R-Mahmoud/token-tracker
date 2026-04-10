# Plan: Operator Time Windows And Analytics Clarity

## Phase Path

1. define the canonical desktop period model first
2. move query and export behavior onto the same period contract
3. update tray and menubar spend scope with explicit labeling
4. add visible context-warning state beyond native notification delivery
5. replace synthetic metric framing with truthful analytical language
6. improve overview and analytics explanations, comparisons, and interaction
   clarity
7. verify behavior, archive handoff artifacts, and report acceptance status with
   evidence

## Workstreams

### Workstream A: Shared Period Contract

- choose the canonical period ids and URL representation
- support `1h`, `1d`, `7d`, `1m`, and `all`
- avoid overview/analytics divergence
- ensure export follows the same contract

### Workstream B: Menubar And Tray Scope

- decide default operator-glance period
- change primary tray title to scoped spend
- preserve all-time visibility as secondary context
- label scope directly in menubar hero and tooltip copy

### Workstream C: Notification Discoverability

- expose latest threshold state
- expose latest delivery mode or suppression reason
- make ambient/in-app downgrade paths visible

### Workstream D: Surface Clarity

- remove fake telemetry labels
- make charts answer one clear question each
- add visible legends, explanatory copy, and focus/hover details
- strengthen efficiency-versus-consumption comparison

### Workstream E: Closure

- validate UI behavior and query behavior
- verify accessibility on interactive chart details and controls
- archive prompt/report artifacts in the phase handoff folder

## Risks

- period support may require wider query/API changes than the UI currently
  suggests
- hourly windows and all-time windows may expose edge cases in SQLite query
  semantics or empty-state copy
- changing tray semantics can confuse existing users if scope labeling is weak
- chart clarification work can become an uncontrolled redesign if not kept tied
  to concrete user questions

## Mitigations

- define the period model before touching surface code
- update empty, loading, and export states in the same pass
- keep all-time totals available as a labeled secondary value
- require each chart block to state its question and takeaway

## Completion Gates

- implementation gate: period contract, tray/menubar scope, notification state,
  and clarified overview/analytics surfaces are wired
- review gate: no misleading labels, no fake metrics, no broken route semantics
- verification gate: commands pass and period behavior is manually demonstrated
- accessibility gate: keyboard/focus and non-hover meaning remain available
- docs gate: spec, quickstart, and handoff archive reflect the implementation
