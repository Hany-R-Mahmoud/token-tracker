# SPEC-KIT: All Phases Implementation Audit

**Date:** 2026-04-10  
**Audience:** Codex and OpenCode  
**Purpose:** Run a repo-wide audit of implemented behavior against phase docs, specs, handoffs, quickstarts, and completion claims  

---

## Goal Summary

Audit all completed or archived phases so far, one by one, and determine for
each phase:

1. what the docs/specs/handoffs say was supposed to be done
2. what the code actually does now
3. whether the current archive overclaims, matches, or undersells the truth
4. what needs correction, if anything

This is an audit-and-critique workflow, not a broad implementation pass.

---

## Constraints And Assumptions

### Constraints

- OpenCode must process phases sequentially, not as one blended review.
- Each phase must have its own audit section in the final report.
- If a phase has multiple handoff artifacts, OpenCode must reconcile them
  instead of picking only the newest one.
- Passing `typecheck` or `build` does not override semantic mismatches.
- OpenCode should not start fixing code unless a later prompt explicitly
  authorizes a correction pass for a phase.

### Assumptions

- Not every phase has a perfect archive.
- Some phases may have multiple revisit specs or gap-closure phases.
- The audit should treat the live codebase as source of truth for implemented
  behavior, and the docs/handoffs as source of truth for claimed intent.

---

## Audit Method

For each phase:

1. Read the phase spec and adjacent quickstart/tasks if present.
2. Read the handoff prompt(s) and OpenCode report(s) if present.
3. Trace the current code paths for the affected behavior.
4. Classify the phase as:
   - `MATCH`
   - `PARTIAL`
   - `MISMATCH`
   - `UNVERIFIED`
5. Write critique with evidence.

---

## Phase Queue

OpenCode should audit these phases in order:

### Phase 001

- `specs/001-local-mvp/spec.md`
- `docs/handoffs/phase-001/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-001/opencode-to-codex-final-report.md`

### Phase 002

- `specs/002-productization/spec.md`
- `docs/handoffs/phase-002/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-002/opencode-to-codex-report-01.md`

### Phase 003

- `specs/003-monitoring-and-glanceable-ux/spec.md`
- `docs/handoffs/phase-003/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-003/opencode-to-codex-report-01.md`

### Phase 004 family

- `specs/004-competitive-parity/spec.md`
- `specs/004-ui-refinement/spec.md`
- `specs/004a-phase-003-repair-and-live-monitoring/spec.md`
- `specs/004b-analytics-sharing-and-theme-parity/spec.md`
- `specs/004c-ambient-surfaces-and-platform-parity/spec.md`
- `specs/004d-provider-expansion-and-status-layer/spec.md`
- `docs/handoffs/phase-004/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-004/opencode-to-codex-report-01.md`

### Phase 005 family

- `specs/005-team-leaderboard/spec.md`
- `specs/005-ui-polish/spec.md`
- `specs/005a-team-leaderboard-foundation/spec.md`
- `specs/005b-team-leaderboard-computation-and-api/spec.md`
- `specs/005c-team-leaderboard-ui-and-settings/spec.md`
- `specs/005d-team-leaderboard-hardening-and-rollout/spec.md`
- `docs/handoffs/phase-005/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-005/opencode-to-codex-report-01.md`

### Phase 006 family

- `specs/006-open-gaps-and-hardening/spec.md`
- `specs/006a-screenshot-export-and-capture/spec.md`
- `specs/006b-production-oauth-and-session-hardening/spec.md`
- `specs/006c-leaderboard-member-detail-drawer/spec.md`
- `specs/006d-true-meters-and-quota-sources/spec.md`
- `specs/006e-provider-validation-and-support-closure/spec.md`
- `specs/006f-native-widget-feasibility-and-shell/spec.md`
- `docs/handoffs/phase-006/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-006/opencode-to-codex-report-01.md`

### Phase 007

- `specs/007-rich-menubar-insights-and-command-center/spec.md`
- `docs/handoffs/phase-007/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-007/opencode-to-codex-report-01.md`

### Phase 008

- `specs/008-visual-system-and-brand-refresh/spec.md`
- `docs/handoffs/phase-008/codex-to-opencode-prompt-01.md`

