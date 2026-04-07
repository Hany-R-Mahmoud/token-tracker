Implement Phase 012 using the repo's existing spec/handoff conventions.

Read first:

- `/Users/hanyramadan/token traker/docs/research/phase-012-window-scoped-context-notifications-research.md`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/packages/core/src/domain/context-audit.ts`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/spec.md`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/plan.md`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/tasks.md`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Implement Phase 012 end to end by adding a live, window-scoped context signal
to Token Tracker's menubar/desktop shell and firing threshold notifications at
`75%`, `85%`, and `90%` for the currently matched active provider window.

Phase-specific rules:

1. Start with `agent-pilot`, then use `agent-orchestrator` and
   `agent-architect` before heavy implementation.
2. The architecture must be window-scoped, not just provider-scoped.
3. Codex and OpenCode are the required real matchers in this phase.
4. Claude and Cursor should get matcher contracts/stubs only unless you validate
   real local evidence during implementation.
5. Native notifications are for threshold crossings only. Do not spam repeated
   alerts on every polling tick.
6. Keep a continuous ambient signal visible in tray/menubar and desktop
   surfaces even when no new notification is fired.
7. Keep active-window detection behind a service boundary and make confidence
   explicit.
8. Do not leak raw prompt or transcript text into notifications or stored
   window-matching state.
9. If per-chat matching confidence is weak, fall back honestly instead of
   pretending certainty.
10. Use the compact protocol files above instead of repeating generic
    execution/reporting boilerplate.

Implementation targets:

- desktop/Tauri active-window resolver and wiring
- provider-window matcher contracts
- Codex and OpenCode matchers
- threshold policy, dedupe, and checkpoint logic
- tray/menubar active-window context signal
- desktop active-window status surface
- native notification delivery
- tests and docs required by the spec

Validation:

- `npm run build`
- `npm run typecheck`
- phase-specific tests for threshold policy and provider-window matching
- prove that repeated polling above the same threshold does not create duplicate
  notifications
- prove that switching between different windows changes the displayed signal
- prove that unresolved matches are represented honestly
- include manual validation notes for multi-window Codex and OpenCode scenarios

Report back using the shared reporting baseline and include the Phase 012
acceptance checklist with PASS / FAIL / PARTIAL.
