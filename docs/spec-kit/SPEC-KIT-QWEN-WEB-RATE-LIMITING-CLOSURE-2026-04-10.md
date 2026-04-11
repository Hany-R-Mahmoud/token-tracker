# SPEC-KIT: Qwen Web Rate Limiting Closure

**Date:** 2026-04-10  
**Authors:** Codex using `agent-orchestrator` and `agent-docs`  
**Audience:** Qwen Code  
**Purpose:** Implement and verify the missing web-side rate limiting needed to close M3 honestly

---

## Goal Summary

The security verification pass established that M3 is only partially fixed:

- desktop HTTP app: rate limiting exists
- web app: no rate limiting exists

This pass exists to close the missing web-side implementation and then update
the documentation so M3 can be classified honestly.

---

## Source of Truth

Read these files first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-SECURITY-DEBT-CLOSURE-REPORT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-SECURITY-DEBT-CLOSURE-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/security-status-2026-04-05-current.md`
- `/Users/hanyramadan/token traker/docs/security-audit-2026-04-05.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/web/src/index.ts`

The desktop implementation is the reference pattern for behavior, not a mandate
to copy blindly line-for-line.

---

## Scope

### In scope

- add web app rate limiting to `apps/web/src/index.ts`
- choose a reasonable per-IP in-memory rate-limiting pattern consistent with the
  desktop app
- return HTTP `429` for exceeded requests
- keep the change bounded and low-risk
- validate the new behavior
- update the security status docs to reflect the new truth
- write a Markdown report back to Codex

### Out of scope

- broad security redesign
- distributed rate limiting
- persistence-backed rate limiting
- unrelated auth/session changes

---

## Constraints And Assumptions

### Constraints

- Keep the implementation small and understandable.
- Prefer consistency with the desktop app unless the web app needs a clear
  deviation.
- Do not weaken existing request handling or security headers.
- Do not claim M3 is fixed until both code and docs are updated.

### Assumptions

- An in-memory per-IP sliding-window limiter is sufficient for this product’s
  current deployment model.
- The web server is local/small-scale enough that a simple in-process limiter is
  acceptable for now.

---

## Required Implementation

### Step 1: Inspect the desktop rate limiting pattern

Use `apps/desktop/src/index.ts` as the reference for:

- constants
- store shape
- per-IP request tracking
- cleanup behavior
- 429 response behavior

### Step 2: Add equivalent protection to the web app

Implement rate limiting in `apps/web/src/index.ts`.

Required behaviors:

- identify client IP consistently from the request
- track request count within a window
- reject requests above the threshold with HTTP `429`
- return a small generic payload/message
- periodically clean stale limiter entries

### Step 3: Keep the threshold honest

If you use the same threshold as desktop, document it exactly.

Do not leave the docs saying `100 requests/minute` if the actual value is `60`.

### Step 4: Update docs after code is verified

Update the minimum necessary docs so that:

- `docs/security-status-2026-04-05-current.md` reflects the new M3 truth
- if needed, `docs/security-audit-2026-04-05.md` is reconciled so it no longer
  contradicts the implementation

### Step 5: Write the closure report

Write a Markdown report back to Codex with exact evidence and commands.

---

## Suggested File Targets

- `/Users/hanyramadan/token traker/apps/web/src/index.ts`
- `/Users/hanyramadan/token traker/docs/security-status-2026-04-05-current.md`
- `/Users/hanyramadan/token traker/docs/security-audit-2026-04-05.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-WEB-RATE-LIMITING-CLOSURE-REPORT-2026-04-10.md`

---

## Validation Requirements

Qwen must provide evidence for:

1. `npm run typecheck`
2. `npm run build`
3. source-level proof that web request handling now includes rate-limit checks
4. exact threshold and response behavior
5. updated documentation matching the implementation

If feasible, include a quick targeted request test or a clear explanation of why
source-level verification is the chosen evidence.

---

## Required Report Output

Write a Markdown report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-WEB-RATE-LIMITING-CLOSURE-REPORT-2026-04-10.md`

The report must include:

1. **Summary**
2. **Files Changed**
3. **Implementation Details**
4. **Validation Commands And Results**
5. **Updated Security Status**
6. **What Remains Open**
7. **Explicit completion statement**

---

## Completion Statement Rules

End the report with one of:

- `Web rate limiting closure is complete.`
- `Web rate limiting closure remains partial because ...`

M3 should only be described as fully fixed if:

- web rate limiting is present in code
- docs match the implementation
- validation passes
