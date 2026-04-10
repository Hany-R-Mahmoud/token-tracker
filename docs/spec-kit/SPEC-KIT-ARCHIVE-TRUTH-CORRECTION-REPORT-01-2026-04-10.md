# SPEC-KIT: Archive Truth Correction Report — Pass 01

**Date:** 2026-04-10
**Queue Items Handled:** 1, 2, 3
**Pass Type:** Archive correction + audit report correction
**Code Changes:** None (archive-only pass)

---

## 1. Queue Items Handled

| # | Queue Item | Bucket | Outcome |
|---|-----------|--------|---------|
| 1 | Phase 009 claim reconciliation | A — Archive Overclaim Correction | **Complete** |
| 2 | Phase 016 / Phase 018 archive reconciliation | A — Archive Overclaim Correction | **Complete** |
| 3 | Security debt truth pass (Phases 004, 006) | A — Archive Overclaim Correction | **Complete** |

---

## 2. Files Reviewed

### Queue Item 1 — Phase 009
- `specs/009-success-analysis-and-representation/spec.md`
- `docs/handoffs/phase-009/completion-report.md`
- `docs/handoffs/phase-009/final-completion-report.md`
- `docs/handoffs/phase-009/opencode-to-codex-handover-report.md`
- `specs/017-phase-009-claim-audit-and-gap-closure/spec.md`

### Queue Item 2 — Phase 016 / 018
- `specs/016-operator-time-windows-and-analytics-clarity/spec.md`
- `docs/handoffs/phase-016/completion-report.md`
- `specs/018-phase-016-gap-audit-and-closure/spec.md`
- `docs/handoffs/phase-018/completion-report.md`

### Queue Item 3 — Security Debt (Phases 004, 006)
- `specs/004-competitive-parity/spec.md`
- `specs/006-open-gaps-and-hardening/spec.md`
- `docs/handoffs/phase-004/opencode-to-codex-report-01.md`
- `docs/handoffs/phase-006/opencode-to-codex-report-01.md`
- `docs/security-audit-2026-04-05.md`
- `docs/security-status-2026-04-05-current.md`
- `docs/security-fixes/fix-spec-*.md` (5 files)
- `apps/desktop/src/index.ts` (rate limiting implementation)
- `packages/cli/src/index.ts` (export path validation)
- `apps/desktop-tauri/src-tauri/src/lib.rs` (IPC authentication)
- `packages/core/src/db/desktop-period.ts` (period model)

### Audit Report Corrected
- `docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`

---

## 3. Archive Claim Before

### Queue Item 1 — Phase 009
- `final-completion-report.md`: **"FULLY COMPLETE"** with **"No remaining gaps."**
- `completion-report.md`: **"FULLY COMPLETE"** with **"Phase 009 is now fully complete."**
- Quickstart: **12/12 PASS**
- Audit report: Phase 009 assessed as `MISMATCH` — "Archive overclaims; Phase 017 was required to fix"

### Queue Item 2 — Phase 016
- `completion-report.md`: **"COMPLETE"** — all 8 validation items marked **PASS**
- Audit report: Phase 016 assessed as `PARTIAL` — "Phase 018 needed to close gaps"

### Queue Item 3 — Security Debt (Phases 004, 006)
- Phase 004 progress report: Listed M3, M5, M6 as **"not implemented"**
- Phase 006 progress report: Listed M3, M5, M6 as **"not implemented"**
- Audit report: Flagged as **"Critical — Security fixes M3/M5/M6 never implemented"** and listed as a cross-phase drift pattern: "Security audit findings documented but not acted upon"
- `security-audit-2026-04-05.md`: Shows M3, M5, M6 as **"Fixed"**
- `security-status-2026-04-05-current.md`: Confirms M3, M5, M6 as **FIXED** with evidence of implementation

---

## 4. Implemented Reality

### Queue Item 1 — Phase 009
The implementation delivered in the Phase 009 pass is real and validated:
- `packages/core/src/analysis/success.ts` — analysis engine with 12 passing unit tests
- `apps/desktop/src/index.ts` — overview, analytics, session detail success surfaces
- `apps/desktop/src/menubar.ts` — compact success cue
- All SQL queries execute successfully on real database

However, Phase 017 was later created because the "fully complete" / "no remaining gaps" claim did not account for the broader visual-analytics revisit scope that the Phase 009 spec was later expanded to include. The implementation claims remain valid for the **original narrow success-analysis scope** only.

