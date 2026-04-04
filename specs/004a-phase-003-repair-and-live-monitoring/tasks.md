# Tasks: Phase 003 Repair And Live Monitoring

## Phase 0: Repair First

- [x] A001 Audit actual shipped behavior against `README.md`, `PROJECT_PLAN.md`,
      `specs/003-monitoring-and-glanceable-ux/tasks.md`, `specs/004-ui-refinement/spec.md`,
      and `specs/005-ui-polish/spec.md`
- [x] A002 Fix documentation drift and task-state drift before adding features
- [x] A003 Decide and document whether 003 monitoring preferences are moved here
      or formally closed as deferred
- [x] A004 Extracted `styles.ts`, `helpers.ts`, `preferences.ts` modules from `index.ts`

## Phase 1: Live Monitoring Foundation

- [x] A005 Add file watching for supported local data sources
- [x] A006 Add refresh lifecycle and error handling for watcher-driven updates
- [x] A007 Surface last-refresh and refresh-state signals in desktop and menu bar
- [x] A008 Validate watcher behavior under change/no-change/error scenarios

## Phase 2: Reset Intelligence

- [x] A009 Add explicit countdown UX for reset timing
- [x] A010 Add session meter and weekly meter surfaces where data supports them
- [x] A011 Keep missing/partial reset data honest

## Phase 3: Preferences

- [x] A012 Add local-only refresh cadence preference (1-60s, persisted to localStorage)
- [x] A013 Add local-only default time-window preference (7/14/30/90 days, persisted to localStorage)
- [x] A014 Validate defaults and persistence (5s refresh, 30-day window; validated via `/api/preferences`)

## Phase 4: Docs And Verification

- [x] A015 Update docs after validation
- [x] A016 Run full validation and report parity movement
