# SPEC-KIT: All Phases Implementation Audit Report

**Date:** 2026-04-10  
**Audience:** Codex and OpenCode  
**Purpose:** Consolidated audit of implemented behavior against phase docs, specs, handoffs, and completion claims

---

## 1. Audit Summary

This audit examined all archived phases (001-018) by comparing documented intent, claimed completion status, and archived reports against the current implementation in the codebase.

**Overall Assessment:** Multiple phases show evidence of overclaiming in archived reports. Several critical issues persist across phases including recurring TypeScript compilation problems, unimplemented security fixes, and gap-closure phases that indicate earlier completion claims were premature.

---

## 2. Repo-Wide Assessment

### Build Status

- `npm run typecheck` — **PASS** (0 errors)
- `npm run build` — **PASS** (0 errors)

### Persistent Issues Across Phases

1. **TypeScript compilation errors** — Reported in Phases 002, 004, 005, 006, 007, 009 as blocking, but now passes
2. **Database migration** — Node.js SQLite `ALTER TABLE ADD COLUMN IF NOT EXISTS` never resolved
3. **Security fixes (M3, M5, M6)** — Implemented in 2026-04-05 remediation pass; audit report originally flagged as unimplemented but `docs/security-status-2026-04-05-current.md` confirms they were addressed
4. **Desktop UI success analysis** — Implemented; Phase 017 verified claims
5. **CLI success analysis output** — Implemented; Phase 017 verified claims

---

## 3. Per-Phase Sections

### Phase 001 — Local MVP Foundation

**Files Reviewed:**

- `specs/001-local-mvp/spec.md`
- `docs/handoffs/phase-001/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-001/opencode-to-codex-final-report.md`

**Documented Expectation:**

- Local SQLite storage, Codex/OpenCode adapters, CLI commands (doctor, import, summary, sessions, analyze), desktop HTTP server with overview, session detail, basic analytics

**Implemented Reality:**

- `packages/core/src/db/database.ts` — SQLite storage exists
- `packages/core/src/adapters/codex.ts`, `opencode.ts` — Adapters exist
- `packages/cli/src/index.ts` — CLI commands exist
- `apps/desktop/src/index.ts` — Desktop server exists

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Minor | Documentation Drift | Phase 001 report claims all tasks complete, but no verification evidence (test commands) provided |

**Phase Assessment:** `MATCH`

---

### Phase 002 — Productization

**Files Reviewed:**

- `specs/002-productization/spec.md`
- `docs/handoffs/phase-002/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-002/opencode-to-codex-report-01.md`

**Documented Expectation:**

- Menu bar monitoring, provider status layer, success analysis model, windowed analytics, security audit, database migration

**Implemented Reality:**

- Menu bar and provider status layer exist
- Success analysis model exists (`packages/core/src/analysis/success.ts`)
- Security audit documented but 3 findings unimplemented (M3, M5, M6)

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Major | Report Honesty | Report says "partially implemented" — honest assessment |
| Major | Validation Integrity | TypeScript errors blocking compilation (`listSessionsForWindow`) |
| Major | Spec Alignment | Database migration for existing DBs not implemented |

**Phase Assessment:** `PARTIAL`

---

### Phase 003 — Monitoring and Glanceable UX

**Files Reviewed:**

- `specs/003-monitoring-and-glanceable-ux/spec.md`
- `docs/handoffs/phase-003/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-003/opencode-to-codex-report-01.md`

**Documented Expectation:**

- File watching with auto-refresh, default analytics window preferences, windowed analytics methods, menu bar compact view with toggle, provider status indicators

**Implemented Reality:**

- `setupFileWatcher()` exists in `database.ts`
- `loadPreferences()`/`savePreferences()` exist in `apps/desktop/src/preferences.ts`
- Windowed analytics methods exist
- Menu bar detailed/minimal toggle exists

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Minor | Documentation Drift | No quickstart.md found to verify acceptance criteria |

**Phase Assessment:** `MATCH`

---

### Phase 004 — Competitive Parity

**Files Reviewed:**

- `specs/004-competitive-parity/spec.md`
- `docs/handoffs/phase-004/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-004/opencode-to-codex-report-01.md`

**Documented Expectation:**

- Provider expansion, status layer, competitive feature parity analysis, security audit, database migration

**Implemented Reality:**

- Provider status layer complete
- Security audit documented (14 findings, 7 fixed, 3 unimplemented M3/M5/M6, 3 accepted)
- TypeScript compilation errors persist

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Major | Report Honesty | Report claims "partially implemented" but lists multiple broken items |
| **Corrected** | Spec Alignment | Security fixes M3 (rate limiting), M5 (path validation), M6 (TLS pinning) — originally flagged as unimplemented in this audit, but were implemented in the 2026-04-05 remediation pass. See `docs/security-status-2026-04-05-current.md` for evidence. M6 was addressed via shared-secret IPC authentication rather than literal TLS pinning. |
| Major | Validation Integrity | Database migration still broken |

