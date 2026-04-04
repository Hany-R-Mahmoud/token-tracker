# Tasks: Productization And Source Parity

**Input**: Design documents from `/specs/002-productization/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Every implemented slice must be verified by `npm run typecheck`,
`npm run build`, and the relevant CLI / desktop / native smoke path.

**Organization**: Tasks are grouped into productization slices on top of the
already completed local-first MVP.

## Phase 1: Setup

- [x] T001 Review `/specs/002-productization/` and current product docs before edits
- [x] T002 Confirm current baseline with `npm run typecheck`, `npm run build`, and current CLI/desktop smoke checks

---

## Phase 2: Source Strategy And Provider Parity

- [x] T003 Investigate Cursor browser/session source strategy and document real findings
- [ ] T004 If validated, implement Cursor source strategy and adapter path without fabricating transcript detail
- [x] T005 If still not validated, improve provider-strategy reporting to distinguish "unavailable" from "strategy pending"
- [x] T006 Re-check Claude source options and document whether anything changed
- [x] T007 Verify provider parity slice with `doctor`, import/refresh, and desktop summary

**Checkpoint**: Provider-source strategy is evidence-based and documented

---

## Phase 3: Native Wrapper And Real Menu Bar

- [x] T008 Choose the native wrapper runtime and scaffold it around the current dashboard shell
- [x] T009 Launch the current dashboard from a native macOS app shell
- [x] T010 Add a real tray/menu bar entry point
- [x] T011 Connect tray action to compact summary and full dashboard
- [x] T012 Verify the native wrapper + menu bar locally

**Checkpoint**: The product is runnable as a native macOS utility

---

## Phase 4: Comparative Trust Harness

- [x] T013 Define a `ComparisonSnapshot` artifact format in code
- [x] T014 Add a local workflow to capture our readings for selected providers
- [x] T015 Add manual-input or adapter-assisted comparison support for CodexBar / AI Token Monitor snapshots
- [x] T016 Produce a first comparison artifact on this machine
- [x] T017 Verify mismatches are surfaced clearly

**Checkpoint**: Product output can be compared against reference tools with evidence

---

## Phase 5: Analytics And Export

- [x] T018 Add provider/model/time analytics read models
- [x] T019 Implement at least one richer analytics view in the product UI
- [x] T020 Add local export of normalized analytics data
- [x] T021 Verify export contents exclude raw prompt and transcript bodies

**Checkpoint**: The product is useful for deeper analysis, not just inspection

---

## Phase 6: Polish

- [x] T022 Update root docs and quickstart after productization work lands
- [x] T023 Refresh `PROJECT_PLAN.md` after the productization slice is complete
- [x] T024 Run the full `/specs/002-productization/quickstart.md` validation

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup must complete first
- Source strategy must complete before strong provider-coverage claims
- Native wrapper should complete before calling the product "daily-drivable"
- Comparison harness should complete before trust claims against reference apps
- Analytics/export should complete before cloud work is reconsidered

### Parallel Opportunities

- T003 and T006 can run in parallel
- T013 and T018 can run in parallel after native wrapper stabilization
- T022 can run in parallel with late-stage validation
