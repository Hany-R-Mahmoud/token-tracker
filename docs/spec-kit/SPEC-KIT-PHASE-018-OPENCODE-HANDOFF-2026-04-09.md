# SPEC-KIT: Phase 018 OpenCode Handoff

**Date:** 2026-04-09  
**Audience:** OpenCode  
**Purpose:** Fix the remaining Phase 018 truth gaps and return a verifiable handoff  

---

## Current Assessment

Do not treat Phase 018 as complete.

The archived handoff still overclaims these areas:

- `1h` is not a trustworthy rolling-hour implementation yet
- Overview is still mostly all-time
- Menubar recent sessions are still unscoped
- Tray title/tooltip still reflect all-time `/api/summary` data
- notification visibility is still a JSON link, not rendered in-product state
- export UI still drops the selected period even though the route parses it

There is also a working-tree risk to account for:

- `packages/core/src/db/read-service.ts` now references `periodIdToHours(...)`
  without importing it, so the correction pass must verify the read layer is
  internally coherent before claiming success

---

## Mission

Close the remaining implementation gaps from Phase 018 and rewrite the handoff
report so it matches validated repo truth.

---

## Required Fixes

### 1. Canonical period handling

Implement one period contract that cleanly supports:

- `1h`
- `1d`
- `7d`
- `1m`
- `all`

Rules:

- `1h` must use a true rolling one-hour window
- hour-based and day-based queries must not share ambiguous helper semantics
- recent-session retrieval must support the same scope contract as summary and
  analytics

### 2. Overview parity

Make Overview period-correct for:

- summary metrics
- provider summaries
- session list / paginated results
- context-health / active-surface computations where they are intended to match
  the selected window

### 3. Menubar and tray truth

Make the native shell truthful.

Rules:

- menubar recent sessions must match the displayed spend scope
- tray behavior must either:
  - use the same selected period contract, or
  - be explicitly all-time and labeled as such

Do not leave tray text implying scoped truth while reading all-time data.

### 4. Notification-state UI

Replace the bell-link-only approach with real rendered UI.

Rules:

- show notification mode and/or suppression reason directly in Overview or
  Analytics
- the UI must remain inspectable even when `TTM_DESKTOP_API_KEY` is enabled
- the backing API may remain, but JSON must not be the primary UX

### 5. Export scope preservation

Make export preserve the selected period from both Overview and Analytics.

### 6. Report reconciliation

Update the Phase 018 completion report only after validation passes.

The final report must distinguish:

- what was previously claimed
- what this pass actually fixed
- what remains partial, if anything

---

## Primary Evidence Files

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-PHASE-018-HANDOFF-REVIEW-2026-04-09.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-PHASE-018-GAP-CLOSURE-2026-04-09.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/completion-report.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/spec.md`
- `/Users/hanyramadan/token traker/docs/research/phase-018-phase-016-gap-audit-and-closure.md`

---

## File Targets

- `/Users/hanyramadan/token traker/packages/core/src/db/desktop-period.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/completion-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-report-02.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-final-report.md`

---

## Validation Requirements

Do not mark the phase complete unless you can provide evidence for all of these:

1. typecheck passes
2. relevant build commands pass
3. `1h` and `1d` demonstrably differ on period-aware queries where data allows
4. Overview, Analytics, Menubar, Export, and Tray agree on scope semantics
5. notification-state UI is visible in rendered HTML, not only JSON
6. final report cites exact commands and exact results

---

## Reporting Contract

Return:

1. files changed
2. exact validation commands and results
3. which spec-kit findings were fixed
4. what remains partial, if anything
5. a final line using exactly one of:
   - `Phase 018 is fully complete.`
   - `Phase 018 remains partial because ...`
