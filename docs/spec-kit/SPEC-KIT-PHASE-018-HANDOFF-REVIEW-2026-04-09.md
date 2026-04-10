# SPEC-KIT: Phase 018 Handoff Review

**Date:** 2026-04-09  
**Modes Applied:** review, audit, correction framing  
**Target:** `/Users/hanyramadan/token traker/docs/handoffs/phase-018/completion-report.md`  
**Severity Classification:** Critical / Major / Minor  

---

## Executive Summary

The Phase 018 completion report is not safe to accept as complete.

Several claims in the report are contradicted by the current implementation:

- `1h` is still not a truthful rolling hour in the read layer
- Overview is still driven by all-time summary and unscoped session lists
- Menubar still pulls unscoped recent sessions
- Tray title still reflects all-time totals from `/api/summary`
- notification visibility is still an API link, not durable in-app state UI
- export route supports `period`, but the actual UI still drops the selected scope

This is not just cleanup debt. It is a truth mismatch problem: multiple product
surfaces now look scope-aware while still consuming mismatched data contracts.

---

## Finding 1: `1h` is still not a real rolling hour

**Severity:** Critical  
**Category:** Data Truth  

### Evidence

- [read-service.ts](/Users/hanyramadan/token%20traker/packages/core/src/db/read-service.ts#L49)
  still derives period behavior from `periodIdToDays()`
- [read-service.ts](/Users/hanyramadan/token%20traker/packages/core/src/db/read-service.ts#L56)
  computes session count with `days * 24`
- [read-service.ts](/Users/hanyramadan/token%20traker/packages/core/src/db/read-service.ts#L57)
  maps day windows `<= 1` to `24` hours, not `1`
- [read-service.ts](/Users/hanyramadan/token%20traker/packages/core/src/db/read-service.ts#L97)
  computes analytics hours as `days * 24`, so `1h` becomes `0`
- [database.ts](/Users/hanyramadan/token%20traker/packages/core/src/db/database.ts#L770)
  `listSessionsForWindow()` still uses day-based SQL and a day-named argument
- [database.ts](/Users/hanyramadan/token%20traker/packages/core/src/db/database.ts#L794)
  applies `date('now', ?)` rather than an hour-based window

### Why this matters

The report says the rolling-hour problem is fixed, but the live code still mixes:

- 24-hour hourly summaries
- 0-day session queries
- day-based SQL for recent-session fetches

That means `1h` is still not trustworthy.

### Required correction

Move all period-aware reads onto a single canonical period resolver that can
distinguish:

- rolling hours
- rolling days
- all time

The database layer needs explicit hour-window and day-window list methods, not a
day-based method with overloaded meaning.

---

## Finding 2: Overview is still mostly all-time

**Severity:** Critical  
**Category:** Surface Contract Parity  

### Evidence

- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2237)
  Overview still uses `readService.getSummarySnapshot()`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2239)
  Overview still uses `listSessionsWithCount(...)` without any period filter
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2262)
  context health still uses `getAnalyticsSnapshot(30)`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2290)
  only passes the selected period down to the renderer

### Why this matters

The chip state is period-aware, but the underlying Overview data is not. That is
exactly the type of scope-label mismatch Phase 018 was supposed to eliminate.

### Required correction

Overview must load period-scoped:

- summary snapshot
- recent sessions / paginated session list
- context-health analytics

and must keep provider/model/search filters working inside that scope.

---

## Finding 3: Menubar spend label improved, but recent-session content is still unscoped

**Severity:** Major  
**Category:** Surface Contract Parity  

### Evidence

- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2033)
  menubar still loads all-time `snapshot`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2034)
  it also loads `periodSnapshot`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2036)
  `sessions` uses unscoped `listRecentSessions`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L2037)
  `periodSessions` also uses the same unscoped `listRecentSessions`

### Why this matters

The hero spend label may be period-based, but the recent activity list shown in
the same menubar is still all-time. That keeps the surface internally
contradictory.

### Required correction

Recent session retrieval must accept the selected period and feed menubar
activity from the same scope as the displayed spend.

---

## Finding 4: Tray title is still all-time, not scoped

**Severity:** Major  
**Category:** Native Shell Truth  

### Evidence

- [lib.rs](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/src/lib.rs#L841)
  tooltip still says `total`
- [lib.rs](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/src/lib.rs#L860)
  tray polling still calls `/api/summary`
- [lib.rs](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/src/lib.rs#L875)
  it sums all provider costs from that all-time summary

### Why this matters

The Phase 018 report says menubar and tray now show truthful period-scoped
spend. That is not true for the tray shell.

### Required correction

Either:

- make the tray explicitly all-time and label it that way, or
- add a period-aware summary endpoint and keep tray, menubar, and dashboard on
  the same declared scope

The better path is to align native shell behavior with the period contract and
label the scope explicitly.

---

## Finding 5: Notification visibility is still weak and can fail under API-key protection

**Severity:** Major  
**Category:** Inspectability / UX  

### Evidence

- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L186)
  nav only adds a bell link to `/api/notification-check`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L1951)
  the endpoint itself can require `api_key`

### Why this matters

This is not a visible state surface. It is just a link to JSON. In protected
runtime mode, it may also return `401`, so the visibility claim is not stable.

### Required correction

Expose notification delivery mode / suppression reason directly in Overview or
Analytics as rendered UI, and only use the API as the backing data source.

---

## Finding 6: Export route supports period, but the UI still drops the selected scope

**Severity:** Major  
**Category:** Workflow Integrity  

### Evidence

- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L1979)
  export route now parses `period`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L1224)
  Overview export button links to bare `/export/analytics-svg`
- [index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L1728)
  Analytics export button does the same

### Why this matters

The backend contract was partially modernized, but the actual product path still
forgets the selected period unless the user edits the query manually.

### Required correction

Every export entry point must preserve the current selected period in the link
or form action.

---

## Assessment

**Final assessment:** reject the Phase 018 completion report as-is.

The safest next step is not to patch the report first. Fix the real code gaps,
then rewrite the completion claim with evidence.

---

## Recommended Execution Order

1. Fix canonical period resolution in the read/database layer.
2. Make Overview and Menubar consume the same period-aware data contract.
3. Decide and implement truthful tray semantics.
4. Replace the bell-link approach with rendered notification-state UI.
5. Preserve selected period in export actions.
6. Reconcile the archived report only after validation passes.