### Queue Item 2 — Phase 016
The implementation delivered in the Phase 016 pass is real:
- Canonical period model defined (`DesktopPeriodId`, `DesktopPeriod`)
- Database query layer supports hour/day/week/month/all
- Desktop UI responds to period selection
- Synthetic observability labels replaced

However, several items marked PASS were actually PARTIAL:
- `1h` used `periodIdToDays()` which mapped `1h` → 1 day, not 1 hour
- Export still used days-based params, not canonical period
- Menubar showed period label but fed all-time data
- Notification state was only inspectable via API, not visible in-app

Phase 018 closed all four gaps.

### Queue Item 3 — Security Debt
The audit report's claim that M3, M5, M6 are "never implemented" is **incorrect**:

| Finding | Implementation Evidence | File |
|---------|----------------------|------|
| M3 (rate limiting) | In-memory sliding window rate limiter (60 req/min per IP) with automatic cleanup | `apps/desktop/src/index.ts` lines 53-60, 1875-1896; `apps/web/src/index.ts` |
| M5 (path validation) | `validateExportPath()` — no traversal, length limits, format check | `packages/cli/src/index.ts` lines 662-688 |
| M6 (TLS pinning / IPC auth) | Shared-secret API key (`TTM_DESKTOP_API_KEY`) for Tauri → desktop IPC | `apps/desktop-tauri/src-tauri/src/lib.rs` lines 125-134; `apps/desktop/src/index.ts` lines 54, 820-840 |

M6 was addressed via shared-secret authentication rather than literal TLS certificate pinning. For localhost IPC, this is an acceptable and equivalent security control.

**Remaining open security items:**
- **H1 (plaintext OAuth tokens):** Mitigated by `chmod 0o600` on database file; full encryption deferred
- **M4 (session cleanup):** Explicitly deferred — sessions expire on-read via `getWebSession()`

---

## 5. Corrections Made Now

### Queue Item 1 — Phase 009 (Archive Correction)

**File: `docs/handoffs/phase-009/final-completion-report.md`**
- Changed status from `✅ FULLY COMPLETE` to `✅ IMPLEMENTATION COMPLETE — archive reconciled by Phase 017`
- Added "Archive Reconciliation Note" section explaining Phase 017's existence and purpose
- Changed closing statement from "Phase 009 Is Now Fully Complete" / "No remaining gaps" to "Phase 009 Implementation Status" with explicit scope limitation
- Clarified that implementation claims remain valid for the original narrow success-analysis scope only

**File: `docs/handoffs/phase-009/completion-report.md`**
- Changed status from `✅ FULLY COMPLETE` to `✅ IMPLEMENTATION COMPLETE — archive reconciled by Phase 017`
- Added "Archive Reconciliation Note" section
- Changed closing statement to clarify scope boundary between original success-analysis work and later visual-analytics revisit

### Queue Item 2 — Phase 016 (Archive Correction)

**File: `docs/handoffs/phase-016/completion-report.md`**
- Changed status from `COMPLETE` to `COMPLETE — gaps closed by Phase 018`
- Added "Archive Reconciliation Note" listing the four specific gaps Phase 018 closed
- Replaced the uniform PASS validation table with a two-column table showing "Status at Phase 016" vs "Later Status (Phase 018)"
- Updated Notes section to explicitly reference Phase 018 corrections

### Queue Item 3 — Security Debt (Audit Report Correction)

**File: `docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`**
- Corrected "Persistent Issues" section: M3/M5/M6 changed from "still not implemented" to "implemented in 2026-04-05 remediation pass"
- Corrected Phase 004 findings: M3/M5/M6 severity changed from "Critical — never implemented" to "Corrected — implemented in remediation pass"
- Corrected Phase 006 findings: M3/M5/M6 changed from "still unimplemented" to "implemented in remediation pass"
- Corrected Phase 009 assessment: Added "Archive corrected in Correction Pass 01"
- Corrected Phase 016 assessment: Added "Archive corrected in Correction Pass 01"
- Corrected "Pattern 2": Renamed from "Security Fixes Never Implemented" to "Security Fixes — Originally Flagged, Later Remediated" with full evidence
- Corrected "Highest-Risk Overclaims" table: Removed M3/M5/M6 from Critical; moved to Major with corrected reality description
- Corrected "Recommended Correction Queue": Priority 2 marked as RESOLVED; remaining open items (H1, M4) documented
- Corrected "Completion Statement": All four points updated with Correction Pass 01 annotations; M3/M5/M6 strikethrough with correction note