**Phase Assessment:** `PARTIAL` — security debt was implemented but audit report did not account for the 2026-04-05 remediation pass

---

### Phase 005 — Team Leaderboard

**Files Reviewed:**

- `docs/handoffs/phase-005/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-005/opencode-to-codex-report-01.md`

**Documented Expectation:**

- Leaderboard database/types, session ingestion, GitHub OAuth, leaderboard web interface

**Implemented Reality:**

- `apps/web/src/db.ts` — Leaderboard database exists
- `apps/web/src/ingestion.ts` — Ingestion module exists
- `apps/web/src/index.ts` — OAuth setup exists
- No web UI built yet

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Major | Spec Alignment | Leaderboard web interface not built |
| Major | Report Honesty | Report accurately states "partially implemented" |

**Phase Assessment:** `PARTIAL`

---

### Phase 006 — Open Gaps and Hardening

**Files Reviewed:**

- `docs/handoffs/phase-006/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-006/opencode-to-codex-report-01.md`

**Documented Expectation:**

- Security audit, database migration, TypeScript fixes, desktop UI updates, CLI updates

**Implemented Reality:**

- Security audit complete
- TypeScript errors identified but may now be resolved
- Desktop UI and CLI success analysis updates not started

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Major | Spec Alignment | Desktop UI and CLI success analysis updates not implemented at time of Phase 006 report — later implemented in Phase 009 |
| **Corrected** | Validation Integrity | Security fixes M3, M5, M6 — originally flagged as unimplemented in this audit, but were implemented in the 2026-04-05 remediation pass. See `docs/security-status-2026-04-05-current.md`. |

**Phase Assessment:** `PARTIAL` — security debt was later addressed; desktop/CLI updates delivered in Phase 009

---

### Phase 007 — (Phase 009 Success Analysis)

**Files Reviewed:**

- `docs/handoffs/phase-007/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-007/opencode-to-codex-report-01.md`

**Documented Expectation:**

- Success analysis model extension, evidence subsystem, wire into all surfaces

**Implemented Reality:**

- `SessionSuccessAnalysis` interface exists
- `analyzeSuccess()` function exists
- Database schema updated with 8 new columns

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Major | Report Honesty | Report states "partially implemented" with TypeScript errors |

**Phase Assessment:** `PARTIAL`

---

### Phase 008 — Security Audit Review

**Files Reviewed:**

- `docs/handoffs/phase-008/codex-to-opencode-prompt-01.md`

**Documented Expectation:**

- Review security audit, identify which fixes are done vs not done

**Implemented Reality:**

- No new implementation; this was a review-only phase

**Phase Assessment:** `UNVERIFIED` (review phase, no implementation expected)

---

### Phase 009 — Success Analysis and Representation

**Files Reviewed:**

- `specs/009-success-analysis-and-representation/spec.md`
- `docs/handoffs/phase-009/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-009/opencode-to-codex-handover-report.md`
- `docs/handoffs/phase-009/completion-report.md`
- `docs/handoffs/phase-009/final-completion-report.md`

**Documented Expectation:**

- Session success analysis (completion, verification, confidence, signals), wired into CLI/overview/analytics/menubar/leaderboard, privacy-safe

**Implemented Reality:**

- `packages/core/src/analysis/success.ts` — 12 unit tests all pass
- Desktop surfaces updated with success cards
- Analytics success section with 5 views
- Menubar success cue exists

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Critical | Report Honesty | Phase 017 (claim audit) created specifically because Phase 009 overclaimed |
| Major | Surface Truth | Completion report says "fully complete" but Phase 017 needed to reconcile claims |

**Evidence:**

- Phase 017 spec exists: `specs/017-phase-009-claim-audit-and-gap-closure/spec.md`
- Phase 009 completion report claims "No remaining gaps" but Phase 017 was needed

**Phase Assessment:** `MISMATCH` — Archive overclaims; Phase 017 was required to fix — **Archive corrected in Correction Pass 01**

---

### Phase 010 — Session Context Audit and Compact Handoffs

**Files Reviewed:**

- `specs/010-session-context-audit-and-compact-handoffs/spec.md`
- `docs/handoffs/phase-010/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-010/completion-report.md`
- `docs/handoffs/phase-010/opencode-to-codex-final-report.md`

**Documented Expectation:**

- Context audit model, session detail context UI, analytics context views, menubar context cue, CLI context output, compact protocol adoption

