Implement Phase 018 using the compact handoff protocol.

Read first:

- `/Users/hanyramadan/token traker/docs/research/phase-018-phase-016-gap-audit-and-closure.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/spec.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/plan.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/tasks.md`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-016/completion-report.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Close the remaining implementation and reporting gaps left after Phase 016 so
the repo can truthfully claim period parity, scoped operator spend, and visible
notification state.

Phase-specific rules:

1. Fix data truth before surface copy. If the value is wrong, do not just
   relabel it.
2. Treat `1h` as a real rolling hour, not a same-day or 24-hour approximation.
3. Export parity is in scope and should not be left on the old `days` contract.
4. Notification state is not done unless it is visible inside the app, not just
   in JSON.
5. If some items still remain partial after this pass, downgrade the archive and
   quickstart claims instead of overclaiming completion.
6. Save all prompt/report artifacts under `docs/handoffs/phase-018/`.

Validation:

- `npm run build`
- `npm run typecheck`
- targeted checks for `1h`, export parity, tray/menubar scope truth, and
  notification visibility
- final acceptance checklist with `PASS`, `PARTIAL`, or `FAIL` plus evidence
