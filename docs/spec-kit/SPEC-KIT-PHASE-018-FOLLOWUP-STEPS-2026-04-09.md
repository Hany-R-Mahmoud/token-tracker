# SPEC-KIT: Phase 018 Follow-Up Steps

**Date:** 2026-04-09  
**Audience:** OpenCode  
**Purpose:** Finish the remaining Phase 018 partial items cleanly

---

## Mission

Finish the remaining partial work from Phase 018 and rewrite the final handoff
so the completion statement matches verified behavior.

---

## Remaining Work

### 1. Overview paginated session list must become period-aware

Current state:

- Overview summary uses `getSummarySnapshotForPeriod(activePeriod)`
- Overview context-health uses `getAnalyticsSnapshotForPeriod(activePeriod)`
- Overview paginated session list still uses all-time
  `listSessionsWithCount(...)`

Required result:

- add a period-aware paginated session listing path in the read/database layer
- keep provider/model/search/page behavior intact
- ensure Overview list rows reflect the same selected period as the surrounding
  summary cards

Suggested file targets:

- `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`

### 2. Decide tray truth explicitly

Current state:

- tray still polls `/api/summary`
- tooltip still says `total`

Acceptable outcomes:

- Option A: make tray period-aware and label it with the same scope semantics as
  the rest of the product
- Option B: keep tray all-time, but document that clearly and avoid any report
  language implying full period parity across the native shell

Required result:

- whichever option is chosen, the final report must describe it truthfully

Suggested file targets:

- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-final-report.md`

### 3. Rewrite final reporting

Required result:

- final report must distinguish what was fixed from what remains partial
- closing line must match evidence exactly

If tray remains all-time or any Overview scope mismatch remains, the close must
be:

- `Phase 018 remains partial because ...`

---

## Validation Requirements

OpenCode must provide evidence for:

1. `npm run typecheck`
2. `npm run build`
3. Overview period chip changes affecting both summary and paginated session
   list
4. exact tray semantics after the follow-up
5. exact files changed

---

## Reporting Files

OpenCode should update:

- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-report-03.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-final-report.md`
