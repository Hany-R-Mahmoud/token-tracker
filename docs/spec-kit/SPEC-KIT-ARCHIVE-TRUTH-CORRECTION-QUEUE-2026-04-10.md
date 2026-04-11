# SPEC-KIT: Archive Truth Correction Queue

**Date:** 2026-04-10  
**Audience:** OpenCode  
**Purpose:** Detailed execution queue for correcting the highest-priority archive and implementation-truth mismatches discovered in the repo-wide audit

---

## Queue Overview

This queue translates the repo-wide audit into a practical execution order.

OpenCode should execute the queue one target at a time and report back after
each target or tightly related target family.

Do not try to correct every phase in one monolithic pass.

---

## Queue Item 1: Phase 009 Claim Reconciliation

### Objective

Correct the mismatch between:

- Phase 009 completion claims
- the later existence of Phase 017 as a claim-audit and gap-closure phase
- the current implementation truth

### Why This Matters

This is the clearest archive contradiction in the repo.

If the archive says Phase 009 was fully complete and required no further gap
closure, but Phase 017 was created specifically to audit and reconcile those
claims, then the archive is misleading future readers.

### Files To Read

- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/spec.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/codex-to-opencode-prompt-01.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/opencode-to-codex-handover-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/completion-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/final-completion-report.md`
- `/Users/hanyramadan/token traker/specs/017-phase-009-claim-audit-and-gap-closure/spec.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`

### Expected Work

- identify every place where Phase 009 says “fully complete”, “no remaining
  gaps”, or equivalent
- compare that language against the reason Phase 017 exists
- rewrite the archive so the relationship between Phase 009 and Phase 017 is
  honest and navigable

### Allowed Scope

- archive correction
- report correction
- quickstart correction

### Not In Scope

- broad redesign of success-analysis features unless a real current mismatch
  forces it

### Success Condition

No remaining contradiction between the final Phase 009 archive language and the
existence/purpose of Phase 017.

---

## Queue Item 2: Phase 016 / Phase 018 Archive Reconciliation

### Objective

Make the Phase 016 archive accurately reflect that Phase 018 was required to
finish the truth gaps.

### Why This Matters

This is another high-visibility archive-trust issue:

- Phase 016 claimed completion
- Phase 018 was later required to fix period semantics, export scope, menubar
  truth, and notification visibility

### Files To Read

- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/spec.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-016/codex-to-opencode-prompt-01.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-016/completion-report.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/spec.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/completion-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-final-report.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`

### Expected Work

- remove or soften any Phase 016 claims that imply the pre-Phase-018 state was
  final
- make the archive legible:
  - what Phase 016 accomplished
  - what remained open at the time
  - what Phase 018 closed later

### Allowed Scope

- archive correction
- completion report correction
- quickstart correction

### Success Condition

No Phase 016 archive text implies a stronger final state than Phase 018 later
proved.

---

## Queue Item 3: Security Debt Truth Pass (Phases 004 and 006)

### Objective

Make the archive honest about the still-open security debt items identified in
the audit.

### Why This Matters

These are product-risk issues, not just archive-style issues.

The audit flagged M3, M5, and M6 as documented but still unimplemented. If that
is still true, the archive must not make them sound resolved.

### Files To Read

- `/Users/hanyramadan/token traker/specs/004-competitive-parity/spec.md`
- `/Users/hanyramadan/token traker/specs/006-open-gaps-and-hardening/spec.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-004/codex-to-opencode-prompt-01.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-004/opencode-to-codex-report-01.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-006/codex-to-opencode-prompt-01.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-006/opencode-to-codex-report-01.md`
- `/Users/hanyramadan/token traker/docs/security-fixes/fix-spec-*.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`

### Expected Work

- verify whether the listed security debt items remain open
- correct any archive wording that implies they were closed if they were not
- if they remain open, explicitly document them as current debt

### Allowed Scope

- archive correction
- debt-status clarification
- optionally, creation of a future implementation correction recommendation

### Not In Scope

- implementing the actual security fixes in this pass unless a later prompt
  authorizes it

### Success Condition

No archive wording implies the unresolved security items are already shipped.

---

## Queue Item 4: Secondary Partial Phases

### Targets

- Phase 002
- Phase 005
- Phase 007
- Phase 011

### Status: **COMPLETE** (Correction Pass 02)

### What was done:

- Phase 002: No correction needed — report was honest about partial status
- Phase 005: No correction needed — report was honest about partial status; web UI was later built
- Phase 007: Added reconciliation note explaining gaps were resolved by Phase 009
- Phase 011: Added reconciliation note documenting the three defects that required a correction pass

---

## Queue Item 5: Unverified Review Phases

### Targets

- Phase 008
- Phase 017

### Status: **COMPLETE** (Correction Pass 02)

### What was done:

- Phase 008: Created `archive-status-note.md` explaining UNVERIFIED classification, documenting the security review work, and pointing to the actual security status documents
- Phase 017: Created `archive-status-note.md` explaining UNVERIFIED classification, documenting the reconciliation goals, and confirming the archive corrections were completed in Correction Pass 01

---

## Output Expectations

For each queue item or grouped pass, OpenCode must produce a Markdown report to
Codex that includes:

1. target queue item(s)
2. files reviewed
3. archive claim before
4. current implemented reality
5. corrections made now
6. validation notes
7. remaining limitations
8. explicit completion statement
