# SPEC-KIT: Archive Truth Correction Program

**Date:** 2026-04-10  
**Authors:** Codex using `agent-orchestrator` and `agent-docs`  
**Audience:** OpenCode  
**Purpose:** Convert the repo-wide implementation audit into an execution-ready correction program for archived specs, handoffs, quickstarts, and completion reports  

---

## Goal Summary

The repo-wide audit established that the archive is not uniformly trustworthy.

This correction program exists to help OpenCode repair that trust in a
controlled, auditable way.

The primary goal is not to rewrite history cosmetically. The goal is to make
the docs, handoffs, completion reports, and remaining correction work line up
with what the code actually does now.

OpenCode should use this program to:

1. correct the highest-risk overclaims first
2. distinguish archive-reconciliation work from implementation-gap work
3. write evidence-backed Markdown reports back to Codex
4. leave a cleaner and more trustworthy archive after each pass

---

## Why This Program Exists

The consolidated audit report found a repeated pattern:

- some archived reports claim phases were fully complete when later gap-closure
  phases proved they were not
- some docs still describe behaviors that are only partially implemented
- some security and hardening work was documented as debt but never resolved
- green builds and typechecks often coexist with semantic mismatches

That creates a documentation-trust problem, not just a code problem.

This program addresses the documentation-trust problem directly.

---

## Source of Truth

OpenCode must ground its correction work in these files first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-IMPLEMENTATION-VS-DOCS-AUDIT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

The current codebase is the source of truth for implemented behavior.

Archived reports, specs, quickstarts, and completion reports are the source of
truth for claimed intent and claimed completion.

When those conflict, OpenCode must say so explicitly.

---

## Constraints And Assumptions

### Constraints

- OpenCode must not treat all phases as equally urgent.
- Overclaiming phases must be addressed before lower-risk doc drift.
- If a phase requires code correction before report correction, OpenCode must
  say so explicitly instead of rewriting the archive to sound better.
- Report language must not be stronger than the evidence.
- Every correction pass must produce a Markdown report to Codex.

### Assumptions

- Some phases only need archive correction.
- Some phases require implementation correction and archive correction.
- Some phases are review-only and may remain `UNVERIFIED` if there is no
  implementation surface to audit.

---

## Correction Strategy

Use three work buckets:

### Bucket A: Archive Overclaim Correction

Use this when:

- the code is acceptable or already corrected
- the main problem is that the archive still says something too strong

Typical outputs:

- revised completion report
- revised final report
- revised quickstart acceptance table
- follow-up handoff note clarifying the final truth

### Bucket B: Implementation Gap Closure

Use this when:

- the audit found a real remaining product gap
- docs cannot honestly be corrected without code changes first

Typical outputs:

- code fix
- validation evidence
- corrected archive language after code is verified

### Bucket C: Deferred / Unverified Review

Use this when:

- the phase is review-only
- the implementation scope is too diffuse for a safe conclusion
- runtime reproduction is needed before any honest archive statement can be made

Typical outputs:

- explicit `UNVERIFIED` or `PARTIAL` archive note
- recommended deeper audit or debugging pass

---

## Priority Queue

OpenCode should work in this order unless new evidence forces reprioritization.

### Priority 1: Phase 009

**Current audit status:** `MISMATCH`

Why first:

- It is the strongest documented overclaim in the archive.
- Phase 017 exists specifically because Phase 009 overclaimed completion.

Required work:

- reconcile `specs/009-success-analysis-and-representation/spec.md`
- reconcile all Phase 009 handoff and completion artifacts
- ensure the archive no longer says “fully complete” or “no remaining gaps” if
  later gap-closure work was required

Expected result:

- archive honesty restored for Phase 009
- no remaining contradiction between Phase 009 and Phase 017

### Priority 2: Phase 016

**Current audit status:** `PARTIAL`

Why second:

- Phase 018 exists because Phase 016 completion claims were premature.
- This is another high-visibility truth mismatch in the archive.

Required work:

- reconcile Phase 016 completion language against Phase 018 reality
- ensure no archive text still implies the old unresolved state is the final
  truth

Expected result:

- no contradiction between Phase 016 archive and Phase 018 closure work

### Priority 3: Phase 004 / Phase 006 security debt

**Current audit status:** `PARTIAL`

Why third:

- These are not just wording issues; the audit found still-open security debt
  items
- they are lower archive-risk than Phase 009 and 016, but higher product-risk
  than simple doc drift

Required work:

- confirm whether M3, M5, M6 remain open
- if open, document them as active debt clearly and honestly
- if implementation is authorized later, create a separate correction pass for
  closing them

Expected result:

- no archived wording that implies these security fixes were already shipped

### Priority 4: Remaining `PARTIAL` phases

These include:

- Phase 002
- Phase 005
- Phase 007
- Phase 011

Required work:

- reconcile archive claims with current code reality
- correct overstated status wording
- capture remaining gaps precisely

### Priority 5: `UNVERIFIED` review phases

These include:

- Phase 008
- Phase 017

Required work:

- convert vague review status into explicit archive language:
  - what was reviewed
  - what was not implemented
  - what remains unverified

---

## Required OpenCode Workflow

For each selected priority phase:

1. Read the audit report section for that phase.
2. Re-open the phase spec, quickstart, tasks, and handoff files.
3. Re-trace the current implementation.
4. Decide whether the phase needs:
   - archive correction only
   - code correction first
   - deferred / unverified handling
5. Make the smallest honest correction set possible.
6. Validate the resulting claim set.
7. Write a Markdown report back to Codex.

---

## Required Report Output Per Pass

Every OpenCode pass using this program must produce a Markdown report containing:

1. **Phase Target**
2. **Why This Phase Was Chosen**
3. **Files Reviewed**
4. **Archive Claim Before**
5. **Implemented Reality**
6. **What Was Corrected Now**
7. **Validation Commands and Results**
8. **What Still Remains Open**
9. **Explicit completion statement**

The completion statement must end with one of:

- `Archive correction for Phase XXX is complete.`
- `Phase XXX remains partial because ...`
- `Phase XXX needs implementation correction before archive correction because ...`

---

## Validation Checkpoints

OpenCode should use these checkpoints before closing any pass:

1. archive language no longer overclaims relative to live code
2. if code changed, relevant validation commands were run and reported exactly
3. if no code changed, the report clearly says it was an archive-only pass
4. if a limitation remains, it is named explicitly, not softened

---

## Recommended Specialist Flow

Recommended OpenCode agent routing:

1. `agent-orchestrator`
2. `agent-reviewer`
3. `agent-docs`

Add:

- `agent-tester` if verification commands or route checks are needed
- `agent-debugging` if runtime contradictions must be reproduced
- `agent-implementer` only when the pass explicitly authorizes code fixes

---

## Packaging Recommendation

This program should be used as the stable correction policy for all audit-driven
archive reconciliation work.

Phase-specific prompts should stay short and only provide:

- the chosen target phase(s)
- whether implementation work is allowed
- the output report path