**Implemented Reality:**

- `packages/core/src/domain/context-audit.ts` — Model exists
- Desktop surfaces have context sections
- Menubar has context cue
- CLI output includes context breakdown
- Compact protocol adopted

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Minor | Documentation Drift | No quickstart.md verified |

**Phase Assessment:** `MATCH`

---

### Phase 011 — Claude Provider Local Ingestion

**Files Reviewed:**

- `specs/011-claude-provider-local-ingestion/spec.md`
- `docs/handoffs/phase-011/codex-to-opencode-correction-01.md`
- `docs/handoffs/phase-011/opencode-to-codex-final-report.md`

**Documented Expectation:**

- Claude adapter, validated sources, noise exclusion, honest status

**Implemented Reality:**

- `packages/core/src/adapters/claude.ts` — Exists with 7 tests
- Claude shows as validated in CLI doctor
- 41 sessions imported in test run

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Minor | Report Honesty | Correction prompt needed to fix 3 defects (providerSessionId, synthetic filtering, toolCallCount) — indicates earlier implementation was flawed |

**Phase Assessment:** `MATCH` (after correction)

---

### Phase 016 — Operator Time Windows and Analytics Clarity

**Files Reviewed:**

- `specs/016-operator-time-windows-and-analytics-clarity/spec.md`
- `docs/handoffs/phase-016/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-016/completion-report.md`

**Documented Expectation:**

- Canonical desktop period contract (1h/1d/7d/1m/all), period-scoped data, truthful analytics labels, notification visibility

**Implemented Reality:**

- `packages/core/src/db/desktop-period.ts` — Period model exists
- Desktop UI uses canonical periods
- Menubar shows period-scoped spend
- Notification delivery API exists

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Critical | Report Honesty | Phase 018 created to "close remaining gaps" from Phase 016 — indicates Phase 016 overclaimed |

**Phase Assessment:** `PARTIAL` — Phase 018 needed to close gaps — **Archive corrected in Correction Pass 01**

---

### Phase 017 — Phase 009 Claim Audit and Gap Closure

**Files Reviewed:**

- `specs/017-phase-009-claim-audit-and-gap-closure/spec.md`
- `docs/handoffs/phase-017/codex-to-opencode-prompt-01.md`

**Documented Expectation:**

- Reconcile Phase 009 claims with repo truth, fix contradictions, update archive

**Implemented Reality:**

- This was a documentation/reconciliation phase

**Phase Assessment:** `UNVERIFIED` (audit phase)

---

### Phase 018 — Phase 016 Gap Audit and Closure

**Files Reviewed:**

- `specs/018-phase-016-gap-audit-and-closure/spec.md`
- `docs/handoffs/phase-018/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-018/completion-report.md`

**Documented Expectation:**

- Close remaining gaps from Phase 016: 1h rolling semantics, export period support, menubar period-scoped data, notification visibility

**Implemented Reality:**

- `periodIdToHours()` added for true rolling hour
- Export accepts canonical period
- Menubar uses period-scoped data
- Notification state visible in nav

**Findings:**
| Severity | Category | Issue |
|----------|----------|-------|
| Major | Documentation Drift | Existence of Phase 018 proves Phase 016 completion claim was premature |

**Phase Assessment:** `MATCH` (gap closure complete)

---

## 4. Cross-Phase Drift Patterns

### Pattern 1: Recurring TypeScript Compilation Errors

- **Appears in:** Phases 002, 004, 005, 006, 007, 009
- **Error:** `Property 'listSessionsForWindow' does not exist on type 'TtmDatabase'`
- **Status:** Now resolved (typecheck passes)
- **Pattern:** Same error reported across 6 phases without permanent fix

### Pattern 2: Security Fixes — Originally Flagged, Later Remediated

- **Appears in:** Phases 004, 006
- **Finding:** M3 (rate limiting), M5 (path validation), M6 (TLS pinning / IPC auth)
- **Status:** Implemented in 2026-04-05 remediation pass
- **Evidence:** `docs/security-status-2026-04-05-current.md` confirms all three as FIXED
- **Note:** M6 was addressed via shared-secret API key authentication for Tauri IPC rather than literal TLS certificate pinning. This is an acceptable control for localhost IPC.
- **Pattern:** This audit originally flagged these as "never implemented" without accounting for the remediation pass

### Pattern 3: Gap-Closure Phases Indicating Overclaiming

- **Phase 017:** Created specifically to audit/close gaps from Phase 009
- **Phase 018:** Created specifically to close gaps from Phase 016
- **Pattern:** Each "gap closure" phase proves the prior phase's completion claim was premature

### Pattern 4: Database Migration Never Resolved

