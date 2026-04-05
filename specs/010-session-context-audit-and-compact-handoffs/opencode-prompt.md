Implement Phase 010 using the compact handoff protocol.

Read first:

- `/Users/hanyramadan/token traker/docs/research/phase-010-session-context-and-prompt-efficiency.md`
- `/Users/hanyramadan/token traker/specs/010-session-context-audit-and-compact-handoffs/spec.md`
- `/Users/hanyramadan/token traker/specs/010-session-context-audit-and-compact-handoffs/plan.md`
- `/Users/hanyramadan/token traker/specs/010-session-context-audit-and-compact-handoffs/tasks.md`
- `/Users/hanyramadan/token traker/specs/010-session-context-audit-and-compact-handoffs/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Implement Phase 010 end to end without making the product feel odd relative to
the current repo structure.

Phase-specific rules:

1. The primary product addition is a **session context audit** layer, not a
   generic dashboard redesign.
2. Borrow the useful ideas from OpenCode's context review surface, but do not
   clone OpenCode's terminal/debug aesthetic.
3. Connect context pressure to Phase 009 success truth wherever it materially
   helps explain value vs waste.
4. Keep raw evidence local-only and privacy-safe.
5. Keep overview, analytics, menubar, and CLI aligned with the existing product
   architecture.
6. Use the compact protocol files above instead of repeating generic execution
   and reporting boilerplate in new handoffs or correction prompts created while
   working on this phase.
7. Save the Phase 010 prompt/report artifacts in the handoff archive using the
   repo naming convention.

Implementation target:

- shared context-audit model
- session detail facts + stacked context breakdown + pressure warnings +
  lineage/evidence section
- overview context-health summary
- analytics context composition and pressure views
- menubar compact context-health cue
- CLI context-aware session detail output
- handoff compaction adoption for this phase

Validation:

- `npm run build`
- `npm run typecheck`
- added model/surface tests where appropriate
- prove no shared surface leaks raw prompts or private local evidence

Report back using the shared reporting baseline and include the Phase 010
acceptance checklist with PASS / FAIL / PARTIAL.
