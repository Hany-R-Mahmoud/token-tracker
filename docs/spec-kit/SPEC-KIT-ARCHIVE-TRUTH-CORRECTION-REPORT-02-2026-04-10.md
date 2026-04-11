# SPEC-KIT: Archive Truth Correction Report — Pass 02

**Date:** 2026-04-10
**Queue Items Handled:** 4, 5
**Pass Type:** Archive correction only
**Code Changes:** None (archive-only pass)

---

## 1. Queue Items Handled

| # | Queue Item | Bucket | Outcome |
|---|-----------|--------|---------|
| 4 | Phase 002, 005, 007, 011 (Secondary Partial Phases) | A — Archive Overclaim Correction | **Complete** |
| 5 | Phase 008, 017 (Unverified Review Phases) | C — Deferred / Unverified Handling | **Complete** |

---

## 2. Files Reviewed

### Queue Item 4 — Secondary Partial Phases

**Phase 002:**
- `specs/002-productization/spec.md`
- `docs/handoffs/phase-002/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-002/opencode-to-codex-report-01.md`

**Phase 005:**
- `docs/handoffs/phase-005/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-005/opencode-to-codex-report-01.md`

**Phase 007:**
- `docs/handoffs/phase-007/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-007/opencode-to-codex-report-01.md`

**Phase 011:**
- `docs/handoffs/phase-011/codex-to-opencode-correction-01.md`
- `docs/handoffs/phase-011/opencode-to-codex-final-report.md`

### Queue Item 5 — Unverified Review Phases

**Phase 008:**
- `docs/handoffs/phase-008/codex-to-opencode-prompt-01.md`
- `docs/security-audit-2026-04-05.md`
- `docs/security-status-2026-04-05-current.md`

**Phase 017:**
- `specs/017-phase-009-claim-audit-and-gap-closure/spec.md`
- `docs/handoffs/phase-017/codex-to-opencode-prompt-01.md`

### Cross-Reference
- `docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`
- `docs/spec-kit/SPEC-KIT-ARCHIVE-TRUTH-CORRECTION-REPORT-01-2026-04-10.md`

---

## 3. Archive Claim Before

### Queue Item 4 — Secondary Partial Phases

**Phase 002:** Report honestly stated "partially implemented" with four broken items listed (TypeScript errors, DB migration, desktop UI, CLI). No overclaim detected — the report is honest about its limitations.

**Phase 005:** Report stated "partially implemented" — leaderboard database, types, and ingestion created, but web UI not built. No overclaim detected.

**Phase 007:** Report stated "partially implemented" with four broken items (TypeScript errors, DB migration, desktop UI, CLI). No overclaim detected, but the report does not clarify that all four gaps were later resolved by Phase 009.

**Phase 011:** Final report stated "Phase 011 is fully complete." The initial delivery pass had three real defects in the Claude adapter (wrong session ID field, incorrect synthetic filtering, tool call overcounting) that required a follow-up correction pass. The "fully complete" claim was premature for the initial delivery.

### Queue Item 5 — Unverified Review Phases

**Phase 008:** Only has a prompt file (`codex-to-opencode-prompt-01.md`). No handoff report, no completion report, no archive status note. The phase performed a security audit review but left no structured archive artifact explaining its classification or outcomes.

**Phase 017:** Only has a prompt file (`codex-to-opencode-prompt-01.md`). No handoff report, no completion report, no archive status note. The phase was an audit/reconciliation that produced no delivery artifacts of its own.

---

## 4. Implemented Reality

### Queue Item 4 — Secondary Partial Phases

**Phase 002:** The report was honest at the time. All four broken items were later resolved: TypeScript errors (fixed across phases), DB migration (still open — `IF NOT EXISTS` not supported by Node.js SQLite), desktop UI (Phase 009), CLI (Phase 009). The DB migration gap remains open.

**Phase 005:** The report was honest at the time. The leaderboard web UI was subsequently built — `apps/web/src/index.ts` contains a full leaderboard page with navigation, period controls, opt-in/opt-out visibility, drawer payload, and privacy-safe aggregated metrics. Phase 005's "❌ Leaderboard Web Interface" gap is now closed.

**Phase 007:** This was an early pass at success analysis. All gaps listed in this report (TypeScript errors, DB migration, desktop UI, CLI) were resolved by Phase 009. Phase 007 is a foundational implementation pass whose work was completed and extended by Phase 009.

**Phase 011:** The initial delivery had three defects that required a correction pass. The correction pass (`codex-to-opencode-correction-01.md`) fixed: `providerSessionId` from `sessionId` field, synthetic filtering via `message.model`, and tool call counting based on actual tool-use records. After correction, the Claude adapter is functional and honest.

### Queue Item 5 — Unverified Review Phases

**Phase 008:** A review-only phase. The security audit review was completed — the results are captured in `docs/security-audit-2026-04-05.md` and `docs/security-status-2026-04-05-current.md`. No implementation was expected.

