Implement Phase 016 using the compact handoff protocol.

Read first:

- `/Users/hanyramadan/token traker/docs/research/phase-016-operator-time-windows-and-analytics-clarity.md`
- `/Users/hanyramadan/token traker/docs/research/phase-009-visual-analytics-revisit.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-UI-AUDIT-2026-04-08.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/spec.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/plan.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/tasks.md`
- `/Users/hanyramadan/token traker/specs/016-operator-time-windows-and-analytics-clarity/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Implement Phase 016 end to end without regressing product truth.

Phase-specific rules:

1. Do not treat timeframe chips as a styling task. This phase requires a real
   shared period contract across overview, analytics, export, and menubar/tray
   behavior.
2. Replace synthetic observability wording with truthful product analytics
   wording. Do not leave fake `TPS`, `GB/s`, `network load`, or `P99 latency`
   semantics in place unless the product truly measures them.
3. Keep the visual quality high, but make every major chart answer one clear
   question and provide a visible takeaway.
4. If native desktop notification delivery is gated, downgraded, or suppressed,
   expose that state somewhere visible in the product rather than letting it
   disappear silently.
5. Tray and menubar spend must help with daily monitoring. If you keep all-time
   totals, label them explicitly as all-time.
6. Preserve active-surface truth semantics from earlier phases. This phase is
   about clarity and discoverability, not loosening truth tiers.
7. Save Phase 016 prompt/report artifacts in `docs/handoffs/phase-016/`.

Implementation target:

- shared `1h / 1d / 7d / 1m / all` period model
- overview and analytics period parity
- export period parity
- tray/menubar scoped spend behavior and labeling
- visible notification state for context threshold delivery or suppression
- clearer, more informative overview and analytics comparisons
- truthful metric naming and chart explanation improvements

Validation:

- `npm run build`
- `npm run typecheck`
- targeted tests for any new period/query logic
- manual verification of all five periods
- manual verification of tray/menubar scope labeling
- manual verification of notification visibility behavior

Report back using the shared reporting baseline and include the Phase 016
acceptance checklist with `PASS`, `PARTIAL`, or `FAIL` plus evidence for every
row.