---

## 6. Validation Commands and Results

```bash
# Typecheck — PASS (0 errors)
$ npm run typecheck
> tsc -b packages/core packages/cli apps/desktop apps/web --pretty false

# Build — PASS (0 errors)
$ npm run build
> tsc -b packages/core packages/cli apps/desktop apps/web
```

**No code changes were made in this pass.** All corrections were archive-only. The typecheck and build commands confirm the codebase remains in its previous passing state.

### Implementation Evidence Commands (run during research phase)

```bash
# Rate limiting exists in desktop app
$ grep -n "rateLimitStore" apps/desktop/src/index.ts
# → Lines 60, 1875, 1879, 1889, 1893-1896 — active rate limiter with Map-based sliding window

# Path validation exists in CLI
$ grep -n "validateExportPath" packages/cli/src/index.ts
# → Lines 662-688 — full validation function with traversal prevention

# IPC authentication exists in Tauri
$ grep -n "api_key\|TTM_DESKTOP_API_KEY" apps/desktop-tauri/src-tauri/src/lib.rs
# → Lines 125-134 — get_api_key() and query param injection

# Rolling hour semantics exist
$ grep -n "periodIdToHours" packages/core/src/db/desktop-period.ts
# → Line 31 — true hour mapping function

# Notification check endpoint exists
$ grep -n "/api/notification-check" apps/desktop/src/index.ts
# → Line 1954 — endpoint handler present
```

---

## 7. What Remains Open

### Not addressed in this pass (by design — per queue prioritization)

| Queue Item | Target | Reason Deferred |
|-----------|--------|----------------|
| Queue Item 4 | Phase 002, 005, 007, 011 (secondary partial phases) | Lower priority — next pass |
| Queue Item 5 | Phase 008, 017 (unverified review phases) | Lower priority — next pass |

### Remaining open debt items (not archive issues — actual product gaps)

| Item | Severity | Status | Notes |
|------|----------|--------|-------|
| H1: Plaintext OAuth tokens | High (mitigated) | PARTIAL | `chmod 0o600` in place; full encryption deferred |
| M4: Session cleanup | Medium | DEFERRED | Sessions expire on-read; proactive cleanup deferred |
| Database migration (`IF NOT EXISTS`) | Medium | OPEN | Node.js SQLite limitation persists across phases |

### Remaining archive corrections needed (future passes)

- Phase 002, 005, 007, 011: Overstated success language needs tightening
- Phase 008, 017: Review-only phases need explicit `UNVERIFIED` archive language

---

## 8. Explicit Completion Statements

### Queue Item 1: Phase 009 Claim Reconciliation
**Correction is complete.** Both `final-completion-report.md` and `completion-report.md` in `docs/handoffs/phase-009/` now explicitly acknowledge Phase 017's role, scope the "fully complete" claim to the original narrow success-analysis work only, and no longer assert "no remaining gaps." No remaining contradiction exists between Phase 009 archive language and Phase 017's purpose.

### Queue Item 2: Phase 016 / Phase 018 Archive Reconciliation
**Correction is complete.** `docs/handoffs/phase-016/completion-report.md` now explicitly acknowledges Phase 018's existence, lists which items were PASS at Phase 016 time vs which were PARTIAL and later fixed by Phase 018, and no longer implies the pre-Phase 018 state was final. No remaining contradiction exists between Phase 016 archive language and Phase 018's closure work.

### Queue Item 3: Security Debt Truth Pass
**Correction is complete.** The audit report (`SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`) no longer claims M3, M5, M6 are "never implemented." It now correctly states they were implemented in the 2026-04-05 remediation pass, with explicit file references. Remaining open security items (H1 plaintext tokens, M4 session cleanup) are named explicitly without softening.

---

## 9. Pass Scope Statement

This was an **archive-only correction pass.** No code files were modified. All changes were to:
- `docs/handoffs/phase-009/final-completion-report.md`
- `docs/handoffs/phase-009/completion-report.md`
- `docs/handoffs/phase-016/completion-report.md`
- `docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`

The corrections preserve historical implementation claims while making the archive honest about what was complete at each phase's delivery time versus what required later gap-closure work.

---

Correction pass 01 is complete.