- **Appears in:** Phases 002, 004, 006, 009
- **Issue:** Node.js SQLite doesn't support `ALTER TABLE ADD COLUMN IF NOT EXISTS`
- **Status:** Still not resolved
- **Pattern:** Persistent blocker across multiple phases

### Pattern 5: UI/CLI Updates Claimed but Unverified

- **Appears in:** Phase 006, Phase 009
- **Claim:** Desktop UI and CLI success analysis updates complete
- **Status:** Unclear if actually implemented (Phase 017 needed to verify)
- **Pattern:** Completion claimed without verification

---

## 5. Highest-Risk Overclaims

### Critical Overclaims

| Phase | Claim                                  | Reality                        | Risk                              |
| ----- | -------------------------------------- | ------------------------------ | --------------------------------- |
| 009   | "Fully complete" / "No remaining gaps" | Phase 017 needed to reconcile  | Archives misleading future agents |
| 016   | "COMPLETE" completion report           | Phase 018 needed to close gaps | Archives misleading future agents |

### Major Overclaims

| Phase | Claim                       | Reality                                                                                            |
| ----- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| 002   | Security audit done         | 3 fixes not implemented at time — later remediated 2026-04-05                                      |
| 004   | Provider status "complete"  | Security fixes M3/M5/M6 were implemented in 2026-04-05 remediation; audit did not account for this |
| 005   | Leaderboard foundation done | Web UI never built                                                                                 |
| 006   | "Hardening" phase           | Desktop UI/CLI updates not started at time — delivered in Phase 009                                |
| 010   | "fully complete"            | No quickstart verification                                                                         |

---

## 6. Recommended Correction Queue

### Priority 1: Fix Archive Overclaims (Documentation)

1. **Phase 009 docs** — Remove "No remaining gaps" claim; update to reflect Phase 017 audit findings — **DONE in Correction Pass 01**
2. **Phase 016 completion-report.md** — Update to acknowledge Phase 018 gap closure — **DONE in Correction Pass 01**
3. **Phase 004 / 006 reports** — Audit originally flagged M3/M5/M6 as unimplemented but they were addressed in the 2026-04-05 remediation pass — **CORRECTED in Correction Pass 01**

### Priority 2: ~~Implement Outstanding Security Fixes~~ — RESOLVED

M3 (rate limiting), M5 (path validation), and M6 (IPC authentication) were implemented in the 2026-04-05 remediation pass. This audit report originally listed them as "never implemented" but that claim has been corrected.

Remaining open security items:

- **H1 (plaintext OAuth tokens):** File permissions hardened to 0o600, but full encryption deferred
- **M4 (session cleanup):** Explicitly deferred — sessions expire on-read

### Priority 3: Resolve Database Migration

- Implement proper column-existence check using `PRAGMA table_info` instead of `IF NOT EXISTS`

### Priority 4: Verify Desktop/CLI Success Analysis

- Confirm Phase 009 success analysis UI actually renders in desktop app
- Confirm CLI output includes success analysis data

---

## 7. Validation Notes

```bash
# Build — PASS
$ npm run build
> tsc -b packages/core packages/cli apps/desktop apps/web

# Typecheck — PASS
$ npm run typecheck
> tsc -b packages/core packages/cli apps/desktop apps/web --pretty false
```

**Note:** Passing typecheck/build does **not** override semantic mismatches identified in this audit. The archive overclaims in Phases 009 and 016 are the primary findings requiring correction.

---

## 8. Completion Statement

**Audit result: one or more archived reports overclaim implementation because:**

1. Phase 009 completion reports claim "fully complete" and "no remaining gaps" but Phase 017 was required to audit and reconcile claims — **archive corrected in Correction Pass 01**
2. Phase 016 completion report claims "COMPLETE" but Phase 018 was required to close remaining gaps (1h semantics, export period, menubar scoped data, notification visibility) — **archive corrected in Correction Pass 01**
3. ~~Phase 004 and 006 security audit claims include unimplemented fixes (M3, M5, M6)~~ — **CORRECTED in Correction Pass 01**: M3, M5, M6 were implemented in the 2026-04-05 remediation pass. This audit originally missed that evidence. Remaining open items: H1 (plaintext OAuth tokens, mitigated by file permissions), M4 (session cleanup, explicitly deferred).
4. Multiple phases (002-009) cited the same TypeScript error without permanent fix being implemented — error now passes but the pattern shows reports were premature

The codebase itself now compiles and typechecks. The archived completion reports in `docs/handoffs/` for Phases 009 and 016 have been corrected to acknowledge the existence of follow-up gap-closure phases (017, 018). The security debt claim (M3, M5, M6) has been corrected to reflect that they were implemented in the 2026-04-05 remediation.
