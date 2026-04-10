# Codex To OpenCode: Implementation vs Docs Audit Template

Use this template when OpenCode should audit implemented behavior against the
docs/specs/reports and return a critique report to Codex.

Read first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-IMPLEMENTATION-VS-DOCS-AUDIT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Target audit files:

- `[PRIMARY_SPEC_OR_REPORT]`
- `[PRIMARY_QUICKSTART_OR_TASKS]`
- `[PRIMARY_IMPLEMENTATION_FILES...]`
- `[PRIOR_HANDOFFS_OR_RESEARCH...]`

Mission:

Audit the implementation against the docs and completion claims.

Do not start by fixing code.

First determine:

1. what the docs/specs/reports say should be true
2. what the code actually does now
3. where they match, partially match, or contradict
4. whether the current completion/report language is honest

Execution rules:

1. Start with `agent-orchestrator`.
2. Use:
   - `agent-reviewer`
   - `agent-tester`
   - `agent-docs`
3. Add `agent-debugging` only if runtime behavior must be reproduced to resolve
   a contradiction.
4. Do not convert this into an implementation pass unless the prompt explicitly
   authorizes fixes.
5. Prefer evidence-backed critique over broad summary statements.
6. A green build/typecheck does not override a semantic mismatch.

Required output:

Write a Markdown report for Codex at:

- `[OUTPUT_REPORT_PATH]`

The report must include:

1. Audit Summary
2. Files Reviewed
3. Documented Expectations
4. Implemented Reality
5. Findings with severity and evidence
6. Validation Notes
7. Assessment
8. Recommended Next Step

Completion rule:

End with one of:

- `Audit result: implementation matches documentation.`
- `Audit result: implementation remains partial against documentation because ...`
- `Audit result: documentation/reporting overclaims implementation because ...`

Exact execution command pattern:

```zsh
cd "/Users/hanyramadan/token traker"
opencode run "$(cat [PROMPT_PATH])"
```
