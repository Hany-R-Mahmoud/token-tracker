Implement Phase 013 using the repo's existing spec/handoff conventions.

Read first:

- `/Users/hanyramadan/token traker/docs/research/phase-013-active-surface-truth-and-notification-delivery.md`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/spec.md`
- `/Users/hanyramadan/token traker/packages/core/src/domain/window-context.ts`
- `/Users/hanyramadan/token traker/packages/core/src/domain/window-matchers.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/specs/013-active-surface-truth-and-notification-delivery/spec.md`
- `/Users/hanyramadan/token traker/specs/013-active-surface-truth-and-notification-delivery/plan.md`
- `/Users/hanyramadan/token traker/specs/013-active-surface-truth-and-notification-delivery/tasks.md`
- `/Users/hanyramadan/token traker/specs/013-active-surface-truth-and-notification-delivery/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Implement Phase 013 by replacing the current latest-session approximation with a
truthful active-surface system for Codex and OpenCode, including native watcher
integration where validated, multi-window registry state, truthful fallback
semantics, and delivery gating for threshold notifications.

Phase-specific rules:

1. Start with `agent-pilot`, then use `agent-orchestrator` and
   `agent-architect` before heavy implementation.
2. Do not call latest-session fallback "active window" anywhere in product copy
   or internal acceptance reporting.
3. Codex and OpenCode are the required validated targets in this phase.
4. Claude and Cursor may remain partial/unavailable unless you validate a real
   active-surface path during implementation.
5. Build capability states explicitly: available, degraded, unavailable.
6. Build truth tiers explicitly and gate notifications by those tiers.
7. Preserve per-window state in a registry; do not collapse back to one global
   provider state.
8. Prefer an `x-win`-style native watcher path for Codex/OpenCode first if it
   validates cleanly.
9. If browser URL enrichment is not broadly implementable, keep it optional and
   capability-gated.
10. Define an extension/native-messaging-ready contract for browser-hosted
    providers instead of multiplying title heuristics.
11. If platform support is partial, surface that honestly in the UI and report.
12. Use the compact protocol files above instead of repeating generic
    boilerplate.

Implementation targets:

- native active-window/open-window watcher path
- shared capability/tier/resolution models
- window registry and active-surface spans
- Codex/OpenCode correlation against local session activity
- menubar truthful fallback and active-state rendering
- desktop surface tier/source/capability diagnostics
- delivery gating for threshold notifications
- tests and docs required by the spec

Validation:

- `npm run build`
- `npm run typecheck`
- phase-specific tests for tiers, capability states, registry behavior, and
  delivery gating
- prove latest-session fallback is no longer mislabeled as active-window truth
- prove weak/fallback tiers do not emit chat-specific notifications
- prove Codex and OpenCode keep distinct multi-window state
- include manual validation notes for active-window switching on at least one
  supported platform

Report back using the shared reporting baseline and include the Phase 013
acceptance checklist with PASS / FAIL / PARTIAL.
