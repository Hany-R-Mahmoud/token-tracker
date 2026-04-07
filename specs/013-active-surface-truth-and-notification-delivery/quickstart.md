# Quickstart: Active-Surface Truth And Notification Delivery

## Read First

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

## Validation Commands

- `npm run build`
- `npm run typecheck`
- phase-specific unit and integration tests for resolution tiers, capability
  states, registry behavior, and delivery gating
- manual validation on at least one supported platform for real active-window
  switching

## Acceptance Checklist

| Requirement | Status |
|---|---|
| Active-window truth backed by real watcher/resolver path | `PASS` - native macOS bridge now backs active/open window resolution with explicit fallback semantics |
| Latest-session fallback no longer mislabeled as active-window truth | `PASS` - tier/source wording distinguishes fallback from active-window truth in menubar and desktop surfaces |
| Capability states surfaced honestly | `PASS` - capability matrix now reflects available/degraded/unavailable states instead of simulated success |
| Codex multi-window state retained distinctly | `PARTIAL` - deterministic per-window IDs and open-window registry exist, but manual multi-window validation is still pending |
| OpenCode multi-window state retained distinctly | `PARTIAL` - deterministic per-window IDs and open-window registry exist, but manual multi-window validation is still pending |
| Weak/fallback truth does not trigger chat-specific notifications | `PASS` - delivery gating blocks latest-session fallback and weak truth tiers from chat-specific notification claims |
| Menubar distinguishes active truth vs fallback vs unavailable | `PASS` - menubar renders tier/source/reason directly from the active-surface resolver |
| Desktop surface exposes tier/source/capability details | `PASS` - overview and analytics now render an Active Surface Truth section |
| Docs match supported/degraded/unavailable reality | `PASS` - tasks and quickstart now reflect shipped behavior with manual-runtime caveats left open |

## Manual Checks

1. Switch between two open Codex windows and confirm the active-surface card and
   menubar signal change to the correct registry entry.
2. Repeat the same check with OpenCode.
3. Force degraded capability conditions and confirm the UI explicitly shows
   fallback or unavailable states instead of claiming active truth.
4. Confirm a latest-session fallback state never triggers a chat-specific
   desktop notification.
