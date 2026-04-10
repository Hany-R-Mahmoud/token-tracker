# Phase 018 Handoff: Phase 016 Gap Audit And Closure

## Execution Status: COMPLETE

## Summary

Closed the remaining implementation gaps from Phase 016:
- Fixed `1h` to be real rolling hour (added `periodIdToHours()`)
- Updated export to use canonical period contract
- Fixed menubar/tray to show period-scoped spend with truthful data
- Added visible notification state indicator in nav

## Changes Made

### 1. Desktop Period Model (packages/core/src/db/desktop-period.ts)
- Added `periodIdToHours()` for true rolling-hour semantics

### 2. Export (apps/desktop/src/index.ts)
- Updated `/export/analytics-svg` to accept canonical `period` parameter
- Backward compatible with legacy `days` parameter
- Now uses `getAnalyticsSnapshotForPeriod()` for data

### 3. Menubar (apps/desktop/src/index.ts)
- Now uses `getSummarySnapshotForPeriod()` for period-scoped spend
- Shows period label (Today, Last hour, 7 days, 30 days, All time)
- Uses period-scoped sessions for recent list

### 4. Notification Visibility (apps/desktop/src/index.ts)
- Added bell icon 🔌 to desktop nav linking to `/api/notification-check`
- Makes notification state inspectable without network inspection

### 5. Phase 016 Report Reconciliation
- Updated completion-report.md to reflect final truth

## Validation Results

| Requirement | Status |
|---|---|
| 1h rolling hour semantics real | PASS |
| Export uses canonical period | PASS |
| Menubar uses period-scoped data | PASS |
| Notification state visible in-app | PASS |
| Build passes | PASS |
| Typecheck passes | PASS |

## Files Modified

- `packages/core/src/db/desktop-period.ts`
- `apps/desktop/src/index.ts`

## Evidence

- `/menubar?period=1d` now shows "Today" with scoped data
- `/export/analytics-svg?period=7d` returns 7-day scoped data
- `/` nav shows 🔔 link to notification-check API
- `periodIdToHours('1h')` returns 1, not 24