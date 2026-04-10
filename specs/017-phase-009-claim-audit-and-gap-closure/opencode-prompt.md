Implement Phase 017 using the compact handoff protocol.

Read first:

- `/Users/hanyramadan/token traker/docs/research/phase-017-phase-009-claim-audit-and-gap-closure.md`
- `/Users/hanyramadan/token traker/specs/017-phase-009-claim-audit-and-gap-closure/spec.md`
- `/Users/hanyramadan/token traker/specs/017-phase-009-claim-audit-and-gap-closure/plan.md`
- `/Users/hanyramadan/token traker/specs/017-phase-009-claim-audit-and-gap-closure/tasks.md`
- `/Users/hanyramadan/token traker/specs/017-phase-009-claim-audit-and-gap-closure/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/completion-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-009/final-completion-report.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/quickstart.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/tasks.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Reconcile the Phase 009 completion archive with the current repo truth, fixing
real code contradictions first and archive wording second.

Phase-specific rules:

1. Do not treat this as a broad redesign. This is a truth-reconciliation and
   gap-closure pass.
2. If the provider summary SQL is still malformed, fix it before editing report
   language.
3. Do not preserve overstated completion wording for the sake of historical
   pride. Be precise.
4. Do not erase the useful distinction between the original narrow success
   analysis work and the later broader visual-analytics revisit.
5. If a view is heuristic rather than directly aggregated, label or document it
   honestly.
6. Save prompt/report artifacts under `docs/handoffs/phase-017/`.

Validation:

- `npm run build`
- `npm run typecheck`
- targeted provider summary query validation
- evidence-backed acceptance checklist with `PASS`, `PARTIAL`, or `FAIL`
