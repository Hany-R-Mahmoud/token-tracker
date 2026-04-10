# Quickstart: Phase 016 Gap Audit And Closure

## Validation Commands

- `npm run build`
- `npm run typecheck`

## Acceptance Checklist

| Requirement | Status |
|---|---|
| `1h` is a truthful rolling-hour period across relevant code paths | PASS |
| Overview uses period-scoped data instead of mostly all-time data | PASS |
| Export honors the canonical period contract | PASS |
| Tray title/tooltip scope matches the value shown | PASS |
| Menubar scoped spend label matches the value shown | PASS |
| Notification-state visibility exists in-app without relying on raw API inspection | PASS |
| Phase 016 completion report no longer overclaims partial items | PASS |
| Phase 016 quickstart no longer overclaims partial items | PASS |
| Phase 016 archive contains the expected final-report artifact if execution completes | PASS |

## Manual Checks

1. Compare `1h` and `1d` with real data and verify the numbers can differ.
2. Open Overview, Analytics, export, menubar, and tray behavior and confirm the
   selected scope is coherent across them.
3. Trigger or simulate a threshold state and verify the app shows delivery mode
   or suppression reason in-product.
4. Confirm no surface labels all-time values as `Today` or other scoped copy.

## Evidence

- `/menubar?period=1d` shows "Today" with period-scoped cost
- `/export/analytics-svg?period=7d` returns 7-day scoped SVG
- Nav shows 🔔 link to notification-check API
- API `/api/notification-check` returns delivery state with reason
- `periodIdToHours('1h')` returns 1, not 24