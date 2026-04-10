# SPEC-KIT: Implementation vs Docs Audit

**Date:** 2026-04-10  
**Audience:** Codex and OpenCode  
**Purpose:** Reusable audit spec for checking implemented behavior against docs, specs, quickstarts, handoffs, and completion claims  

---

## Goal Summary

This spec-kit defines a different OpenCode role from implementation delivery.

OpenCode should act as an audit and critique executor:

- inspect what the code actually does
- inspect what the docs/specs/reports say was supposed to be done
- compare them systematically
- identify matches, partials, contradictions, and overclaims
- report back to Codex in a Markdown file with evidence and severity

This is an execution audit workflow, not a feature-building workflow.

---

## Constraints And Assumptions

### Constraints

- The audit must be source-grounded in the local repo.
- The audit must distinguish clearly between:
  - implemented behavior
  - documented intent
  - claimed completion
- OpenCode must not silently convert the audit into implementation work unless
  the prompt explicitly authorizes a fix pass.
- The report must prefer evidence over opinion.
- If validation commands are run, their exact commands and results must be
  included.

### Assumptions

- Relevant source docs exist in one or more of:
  - `specs/...`
  - `docs/research/...`
  - `docs/handoffs/...`
  - `quickstart.md`
  - `tasks.md`
  - `completion-report.md`
  - `opencode-to-codex-final-report.md`
- The repo may be in a dirty worktree, so audit conclusions must be tied to the
  current checked-out code, not only archived reports.

---

## Audit Scope

OpenCode should audit all of the following dimensions when they are relevant to
the target:

1. **Spec alignment**
   - Does the implementation satisfy the functional requirements?
   - Are any non-goals violated?

2. **Surface truth**
   - Do labels, copy, and UI state match the actual data source and scope?
   - Are there any surfaces that look complete but are fed partial or wrong
     data?

3. **Report honesty**
   - Do completion reports overclaim?
   - Are `PASS` statements backed by code and evidence?

4. **Validation integrity**
   - Are reported build/typecheck/test claims plausible and relevant?
   - Do they hide known runtime or semantic contradictions?

5. **Documentation drift**
   - Do quickstarts, final reports, and specs still describe reality?
   - Are there contradictions between archived handoffs and live code?

---

## Ordered Execution Plan

### Step 1: Load the target context

Read:

- the primary target docs/specs/reports
- the core implementation files for the affected surfaces
- any prior critique or follow-up artifacts that define expected behavior

Output from this step:

- list of files reviewed
- short statement of intended behavior according to docs

### Step 2: Extract documented expectations

Build a compact expectation set from the docs:

- required behavior
- claimed completed behavior
- validation promises
- scope and truth requirements

Do not paraphrase loosely if the exact meaning matters.

Output from this step:

- normalized list of expectations to audit

### Step 3: Inspect implemented behavior

Trace the current code paths that drive the target surfaces.

Focus on:

- actual data sources
- parameter handling
- scope propagation
- fallback behavior
- wording and labels shown to users

Output from this step:

- implementation notes with file/line evidence

### Step 4: Compare docs vs implementation

For each expectation, classify:

- `MATCH`
- `PARTIAL`
- `MISMATCH`
- `UNVERIFIED`

Every non-match must include:

- why it is non-matching
- which file(s) prove it
- how risky the mismatch is

### Step 5: Critique and assess

Produce an explicit critique, not just a status table.

The critique should answer:

- what is actually correct
- what is overstated
- what is missing
- what is dangerous because it looks right but is wrong underneath

### Step 6: Recommend next action

End with a concrete routing decision:

- `accept as complete`
- `accept as partial`
- `needs correction pass`
- `needs deeper debugging before any report rewrite`

If a correction pass is needed, include the minimum fix scope and recommended
next agent mix.

---

## Required Report Output

OpenCode must return a Markdown file to Codex containing:

1. **Audit Summary**
2. **Files Reviewed**
3. **Documented Expectations**
4. **Implemented Reality**
5. **Findings**
6. **Validation Notes**
7. **Assessment**
8. **Recommended Next Step**

---

## Findings Format

Each finding should include:

- title
- severity: `Critical`, `Major`, `Minor`
- category: one of
  - `Spec Alignment`
  - `Surface Truth`
  - `Report Honesty`
  - `Validation Integrity`
  - `Documentation Drift`
- documented expectation
- implemented reality
- evidence with file references
- critique
- recommended action

---

## Severity Rules

### Critical

Use when:

- the product claims something true that the code materially contradicts
- a surface label/value pair is misleading
- a report says complete but core requirements are still unmet

### Major

Use when:

- behavior is partially implemented but reported as done
- one important surface or workflow still drifts from documented intent
- validation exists but does not prove the right thing

### Minor

Use when:

- docs are stale but not misleading in a dangerous way
- wording is imprecise but not materially false
- evidence is thin but the code likely aligns

---

## Validation Checkpoints

If OpenCode runs commands, it should prefer:

1. `npm run typecheck`
2. `npm run build`
3. any targeted route/runtime checks needed to confirm the audited claim

But:

- passing typecheck/build does not override semantic mismatches
- semantic truth always wins over green build output

---

## Recommended Next Agent

For this audit workflow, the recommended OpenCode specialist flow is:

1. `agent-orchestrator`
2. `agent-reviewer`
3. `agent-tester`
4. `agent-docs`

Add:

- `agent-debugging` if the mismatch depends on runtime behavior or conflicting
  code paths
- `agent-implementer` only if the prompt explicitly authorizes a correction pass

---

## Packaging Recommendation

This should live as a reusable public audit pattern, not a one-off phase note.

Recommendation:

- keep this as a shared spec-kit audit spec
- pair it with a reusable Codex-to-OpenCode prompt template
- use phase-specific prompts only to supply:
  - target file list
  - audit scope
  - report output filename
