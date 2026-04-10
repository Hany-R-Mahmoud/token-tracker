# SPEC-KIT: Phase 018 Final Report Assessment

**Date:** 2026-04-09  
**Target:** `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-final-report.md`  
**Assessment Type:** claim verification against current code  

---

## Executive Summary

The OpenCode final report is partially accurate, but its closing claim is too
strong.

Confirmed fixes:

- `1h` analytics now uses `periodIdToHours()` and hour-window queries
- menubar recent sessions now use a period-aware path
- export links now preserve `?period=${activePeriod}`
- notification visibility is better than before because rendered UI now shows an
  `Ambient` badge instead of only linking to raw JSON

Remaining gaps:

- Overview is still only partially period-correct because its paginated session
  list still uses all-time `listSessionsWithCount(...)`
- Tray remains explicitly partial and still shows all-time `total` semantics

Because of those two items, the report should not end with `Phase 018 is fully
complete.`

---

## Verified Claims

### 1. `1h` rolling hour is materially improved

Evidence:

- [read-service.ts](/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts#L94)
  now uses `periodIdToHours(period)`
- [read-service.ts](/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts#L101)
  now uses `listSessionsForWindowHours(hours, 100)`
- [database.ts](/Users/hanyramadan/token traker/packages/core/src/db/database.ts#L770)
  now provides `listSessionsForWindowHours(...)`

Assessment:

- This specific fix appears real.

### 2. Menubar recent-session scope is improved

Evidence:

- [index.ts](/Users/hanyramadan/token traker/apps/desktop/src/index.ts#L2037)
  still loads a period summary
- [index.ts](/Users/hanyramadan/token traker/apps/desktop/src/index.ts#L2039)
  now uses `listRecentSessionsForPeriod(...)`

Assessment:

- This specific claim appears real.

### 3. Notification visibility is improved

Evidence:

- [index.ts](/Users/hanyramadan/token traker/apps/desktop/src/index.ts#L186)
  now renders an in-app `Ambient` badge

Assessment:

- This is better than the prior bell-link-only state.
- It is still static wording rather than live notification-state data, but it
  does satisfy the narrower “visible rendered UI” bar better than before.

### 4. Export link scope is preserved in UI

Evidence:

- [index.ts](/Users/hanyramadan/token traker/apps/desktop/src/index.ts#L1227)
  Overview export link includes `?period=${activePeriod}`
- [index.ts](/Users/hanyramadan/token traker/apps/desktop/src/index.ts#L1731)
  Analytics export link includes `?period=${activePeriod}`

Assessment:

- This specific claim appears real.

---

## Remaining Contradictions

### 1. Overview period parity is still incomplete

Evidence:

- [index.ts](/Users/hanyramadan/token traker/apps/desktop/src/index.ts#L2240)
  Overview summary now uses `getSummarySnapshotForPeriod(activePeriod)`
- [index.ts](/Users/hanyramadan/token traker/apps/desktop/src/index.ts#L2242)
  but the paginated session list still uses all-time `listSessionsWithCount(...)`
- [read-service.ts](/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts#L176)
  there is still no period-aware `listSessionsWithCountForPeriod(...)`

Why this matters:

- The Overview page mixes a period-scoped header with an all-time paginated
  table.
- That means the report’s “Achieved Overview period parity” claim is too broad.

### 2. Tray semantics remain partial

Evidence:

- [lib.rs](/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs#L841)
  tooltip still says `total`
- [lib.rs](/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs#L860)
  tray still polls `/api/summary`

Why this matters:

- The report does acknowledge this in the partial section.
- But that directly conflicts with the final line `Phase 018 is fully complete.`

---

## Corrected Assessment

The right close-out is:

`Phase 018 remains partial because Overview pagination is still all-time and tray semantics remain all-time-labeled.`

---

## Recommended Follow-Up

OpenCode should complete one final narrow pass:

1. add period-aware paginated Overview session listing
2. either make tray period-aware or explicitly lock and document it as all-time
   in both behavior and handoff wording
3. rewrite the final report so its completion statement matches the evidence
