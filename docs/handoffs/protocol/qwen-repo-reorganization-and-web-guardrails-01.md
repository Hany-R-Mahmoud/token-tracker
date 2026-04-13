# Qwen Code — Repo Reorganization And Web Guardrails 01

Run a bounded repo reorganization pass with strong React and Next.js
future-proofing guardrails.

Read first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-REPO-REORGANIZATION-AND-WEB-GUARDRAILS-2026-04-13.md`
- `/Users/hanyramadan/token traker/AGENTS.md`
- `/Users/hanyramadan/token traker/package.json`
- `/Users/hanyramadan/token traker/apps/web/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/packages/core/src/index.ts`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`

Mission:

Reorganize the repo so source ownership is clearer, especially in `apps/web`
and `apps/desktop`, without changing the product behavior or turning this into
a Next.js migration.

Rules:

1. Start with `agent-orchestrator`.
2. Use `agent-architect` to sanity-check boundaries before moving files.
3. Use `agent-implementer` for the actual moves and import fixes.
4. Bring in `agent-debugging`, `agent-security`, `agent-tester`,
   `agent-reviewer`, and `agent-docs` only when their slice is needed.
5. Keep `packages/core` mostly stable unless a move is obviously beneficial.
6. Do not broaden this into UI redesign, feature work, or framework migration.
7. Treat the Next.js guidance as future-proofing constraints, not as permission
   to introduce App Router files now.
8. Run validation after each major subtree move.
9. Do not claim completion if build or typecheck regresses.

Required output:

Write a Markdown report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-REPO-REORGANIZATION-REPORT-2026-04-13.md`

The report must include:

1. Summary
2. Baseline Status
3. Files Moved And New Structure
4. Architecture Decisions
5. Validation Commands And Results
6. What Stayed Intentionally Unchanged
7. Remaining Debt Or Follow-Ups
8. Explicit completion statement

Completion rule:

End with one of:

- `Repo reorganization pass is complete.`
- `Repo reorganization pass remains partial because ...`
