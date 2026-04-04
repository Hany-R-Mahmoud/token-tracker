# Tasks: Monitoring And Glanceable UX

**Input**: Design documents from `/specs/003-monitoring-and-glanceable-ux/`  
**Prerequisites**: plan.md, spec.md, quickstart.md

**Tests**: Every implemented slice must be verified by `npm run typecheck`,
`npm run build`, and the relevant desktop / menu bar / analytics smoke path.

**Organization**: Tasks are grouped into execution slices that OpenCode must
run in order. OpenCode must not skip planning, UX direction, validation, or
review stages.

## Phase 1: Setup And Architecture Lock

- [x] T001 Review `/specs/003-monitoring-and-glanceable-ux/`, current
      `/Users/hanyramadan/token traker/PROJECT_PLAN.md`, and touched app files
      before edits
- [x] T002 Run `agent-orchestrator` first and produce a concrete slice plan with
      touched files, validations, and execution order
- [x] T003 Run `agent-impeccable` second and define the UI/UX direction for:
      compact monitoring, reset clarity, analytics visuals, and filter polish
- [x] T004 Confirm current baseline with `npm run typecheck`, `npm run build`,
      and current route smoke checks before making changes

**Checkpoint**: Scope is locked, UX direction is explicit, and baseline passes

---

## Phase 2: Menu Bar Monitoring Upgrade

- [x] T005 Improve `/menubar` hierarchy so it reads as a monitoring surface,
      not just a compact summary dump
- [x] T006 Add clearer top-level provider state and compact breakdown cards or
      equivalent visual groupings
- [x] T007 Preserve or improve the "Open Dashboard" path without regressing tray
      behavior in the Tauri wrapper
- [x] T008 Verify `/menubar` in browser and native wrapper contexts

**Checkpoint**: Menu bar view is materially more glanceable and still stable

---

## Phase 3: Reset Window Clarity

- [x] T009 Improve reset-window presentation on overview and menu bar surfaces
- [x] T010 Add human-readable reset wording and confidence-aware fallback states
- [x] T011 Verify providers without reset metadata remain honest and readable

**Checkpoint**: Reset metadata is clearly communicated where available

---

## Phase 4: Analytics Visual Layer

- [x] T012 Add at least one trend-oriented visual summary to `/analytics`
- [x] T013 Add at least one distribution-oriented visual summary to `/analytics`
- [x] T014 Preserve supporting tables where they still improve interpretability
- [x] T015 Verify analytics visuals with both sparse and non-trivial local data

**Checkpoint**: Analytics are faster to read than plain tables alone

---

## Phase 5: Filter Interaction Polish

- [x] T016 Refine overview filter state visibility for provider, model, search,
      and pagination
- [x] T017 Improve zero-result and active-filter reset affordances
- [x] T018 Verify page clamping remains correct under combined filter changes

**Checkpoint**: Filter interactions feel predictable and self-explanatory

---

## Phase 6: Monitoring Preferences

- [ ] T019 Add a minimal local-only monitoring preference mechanism if needed
- [ ] T020 Limit preferences to narrow operational controls such as refresh
      cadence or default window
- [ ] T021 Verify defaults remain sensible when preferences are absent

**Checkpoint**: Monitoring behavior is configurable without product sprawl

---

## Phase 7: Documentation, Validation, And Review

- [x] T022 Update `/Users/hanyramadan/token traker/README.md` only for shipped
      behavior from this phase
- [x] T023 Refresh `/Users/hanyramadan/token traker/PROJECT_PLAN.md` after the
      phase is validated
- [x] T024 Run the full `/specs/003-monitoring-and-glanceable-ux/quickstart.md`
      validation
- [x] T025 Run `agent-reviewer` on the final diff and fix any legitimate issues
      before handoff

**Checkpoint**: The phase is validated, documented, and reviewed honestly

## Mandatory Validation Gates

- Gate A: Do not start implementation until T001-T004 are complete
- Gate B: Do not start analytics visuals until menu bar and reset work are
  verified
- Gate C: Do not update docs until implementation and quickstart validation pass
- Gate D: Do not declare acceptance without `agent-tester` and `agent-reviewer`

## Dependencies & Execution Order

### Phase Dependencies

- Setup must complete first
- Menu bar monitoring should land before analytics polish
- Reset clarity should land before any "monitoring complete" claim
- Filter polish should follow the new hierarchy, not precede it
- Docs must be last

### Parallel Opportunities

- T009-T010 can overlap with the late part of menu bar implementation once the
  compact hierarchy is locked
- T012-T014 can overlap internally after the required read-model shape is ready
- T022 can start only after T024 is effectively passing
