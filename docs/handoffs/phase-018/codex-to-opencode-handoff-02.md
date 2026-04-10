# Phase 018 — Codex To OpenCode Handoff 02

Implement the Phase 018 correction pass using the compact handoff protocol.

Read first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-PHASE-018-OPENCODE-HANDOFF-2026-04-09.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-PHASE-018-HANDOFF-REVIEW-2026-04-09.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-PHASE-018-GAP-CLOSURE-2026-04-09.md`
- `/Users/hanyramadan/token traker/docs/research/phase-018-phase-016-gap-audit-and-closure.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/spec.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/plan.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/tasks.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-018/completion-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`

Mission:

Do not accept the current Phase 018 handoff as complete.

Fix the remaining truth mismatches, validate them with exact evidence, and then
rewrite the Phase 018 handoff artifacts so they stop overclaiming.

Must-fix areas:

1. truthful rolling `1h`
2. Overview period parity
3. Menubar recent-session scope parity
4. truthful tray semantics and labeling
5. rendered notification-state UI
6. export scope preservation
7. honest final reporting

Execution rules:

1. Start with `agent-orchestrator`.
2. Include:
   - `agent-implementer`
   - `agent-reviewer`
   - `agent-tester`
   - `agent-docs`
3. Add `agent-debugging` if the period refactor or native shell paths expose
   conflicting runtime behavior.
4. Do not ship label-only changes.
5. Do not mark any requirement `PASS` without exact validation evidence.

Required output:

1. files changed
2. exact validation commands and results
3. which spec-kit findings were fixed
4. what remains partial, if anything
5. updated handoff files:
   - `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-report-02.md`
   - `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-final-report.md`

Exact execution command:

```zsh
cd "/Users/hanyramadan/token traker"
opencode run "$(cat docs/handoffs/phase-018/codex-to-opencode-handoff-02.md)"
```