### Phase 009

- `specs/009-success-analysis-and-representation/spec.md`
- `docs/handoffs/phase-009/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-009/opencode-to-codex-handover-report.md`
- `docs/handoffs/phase-009/completion-report.md`
- `docs/handoffs/phase-009/final-completion-report.md`
- `specs/017-phase-009-claim-audit-and-gap-closure/spec.md`

### Phase 010

- `specs/010-session-context-audit-and-compact-handoffs/spec.md`
- `docs/handoffs/phase-010/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-010/completion-report.md`
- `docs/handoffs/phase-010/opencode-to-codex-final-report.md`

### Phase 011

- `specs/011-claude-provider-local-ingestion/spec.md`
- `docs/handoffs/phase-011/codex-to-opencode-correction-01.md`
- `docs/handoffs/phase-011/opencode-to-codex-final-report.md`

### Phase 012

- `specs/012-window-scoped-context-notifications/spec.md`

### Phase 013 family

- `specs/013-active-surface-truth-and-notification-delivery/spec.md`
- `specs/013b-native-macos-window-watcher-integration/spec.md`

### Phase 014 family

- `specs/014-runtime-data-and-observability/spec.md`
- `specs/014b-surface-route-contract-and-empty-state-truth/spec.md`
- `specs/014c-native-menubar-shell-parity/spec.md`

### Phase 015 family

- `specs/015-packaged-runtime-ownership-and-port-isolation/spec.md`
- `specs/015b-installed-shell-runtime-handshake-and-failure-truth/spec.md`

### Phase 016

- `specs/016-operator-time-windows-and-analytics-clarity/spec.md`
- `docs/handoffs/phase-016/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-016/completion-report.md`
- `specs/018-phase-016-gap-audit-and-closure/spec.md`

### Phase 017

- `specs/017-phase-009-claim-audit-and-gap-closure/spec.md`
- `docs/handoffs/phase-017/codex-to-opencode-prompt-01.md`

### Phase 018

- `specs/018-phase-016-gap-audit-and-closure/spec.md`
- `docs/handoffs/phase-018/codex-to-opencode-prompt-01.md`
- `docs/handoffs/phase-018/codex-to-opencode-correction-01.md`
- `docs/handoffs/phase-018/codex-to-opencode-handoff-02.md`
- `docs/handoffs/phase-018/codex-to-opencode-followup-03.md`
- `docs/handoffs/phase-018/completion-report.md`
- `docs/handoffs/phase-018/opencode-to-codex-report-02.md`
- `docs/handoffs/phase-018/opencode-to-codex-report-03.md`
- `docs/handoffs/phase-018/opencode-to-codex-final-report.md`

---

## Required Report Shape

OpenCode must write one consolidated Markdown report with:

1. **Audit Summary**
2. **Repo-Wide Assessment**
3. **Per-Phase Sections**
4. **Cross-Phase Drift Patterns**
5. **Highest-Risk Overclaims**
6. **Recommended Correction Queue**

For each phase section, include:

1. phase identifier
2. files reviewed
3. documented expectation summary
4. implemented reality summary
5. findings with severity and evidence
6. phase assessment:
   - `MATCH`
   - `PARTIAL`
   - `MISMATCH`
   - `UNVERIFIED`
7. recommended next step

---

## Cross-Phase Critique Requirements

OpenCode should also identify repeated patterns across phases, such as:

- reports that overclaim semantic completion
- quickstarts that drift from live behavior
- surfaces whose labels diverge from their data sources
- green builds being used to mask product-truth mismatches
- follow-up specs that fixed reality but did not update archive honesty

---

## Validation Checkpoints

OpenCode should decide whether to run global validation commands based on audit
needs, but if it does, it should prefer:

1. `npm run typecheck`
2. `npm run build`

These commands are supporting evidence only and must not override semantic
findings.

---

## Recommended Next Agent

Recommended OpenCode flow:

1. `agent-orchestrator`
2. `agent-reviewer`
3. `agent-tester`
4. `agent-docs`

Add `agent-debugging` only if runtime reproduction is needed for specific phase
contradictions.

---

## Output Path

OpenCode should write the consolidated report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`
