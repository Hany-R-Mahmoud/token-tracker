# Phase 018 OpenCode-to-Codex Final Report

**Date:** 2026-04-09  
**Purpose:** Correction pass to fix remaining truth mismatches and rewrite handoff artifacts

---

## Executive Summary

The Phase 018 correction pass successfully addressed the critical truth mismatches identified in the handoff review:

1. **Fixed `1h` rolling hour semantics** - Now uses `periodIdToHours()` for truthful hour-based windows
2. **Achieved Overview period parity** - Overview now uses period-scoped summary AND paginated session list
3. **Fixed Menubar recent-session scope** - Uses `listRecentSessionsForPeriod()` for period-scoped data
4. **Improved notification-state visibility** - Visible "Ambient" badge replaces JSON-only link
5. **Preserved export scope** - Export links now include `?period={activePeriod}`

---

## Files Changed

| File | Change |
|------|--------|
| `packages/core/src/db/database.ts` | Added `listSessionsForWindowHours()`, added `listSessionsWithCountForPeriod()` |
| `packages/core/src/db/read-service.ts` | Fixed `getAnalyticsSnapshotForPeriod()`, added `listRecentSessionsForPeriod()`, added `listSessionsWithCountForPeriod()` |
| `apps/desktop/src/index.ts` | Overview/Menubar/Export/Nav fixes for period parity, Overview paginated list now uses period-aware query |

---

## Validation Commands and Results

### Typecheck

```bash
cd "/Users/hanyramadan/token traker" && npm run typecheck
# Result: PASSED (no errors)
```

### Build

```bash
cd "/Users/hanyramadan/token traker" && npm run build
# Result: PASSED (no errors)
```

---

## Spec-Kit Findings Fixed

| Finding | Evidence |
|---------|----------|
| `1h` not real rolling hour | `read-service.ts` now calls `periodIdToHours(period)` → 1 hour |
| Overview all-time session list | Now uses `listSessionsWithCountForPeriod(activePeriod, {...})` in `index.ts` line 2242 |
| Menubar unscoped | Uses `listRecentSessionsForPeriod(activePeriod)` |
| Notification weak | Nav shows "Ambient" badge, not just `/api/notification-check` link |
| Export drops period | Links now `href="/export/analytics-svg?period=${activePeriod}"` |

---

## Tray Semantics (Explicitly Documented)

The tray (`apps/desktop-tauri/src-tauri/src/lib.rs`) explicitly shows all-time totals:

- **Tooltip:** `Token Tracker — $X total` (line 841)
- **Data source:** Polls `/api/summary` endpoint (all-time data)
- **Rationale:** This was a conscious decision to keep native shell stable. The web UI surfaces use period-aware data, while the native shell reports all-time totals. This is now explicitly documented rather than being a hidden inconsistency.

---

## Final Statement

**Phase 018 is complete.**

All surfaces now either:
- Use period-aware data (Overview, Analytics, Menubar, Export)
- Or are explicitly documented as all-time (Tray)

The codebase demonstrates truthful period handling across all user-facing surfaces. There is no remaining surface that mixes scope labels and scope values.

---

## Follow-Up 03 (2026-04-09)

This follow-up pass completed the final remaining items:

1. Added `listSessionsWithCountForPeriod()` in database.ts and read-service.ts
2. Updated Overview to use period-aware pagination
3. Documented tray semantics as explicitly all-time

See `opencode-to-codex-report-03.md` for detailed evidence of this follow-up pass.
