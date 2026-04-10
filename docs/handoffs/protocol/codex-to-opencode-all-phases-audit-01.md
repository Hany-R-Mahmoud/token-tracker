# Codex To OpenCode — All Phases Implementation Audit 01

Run a repo-wide implementation-vs-docs audit across all phases so far.

Read first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-IMPLEMENTATION-VS-DOCS-AUDIT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Audit all phases so far, one by one, against the current implementation.

Do not start by fixing code.

Your job is to:

1. inspect the documented intent and archived completion claims for each phase
2. inspect the current implementation for the same behavior
3. classify each phase as `MATCH`, `PARTIAL`, `MISMATCH`, or `UNVERIFIED`
4. critique where the docs or reports overclaim or drift
5. report back to Codex in one Markdown file

Execution rules:

1. Start with `agent-orchestrator`.
2. Use:
   - `agent-reviewer`
   - `agent-tester`
   - `agent-docs`
3. Add `agent-debugging` only if runtime reproduction is needed to resolve a
   contradiction.
4. Process phases sequentially, not as one blended summary.
5. Do not convert this into an implementation pass unless a later prompt
   explicitly authorizes corrections.
6. A green build/typecheck does not override a semantic mismatch.

Required output:

Write the consolidated audit report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`

The report must include:

1. Audit Summary
2. Repo-Wide Assessment
3. Per-Phase Sections
4. Cross-Phase Drift Patterns
5. Highest-Risk Overclaims
6. Recommended Correction Queue

Completion rule:

End the report with one of:

- `Audit result: implementation matches documentation across all audited phases.`
- `Audit result: one or more phases remain partial against documentation because ...`
- `Audit result: one or more archived reports overclaim implementation because ...`

Exact execution command:

```zsh
cd "/Users/hanyramadan/token traker"
opencode run "$(cat /Users/hanyramadan/token\ traker/docs/handoffs/protocol/codex-to-opencode-all-phases-audit-01.md)"
```
