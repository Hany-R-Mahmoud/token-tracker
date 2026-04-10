# Phase 018 — Codex To OpenCode Correction 01

Implement a correction pass for Phase 018 using the compact handoff protocol.

Read first:

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

Do not trust the current Phase 018 completion report.

Fix the remaining truth mismatches first, then rewrite the report so it only
claims what is actually verified.

Priority corrections:

1. make `1h` a true rolling hour across summary, analytics, and session-list
   paths
2. make Overview period-aware in data, not only in chip state
3. make Menubar recent sessions match the displayed spend scope
4. make Tray behavior truthful and explicitly scoped or explicitly all-time
5. replace the bell-link-only notification approach with visible rendered UI
6. preserve selected period in export actions
7. update the Phase 018 archive report only after validation passes

Execution rules:

1. Start with `agent-orchestrator`.
2. Use the minimum specialist set needed, but include:
   - `agent-implementer`
   - `agent-reviewer`
   - `agent-tester`
   - `agent-docs`
3. Use `agent-debugging` if the period/read-path refactor exposes contradictory
   runtime behavior.
4. Do not accept label-only fixes. Scope labels must match scope values.
5. Do not mark a requirement `PASS` without exact validation evidence.
6. Preserve repo conventions and avoid unrelated redesign work.

Required output:

1. Files changed
2. Exact validation commands and results
3. Which findings from the spec-kit review were fixed
4. What remains partial, if anything
5. Updated handoff artifacts:
   - `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-report-02.md`
   - `/Users/hanyramadan/token traker/docs/handoffs/phase-018/opencode-to-codex-final-report.md`

Exact execution command:

```zsh
cd "/Users/hanyramadan/token traker"
opencode run "$(cat docs/handoffs/phase-018/codex-to-opencode-correction-01.md)"
```
