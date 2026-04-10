# SPEC-KIT: Phase 018 Gap Closure Execution Spec

**Date:** 2026-04-09  
**Modes Applied:** execution planning, acceptance framing  
**Primary Target:** Phase 018 correction pass  
**Related Inputs:**  
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-PHASE-018-HANDOFF-REVIEW-2026-04-09.md`  
- `/Users/hanyramadan/token traker/docs/research/phase-018-phase-016-gap-audit-and-closure.md`  
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/spec.md`  

---

## Mission

Close the real remaining Phase 018 gaps so the repo can truthfully claim:

- real rolling `1h`
- period parity across Overview, Analytics, Menubar, Tray, and Export
- visible in-product notification state
- honest completion reporting

---

## Scope

### In scope

- canonical hour/day/all-time period resolution
- period-aware read-service and database accessors
- Overview scope parity
- Menubar scope parity
- tray scope truth and labeling
- visible notification-state UI
- export-link scope preservation
- archive and report reconciliation

### Out of scope

- redesigning the app visually beyond the notification-state surface
- unrelated provider ingestion changes
- new analytics feature work unrelated to truth gaps

---

## Non-Negotiable Product Rules

1. Labels and values must share the same scope.
2. `1h` must mean a real rolling hour, never same-day and never 24 hours.
3. Export must preserve the same selected scope the user is viewing.
4. Notification visibility must be rendered in-product, not hidden behind raw
   JSON.
5. Reports may only mark `PASS` when code and validation both support it.

---

## Required Workstreams

### Workstream 1: Canonical period plumbing

Implement one canonical resolver that yields a window kind and amount for:

- `1h`
- `1d`
- `7d`
- `1m`
- `all`

Expected result:

- read-service stops deriving hour semantics from `periodIdToDays()`
- database queries use explicit hour-window methods for hour-based scopes
- recent-session listing supports scoped retrieval instead of reusing all-time
  list paths

### Workstream 2: Overview parity

Overview must become period-correct for:

- summary metrics
- provider breakdown
- session list / pagination
- context-health and active-surface computations where they are intended to
  reflect the selected window

Expected result:

- changing the chip changes the data, not just the chip highlight

### Workstream 3: Menubar and tray truth

Menubar and tray must no longer diverge semantically.

Expected result:

- menubar hero spend and recent sessions share one scope
- tray text/tooltip explicitly reflects the same scope, or is explicitly labeled
  as all-time if scope parity is intentionally not adopted

Preferred result:

- tray uses a scoped endpoint and includes scope wording in the tooltip

### Workstream 4: Notification-state UI

Replace the bell-link-only approach with a real visible surface.

Expected result:

- Overview or Analytics renders latest notification mode and suppression reason
- UI works even when `TTM_DESKTOP_API_KEY` is enabled
- JSON endpoint can remain as a backing mechanism, but not as the primary UX

### Workstream 5: Export and report reconciliation

Expected result:

- export buttons preserve selected period
- completion report is rewritten to match verified truth
- archive contains the expected follow-up report artifact(s)

---

## Suggested File Targets

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

## Acceptance Criteria

1. `getSummarySnapshotForPeriod('1h')` and
   `getAnalyticsSnapshotForPeriod('1h')` use a true one-hour window.
2. Overview data changes materially when switching between `1h`, `1d`, `7d`,
   `1m`, and `all`.
3. Menubar recent-session data matches the displayed spend scope.
4. Tray title/tooltip no longer imply scoped behavior while reading all-time
   data.
5. Notification-state UI is visible in-product without opening raw JSON.
6. Export actions preserve the selected period from both Overview and
   Analytics.
7. Updated completion report distinguishes:
   - what Phase 018 originally claimed
   - what this correction pass actually fixed
   - any remaining accepted limitations

---

## Validation Matrix

OpenCode should not close the phase without evidence for all of the following:

1. Typecheck passes.
2. Relevant build commands pass.
3. A reproducible check demonstrates `1h` and `1d` differ when fixture or real
   data allows.
4. Overview, Analytics, Menubar, Export, and Tray are checked against the same
   selected scope contract.
5. Notification-state UI is shown in rendered HTML, not only JSON.
6. Final report cites exact commands and exact results.

---

## Reporting Requirements

OpenCode must report:

1. Which contradictions from the handoff review were fixed.
2. Which files changed.
3. Exact validation commands and results.
4. Any remaining limitations with explicit `PARTIAL` wording.
5. A final line using:
   - `Phase 018 is fully complete.`
   - or `Phase 018 remains partial because ...`
