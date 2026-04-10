# Codex To OpenCode — Archive Truth Correction 01

Execute the archive truth correction program using the audit results already in
the repo.

Read first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ARCHIVE-TRUTH-CORRECTION-PROGRAM-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ARCHIVE-TRUTH-CORRECTION-QUEUE-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-IMPLEMENTATION-VS-DOCS-AUDIT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Start the archive truth correction queue.

Do not try to fix every phase in one pass.

Handle the highest-priority targets first:

1. Queue Item 1: Phase 009 claim reconciliation
2. Queue Item 2: Phase 016 / Phase 018 archive reconciliation
3. Queue Item 3: Security debt truth pass for Phases 004 and 006

Execution rules:

1. Start with `agent-orchestrator`.
2. Use:
   - `agent-reviewer`
   - `agent-docs`
3. Add `agent-tester` if validation commands or route checks are needed.
4. Add `agent-debugging` only if runtime contradictions block honest archive
   correction.
5. Do not do broad implementation work unless a target explicitly requires code
   correction before archive correction and you call that out clearly.
6. Keep changes aligned with the current implementation and repo vocabulary.
7. Do not soften remaining debt or limitations.

Required output:

Write a Markdown report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-ARCHIVE-TRUTH-CORRECTION-REPORT-01-2026-04-10.md`

The report must include:

1. Queue items handled
2. Files reviewed
3. Archive claim before
4. Implemented reality
5. Corrections made now
6. Validation commands and results
7. What remains open
8. Explicit completion statement per queue item

Completion rule:

End the report with one of:

- `Correction pass 01 is complete.`
- `Correction pass 01 remains partial because ...`

Exact execution command:

```zsh
cd "/Users/hanyramadan/token traker"
opencode run "$(cat /Users/hanyramadan/token\ traker/docs/handoffs/protocol/codex-to-opencode-archive-truth-correction-01.md)"
```
