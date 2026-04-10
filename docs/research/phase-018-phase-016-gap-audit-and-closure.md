# Phase 018 Research: Phase 016 Gap Audit And Closure

Last updated: 2026-04-09

## Purpose

Audit the Phase 016 completion report against the current repo so the next pass
fixes the incomplete parts instead of assuming the phase is fully done.

## Files Reviewed

- `/Users/hanyramadan/token traker/docs/handoffs/phase-016/completion-report.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/spec.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/quickstart.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/packages/core/src/db/desktop-period.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`

## Confirmed Gap Findings

### 1. Export parity was marked `PASS`, but the implementation still uses old days-based behavior

Evidence:

- `docs/handoffs/phase-016/completion-report.md`
  - marks canonical period contract across overview, analytics, and export as
    complete
  - later note says: `Export still uses days-based params but could be updated`
- `apps/desktop/src/index.ts`
  - `/export/analytics-svg` still reads only `days`
  - allowed values remain `[7, 14, 30, 90]`
  - export does not support `period=1h|1d|7d|1m|all`

Implication:

- export does not honor the same period contract as the on-screen analytics
  surface
- this is a real implementation gap, not just a future nice-to-have

### 2. Tray title semantics were reported as scoped spend, but the tray still polls all-time summary data

Evidence:

- `docs/handoffs/phase-016/completion-report.md`
  - says tray/menubar shows scoped spend with explicit label
- `apps/desktop-tauri/src-tauri/src/lib.rs`
  - `poll_spend_and_update_tray()` still calls `/api/summary`
  - it sums `providerSummaries[].totalCostUsd`
  - tooltip still says `Token Tracker — {} total`
- `apps/desktop/src/index.ts`
  - `/api/summary` still returns all-time `getSummarySnapshot()`

Implication:

- tray title remains an all-time total
- Phase 016 improved the menubar label, but not the native tray title behavior

### 3. Menubar "Today spend" label is currently fed with all-time spend

Evidence:

- `apps/desktop/src/index.ts`
  - menubar response calls:
    `{ period: 'Today', cost: snapshot.providerSummaries.reduce(...) }`
- `snapshot` is produced by `readService.getSummarySnapshot()`
- `getSummarySnapshot()` is all-time

Implication:

- the label changed, but the underlying value did not
- this is more dangerous than a missing feature because it presents wrong scope

### 4. Overview period controls are wired visually, but Overview data is still mostly all-time

Evidence:

- `apps/desktop/src/index.ts`
  - overview request handler still loads `readService.getSummarySnapshot()`
  - session list still uses `listSessionsWithCount(...)` without period scoping
  - overview context-health helper still loads `getAnalyticsSnapshot(30)`
  - only the chip state and some labels use `period`

Implication:

- analytics period support advanced further than overview period support
- the report overstates overview parity

### 5. `1h` handling is internally inconsistent in the read layer

Evidence:

- `packages/core/src/db/desktop-period.ts`
  - `periodIdToDays('1h')` returns `0`
- `packages/core/src/db/read-service.ts`
  - `getAnalyticsSnapshotForPeriod('1h')` calls `listSessionsForWindow(hours, 100)`
    where `hours = days * 24 = 0`
- `packages/core/src/db/database.ts`
  - `listSessionsForWindow(days, limit)` still uses day-based SQL:
    `WHERE started_at >= date('now', ?)`
  - passing `0` yields `-0 days`, not a true 1-hour window
- the summary/provider/model helpers special-case hourly windows with `24`
  hours instead of `1`

Implication:

- the `1h` period is not implemented truthfully
- current behavior likely maps to same-day or 24-hour data depending on the
  code path, not a rolling single hour

### 6. Notification state is inspectable via API, but not visibly surfaced in-app

Evidence:

- `docs/handoffs/phase-016/completion-report.md`
  - says notification delivery state is inspectable
- `apps/desktop/src/index.ts`
  - `/api/notification-check` returns payload data
  - no Overview or Analytics section renders latest delivery mode or reason
- `apps/desktop-tauri/src-tauri/src/lib.rs`
  - logs gate-closed desktop-notification cases but does not show an in-app
    surface

Implication:

- the API part exists
- the "visible in-app even when native OS notification is not shown" acceptance
  claim is still not satisfied

### 7. Chart accessibility / explanation claims are overstated

Evidence:

- `apps/desktop/src/index.ts`
  - `buildStepChartSvg()` and `buildTrendMesh()` still use `aria-hidden="true"`
  - matrix points and heatmap cells still rely on `title=""`
  - there is no explicit notification-state panel or visible takeaways for
    several key charts

Implication:

- the product is better labeled than before, but not yet at the spec’s
  non-hover-only bar for several visuals

### 8. Handoff archive closure is incomplete

Evidence:

- `docs/handoffs/phase-016/` contains:
  - `codex-to-opencode-prompt-01.md`
  - `completion-report.md`
- expected final report artifact is missing

Implication:

- the archive is incomplete relative to the repo’s own handoff convention

## Recommended Follow-Up Scope

This follow-up should close the real incomplete parts of Phase 016:

1. true period parity across overview, analytics, export, menubar, and tray
2. truthful `1h` semantics
3. actual visible notification-state UI
4. honest archive/report reconciliation for what remains partial

This is not a full redesign phase. It is a targeted closure and truth pass.