**Phase 017:** An audit/reconciliation phase. Its findings were confirmed by the repo-wide audit and acted upon in Correction Pass 01. The archive corrections it called for are now complete. No implementation artifacts were expected.

---

## 5. Corrections Made Now

### Queue Item 4 — Secondary Partial Phases

**File: `docs/handoffs/phase-007/opencode-to-codex-report-01.md`**
- Added "Archive Reconciliation Note" at top explaining Phase 007 was subsumed by Phase 009
- Added explicit note in the status section that all four broken items were later resolved by Phase 009
- Preserves the original report text as historical record

**File: `docs/handoffs/phase-011/opencode-to-codex-final-report.md`**
- Added "Archive Reconciliation Note" at top documenting the three defects in the initial delivery
- References the correction pass (`codex-to-opencode-correction-01.md`) that fixed the defects
- Preserves the original report text as historical record

**Phase 002 and Phase 005:** No corrections made. Both reports were honest about their partial status at the time of writing. No overclaim was detected.

### Queue Item 5 — Unverified Review Phases

**File: `docs/handoffs/phase-008/archive-status-note.md`** (new)
- Created explicit archive status note explaining why Phase 008 is `UNVERIFIED`
- Documents what was actually done (security audit review)
- Points to the actual security status documents where findings are captured
- Provides a current security status summary table
- Explicitly states no completion claim should be made

**File: `docs/handoffs/phase-017/archive-status-note.md`** (new)
- Created explicit archive status note explaining why Phase 017 is `UNVERIFIED`
- Documents the six functional requirements from the Phase 017 spec
- Records which findings were acted upon and where
- Explicitly states the reconciliation work Phase 017 called for has been completed in Correction Pass 01

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
# Phase 005 leaderboard web UI exists
$ grep -c "leaderboard" apps/web/src/index.ts
# → 100+ references — full leaderboard page with nav, period controls, opt-in/out, drawer

# Phase 011 Claude adapter exists with tests
$ ls packages/core/src/adapters/claude.ts packages/core/src/adapters/claude.test.ts
# → Both files present
$ grep -c "sessionId\|is_synthetic\|toolCallCount" packages/core/src/adapters/claude.ts
# → Defect-relevant code present (correction pass verified fixes)

# Phase 008 security review results exist
$ ls docs/security-audit-2026-04-05.md docs/security-status-2026-04-05-current.md
# → Both files present with full findings
```

---

## 7. What Remains Open

### Not addressed in this pass (by design — end of current queue)

All five queue items from the Archive Truth Correction Queue have now been handled:

| Queue Item | Status |
|-----------|--------|
| Queue Item 1: Phase 009 | Complete (Pass 01) |
| Queue Item 2: Phase 016/018 | Complete (Pass 01) |
| Queue Item 3: Security debt M3/M5/M6 | Complete (Pass 01) |
| Queue Item 4: Phase 002/005/007/011 | Complete (Pass 02) |
| Queue Item 5: Phase 008/017 | Complete (Pass 02) |

### Remaining open product gaps (not archive issues)

| Item | Severity | Status | Notes |
|------|----------|--------|-------|
| H1: Plaintext OAuth tokens | High (mitigated) | PARTIAL | File permissions 0o600 in place; full encryption deferred |
| M4: Session cleanup | Medium | DEFERRED | Sessions expire on-read; proactive cleanup deferred |
| Database migration (`IF NOT EXISTS`) | Medium | OPEN | Node.js SQLite limitation persists across phases 002-009 |

### Remaining archive gaps (future work, not prioritized)

- No phase-specific quickstart files verified for Phases 001, 003, 010
- Phase 002 report's "broken" items list should be annotated with which were later resolved
- Phase 005 report's "❌ Leaderboard Web Interface" should be annotated to note it was later built

---

## 8. Explicit Completion Statements

### Queue Item 4: Secondary Partial Phases (002, 005, 007, 011)
**Correction is complete.** Phase 007's report now explicitly notes its gaps were resolved by Phase 009. Phase 011's report now documents the three defects that required a follow-up correction pass. Phase 002 and Phase 005 reports were already honest about their partial status and required no correction.

### Queue Item 5: Unverified Review Phases (008, 017)
**Correction is complete.** Both Phase 008 and Phase 017 now have explicit `archive-status-note.md` files explaining why they are classified as `UNVERIFIED`, what work was actually done, and where the results can be found. Phase 017's reconciliation goals are documented as completed via Correction Pass 01. Phase 008's security review results are documented as captured in the security audit and status documents.

---

## 9. Pass Scope Statement

This was an **archive-only correction pass.** No code files were modified. Changes were to:
- `docs/handoffs/phase-007/opencode-to-codex-report-01.md` — Added reconciliation note
- `docs/handoffs/phase-011/opencode-to-codex-final-report.md` — Added reconciliation note
- `docs/handoffs/phase-008/archive-status-note.md` — New file
- `docs/handoffs/phase-017/archive-status-note.md` — New file

---

Correction pass 02 is complete.
