# Tasks: Local-First MVP Completion

**Input**: Design documents from `/specs/001-local-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Verification is required for every implemented slice through
`npm run typecheck`, `npm run build`, and the relevant CLI or desktop smoke
path.

**Organization**: Tasks are grouped by user story and assume the current repo
baseline already contains shared core, SQLite persistence, Codex import,
OpenCode import, and a usable CLI.

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Review [PROJECT_PLAN.md](/Users/hanyramadan/token%20traker/PROJECT_PLAN.md) and `/specs/001-local-mvp/` artifacts before making changes
- [ ] T002 Confirm current baseline with `npm run typecheck`, `npm run build`, and `node packages/cli/dist/index.js doctor`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 Create a reusable CLI query/service layer in `/Users/hanyramadan/token traker/packages/core/src/db/` so CLI and desktop can share summary and session list reads
- [ ] T004 [P] Add provider-health query helpers in `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`
- [ ] T005 [P] Add stable output format helpers for CLI rows in `/Users/hanyramadan/token traker/packages/cli/src/`

**Checkpoint**: Shared read models are ready for both CLI and desktop work

---

## Phase 3: User Story 1 - Trustworthy Local Analytics CLI (Priority: P1) 🎯 MVP

**Goal**: Make the CLI a reliable inspection and trust surface for imported local data

**Independent Test**: Run `ttm import`, `ttm summary`, `ttm sessions`, and
`ttm analyze <session-id>` and confirm output is bounded, explainable, and
consistent with the local database.

- [ ] T006 [US1] Improve title derivation and transcript filtering in `/Users/hanyramadan/token traker/packages/core/src/utils/text.ts`
- [ ] T007 [US1] Add richer cost and pricing reporting in `/Users/hanyramadan/token traker/packages/core/src/pricing/static-pricing.ts` and `/Users/hanyramadan/token traker/packages/core/src/adapters/codex.ts`
- [ ] T008 [US1] Add provider health reporting to `ttm doctor` in `/Users/hanyramadan/token traker/packages/cli/src/index.ts`
- [ ] T009 [US1] Add filtered session listing support in `/Users/hanyramadan/token traker/packages/core/src/db/database.ts` and `/Users/hanyramadan/token traker/packages/cli/src/index.ts`
- [ ] T010 [US1] Add explicit unknown-pricing messaging in `/Users/hanyramadan/token traker/packages/cli/src/index.ts`
- [ ] T011 [US1] Verify User Story 1 with `npm run typecheck`, `npm run build`, `node packages/cli/dist/index.js import`, `summary`, `sessions`, and `analyze`

**Checkpoint**: CLI is a trustworthy local analytics surface

---

## Phase 4: User Story 2 - Expand Provider Coverage Safely (Priority: P2)

**Goal**: Validate the next provider path without lying about unsupported sources

**Independent Test**: Validate the provider source, import if supported, and
confirm shared-store output appears in CLI summaries; otherwise confirm clear
unavailable status.

- [ ] T012 [US2] Investigate actual Cursor local source shape and document results in `/Users/hanyramadan/token traker/specs/001-local-mvp/research.md`
- [ ] T013 [US2] If Cursor is validated, implement the adapter in `/Users/hanyramadan/token traker/packages/core/src/adapters/`
- [ ] T014 [US2] If Cursor is not validated, add explicit unavailable messaging in `/Users/hanyramadan/token traker/packages/cli/src/index.ts`
- [ ] T015 [US2] Add Claude health reporting that marks the provider unavailable until a real source is validated in `/Users/hanyramadan/token traker/packages/cli/src/index.ts`
- [ ] T016 [US2] Verify User Story 2 with `ttm doctor`, `ttm import`, and `ttm summary`

**Checkpoint**: Provider expansion is safe and honest

---

## Phase 5: User Story 3 - Desktop Dashboard From Local Data (Priority: P3)

**Goal**: Build the first desktop shell on top of the shared local store

**Independent Test**: Launch the desktop app and confirm it renders local
summary totals, provider summaries, and recent sessions from the same SQLite DB
used by the CLI.

- [ ] T017 [US3] Choose and scaffold the desktop runtime inside `/Users/hanyramadan/token traker/apps/desktop/`
- [ ] T018 [US3] Implement a local data access bridge from desktop to shared DB reads
- [ ] T019 [US3] Build an overview screen showing total sessions and provider summaries
- [ ] T020 [P] [US3] Build a recent sessions list view
- [ ] T021 [P] [US3] Build a session detail panel with explanation factors
- [ ] T022 [US3] Add empty-state and missing-database handling for desktop startup
- [ ] T023 [US3] Verify User Story 3 by launching the desktop shell against a populated `.ttm/ttm.sqlite`

**Checkpoint**: Desktop shell proves the shared core can power a real product surface

---

## Phase 6: User Story 4 - Menu Bar Quick Glance (Priority: P4)

**Goal**: Add a first read-only menu bar entry point into the local product

**Independent Test**: Start the menu bar surface, confirm it reads local
summary data, and open the desktop shell from it.

- [ ] T024 [US4] Define the menu bar integration path in `/Users/hanyramadan/token traker/apps/desktop/` or a dedicated app package
- [ ] T025 [US4] Implement a compact summary view for menu bar usage
- [ ] T026 [US4] Add an action to open the desktop dashboard from the menu bar
- [ ] T027 [US4] Add safe no-data behavior for menu bar startup
- [ ] T028 [US4] Verify User Story 4 through a local menu bar smoke test

**Checkpoint**: Menu bar surface is useful and read-only

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T029 [P] Update root documentation in `/Users/hanyramadan/token traker/README.md`
- [ ] T030 Refresh [PROJECT_PLAN.md](/Users/hanyramadan/token%20traker/PROJECT_PLAN.md) after the feature scope changes are complete
- [ ] T031 Run the full quickstart validation from `/Users/hanyramadan/token traker/specs/001-local-mvp/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup must complete first
- Foundational tasks block all user stories
- User Story 1 should complete before any desktop work
- User Story 2 should complete before we claim broader provider coverage
- User Story 3 should complete before User Story 4

### User Story Dependencies

- **US1**: depends only on the current baseline and foundational read helpers
- **US2**: depends on US1 CLI trust layer
- **US3**: depends on US1 shared DB reads
- **US4**: depends on US3 desktop shell

### Parallel Opportunities

- T004 and T005 can run in parallel
- T020 and T021 can run in parallel after the desktop shell baseline exists
- T029 can run in parallel with late-stage polish
