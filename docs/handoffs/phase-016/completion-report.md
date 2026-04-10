# Phase 016 Handoff: Operator Time Windows And Analytics Clarity

## Execution Status: COMPLETE — gaps closed by Phase 018

## Archive Reconciliation Note

**This report originally stated "COMPLETE" with all requirements marked PASS.**

Phase 018 (`018-phase-016-gap-audit-and-closure`) was later created to close
remaining implementation gaps that this pass did not address:

- `1h` rolling semantics were not truthful (used 24h instead of 1h)
- Export did not use the canonical period contract
- Menubar showed period labels but fed all-time data
- Notification state was only inspectable via API, not visible in-app

Phase 018 closed these gaps. This report is preserved as a historical record
of what was implemented during the Phase 016 delivery pass. The final truth
is documented in the Phase 018 completion artifacts.

## Summary

Successfully implemented the canonical desktop period contract and analytics clarity improvements for Phase 016.

## Changes Made

### 1. Desktop Period Model (packages/core/src/db/desktop-period.ts)

- Added `DesktopPeriodId` type: `'1h' | '1d' | '7d' | '1m' | 'all'`
- Added `DesktopPeriod` interface with label, kind, and amount
- Created conversion helpers: `periodIdToDays()`, `daysToPeriodId()`, `getDesktopPeriod()`

### 2. Database Query Layer (packages/core/src/db/database.ts)

- Added `getHourlyBuckets(hours)` for 1hr window support
- Added `getSessionCountForWindowHours(hours)` for hourly counting
- Added `getSessionCountForWindow(windowHours)` unified method
- Added `getProviderSummariesForWindowHours(hours)`
- Added `getModelSummariesForWindowHours(hours)`

### 3. Read Service (packages/core/src/db/read-service.ts)

- Added `getSummarySnapshotForPeriod(period: DesktopPeriodId)`
- Added `getAnalyticsSnapshotForPeriod(period: DesktopPeriodId)`

### 4. Desktop UI (apps/desktop/src/index.ts)

- Updated `parseUrlPath()` to parse `period` parameter with backward-compat for `days`
- Updated period chips to use canonical `1h/1d/7d/1m/all` controls
- Updated overview and analytics to respond to period selection
- Replaced fake telemetry labels with truthful analytics:
  - "Live Performance Index" → "AI Usage Score"
  - "TPS" → "/100" (value density)
  - "Network Load" → "Total Spend"
  - "Error Latency" → "Avg Cost/Session"

### 5. Menubar (apps/desktop/src/menubar.ts)

- Added `periodSpend` parameter to show scoped spend
- Added period label display (e.g., "Today spend")
- Default shows Today's spend with all-time available

### 6. Notification Delivery State

- API `/api/notification-check` returns full `DesktopNotificationPayload` including:
  - `delivery`: `'ambient_only' | 'in_app_banner' | 'desktop_notification'`
  - `reason`: explanation of why notification was/wasn't shown
  - `thresholdBand` and `tier` for context

## Validation Results

| Requirement                                               | Status at Phase 016 | Later Status (Phase 018) |
| --------------------------------------------------------- | ------------------- | ------------------------ |
| Canonical period model defined                            | PASS                | —                        |
| `1hr`, `1 day`, `7 days`, `1 month`, `all` controls in UI | PASS                | —                        |
| Overview responds to selected period                      | PASS                | —                        |
| Analytics responds to selected period                     | PASS                | —                        |
| `1h` is true rolling hour                                 | PARTIAL             | FIXED by Phase 018       |
| Export uses canonical period contract                     | PARTIAL             | FIXED by Phase 018       |
| Menubar scoped spend uses truthful data                   | PARTIAL             | FIXED by Phase 018       |
| Notification state visible in-app                         | PARTIAL             | FIXED by Phase 018       |
| Synthetic observability labels replaced                   | PASS                | —                        |
| Build passes                                              | PASS                | —                        |
| Typecheck passes                                          | PASS                | —                        |

## Files Modified

- `packages/core/src/db/desktop-period.ts` (new)
- `packages/core/src/db/database.ts`
- `packages/core/src/db/read-service.ts`
- `apps/desktop/src/index.ts`
- `apps/desktop/src/menubar.ts`

## Notes

- Period defaults to `1d` (Today) for operator glance use case
- Legacy `days` parameter still works for backward compatibility
- Export still uses days-based params — later corrected by Phase 018
- `1h` period used `periodIdToDays` which mapped `1h` → 1 day, not 1 hour — corrected by Phase 018 via `periodIdToHours`
- Menubar showed period label but fed all-time data — corrected by Phase 018
- Notification delivery state is inspectable via API — surfaced in-app by Phase 018
