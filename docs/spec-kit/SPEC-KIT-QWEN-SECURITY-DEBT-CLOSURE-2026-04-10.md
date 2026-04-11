# SPEC-KIT: Qwen Security Debt Closure

**Date:** 2026-04-10  
**Authors:** Codex using `agent-orchestrator` and `agent-docs`  
**Audience:** Qwen Code  
**Purpose:** Run a focused security debt verification and closure pass grounded in the repo's current implementation and the conflicting security/archive documents  

---

## Goal Summary

This spec exists to guide Qwen through a focused security closure pass.

The goal is not to blindly implement old audit findings. The goal is to verify
what is truly still open, close what remains open if authorized and feasible,
and correct the documentation if the repo already resolved items that the
archive audit still treats as debt.

Specifically, Qwen should resolve the truth around:

- M3: rate limiting
- M5: export/input path validation
- M6: Tauri-to-desktop IPC authentication / local trust boundary
- H1: plaintext GitHub OAuth token storage, which still appears partial
- M4: proactive session cleanup, which appears intentionally deferred

---

## Why This Pass Exists

The repo currently contains two different narratives:

1. The repo-wide implementation audit and archive correction queue treated
   security fixes M3, M5, and M6 as still-open debt that needed archive-truth
   correction.
2. The current security documents say M3, M5, and M6 are already fixed:
   - `/Users/hanyramadan/token traker/docs/security-audit-2026-04-05.md`
   - `/Users/hanyramadan/token traker/docs/security-status-2026-04-05-current.md`

That means the next pass must start by verifying which narrative is actually
correct in the live codebase.

Qwen should not assume the archive audit is right, and should not assume the
security status report is right. It must verify the current implementation
directly.

---

## Source Files To Read First

### Primary security docs

- `/Users/hanyramadan/token traker/docs/security-audit-2026-04-05.md`
- `/Users/hanyramadan/token traker/docs/security-status-2026-04-05-current.md`
- `/Users/hanyramadan/token traker/docs/security-fixes/fix-spec-1-auth-session.md`
- `/Users/hanyramadan/token traker/docs/security-fixes/fix-spec-2-secret-storage.md`
- `/Users/hanyramadan/token traker/docs/security-fixes/fix-spec-3-tauri-hardening.md`
- `/Users/hanyramadan/token traker/docs/security-fixes/fix-spec-4-http-headers.md`
- `/Users/hanyramadan/token traker/docs/security-fixes/fix-spec-5-input-validation.md`

### Audit / archive context

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ARCHIVE-TRUTH-CORRECTION-PROGRAM-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ARCHIVE-TRUTH-CORRECTION-QUEUE-2026-04-10.md`

### Likely implementation files

- `/Users/hanyramadan/token traker/apps/web/src/index.ts`
- `/Users/hanyramadan/token traker/apps/web/src/db.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/tauri.conf.json`
- `/Users/hanyramadan/token traker/packages/cli/src/index.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`

---

## Scope

### In scope

- verify current implementation of M3, M5, M6
- verify current implementation state of H1 and M4
- correct mismatched security/archive docs if current code proves the docs are
  outdated
- implement remaining security fixes only if they are truly still open and the
  change is bounded and safe
- produce a Markdown report that tells Codex what is actually closed, partial,
  deferred, or still open

### Out of scope

- unrelated product feature work
- broad archive cleanup outside the security area
- speculative security improvements that are not tied to the documented
  findings above

---

## Constraints And Assumptions

### Constraints

- Qwen must start with verification, not implementation.
- If a finding is already fixed in code, Qwen should correct the docs/reporting
  instead of re-implementing the same thing.
- If a finding remains partially open, Qwen must state exactly which portion is
  still open.
- If a finding is consciously deferred, Qwen must preserve that nuance instead
  of labeling it simply fixed or broken.

### Assumptions

- H1 likely remains partial because file-permission hardening is not equivalent
  to encryption-at-rest.
- M4 likely remains deferred rather than missing.
- M3, M5, and M6 may already be implemented despite older archive language.

---

## Ordered Execution Plan

### Step 1: Verify the documented security findings against current code

For each target finding:

- read the fix spec
- inspect the actual implementation file(s)
- decide whether the current state is:
  - `FIXED`
  - `PARTIAL`
  - `DEFERRED`
  - `OPEN`
  - `DOC_MISMATCH`

### Step 2: Reconcile conflicting documentation

Compare:

- security docs
- archive audit docs
- current code

If the archive correction queue still says M3/M5/M6 are open but the code now
proves they are fixed, Qwen should correct the archive truth docs instead of
inventing more implementation work.

### Step 3: Implement only truly open bounded issues

If any of the target findings are still genuinely open and the fix is bounded,
Qwen may implement them in this pass.

If a fix is large, risky, or cross-cutting, Qwen should document it as needing
its own follow-up instead of forcing it into this pass.

### Step 4: Validate

Run the smallest useful validation set, such as:

1. `npm run typecheck`
2. `npm run build`
3. targeted checks proving the relevant security behavior exists

### Step 5: Write the final report

The report must tell Codex:

- what was verified
- what was already fixed before this pass
- what was corrected now
- what remains partial or deferred
- whether the security debt queue item is truly complete

---

## Decision Rules Per Finding

### H1 — Plaintext OAuth token storage

Close as `FIXED` only if the token is no longer stored plaintext at rest.

If the repo still stores plaintext but with file-permission hardening, classify
as `PARTIAL`, not fixed.

### M3 — Rate limiting

Close as `FIXED` only if the relevant HTTP surfaces actually enforce rate
limiting in code.

If present in both desktop and web surfaces, and behavior is explicit, correct
the archive if needed.

### M4 — Proactive session cleanup

If the product intentionally uses on-read expiry and no proactive cleanup, keep
this as `DEFERRED` or `PARTIAL` according to the docs.

Do not relabel a conscious deferral as fixed.

### M5 — Export / path validation

Close as `FIXED` only if the relevant CLI or server paths validate dangerous
paths in code, not only in docs.

### M6 — Tauri IPC / localhost trust boundary

Close as `FIXED` only if the Tauri shell actually authenticates its polling or
IPC path and the desktop server validates it.

---

## Required Output

Qwen must write a Markdown report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-SECURITY-DEBT-CLOSURE-REPORT-2026-04-10.md`

The report must include:

1. **Security Debt Summary**
2. **Files Reviewed**
3. **Finding-by-Finding Status**
4. **Conflicts Between Docs And Code**
5. **Changes Made Now**
6. **Validation Commands And Results**
7. **What Remains Partial / Deferred / Open**
8. **Recommended Next Step**

---

## Completion Statement Rules

End the report with one of:

- `Security debt closure pass is complete.`
- `Security debt closure pass remains partial because ...`
- `Security debt documentation was corrected, but implementation work remains because ...`

---

## Packaging Recommendation

This should be treated as a Qwen-specific execution brief for one focused pass.

If the result is mostly documentation reconciliation, the next follow-up should
split into:

- a doc-truth correction pass
- a separate implementation pass for any truly still-open security item
