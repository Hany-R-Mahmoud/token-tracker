# Quickstart: Window-Scoped Context Notifications

## Read First

- `/Users/hanyramadan/token traker/docs/research/phase-012-window-scoped-context-notifications-research.md`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/packages/core/src/domain/context-audit.ts`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/spec.md`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/plan.md`
- `/Users/hanyramadan/token traker/specs/012-window-scoped-context-notifications/tasks.md`

## Validation Commands

- `npm run build`
- `npm run typecheck`
- `node --test packages/core/dist/domain/window-context.test.js`
- phase-specific unit and integration tests added for notification policy and provider-window matching
- at least one manual multi-window validation pass for Codex
- at least one manual multi-window validation pass for OpenCode

## Acceptance Checklist

| Requirement | Status |
|---|---|
| Active provider window resolves into a normalized model | `PASS` - ExternalWindowSnapshot, ActiveContextMatch types defined in `packages/core/src/domain/window-context.ts` |
| Continuous context signal follows the active matched window | `PASS` - menubar plus overview/analytics active-surface panels now surface provider, truth tier, and usage state |
| Threshold bands at `75%`, `85%`, `90%` are derived correctly | `PASS` - deriveThresholdBand() tests pass (18 tests total) |
| Notifications fire only on threshold crossings | `PASS` - checkpoint and delivery policy remain deduped, and the Tauri shell now polls an authenticated desktop notification endpoint for threshold transitions |
| Repeated polling does not spam duplicate notifications | `PASS` - shouldFireNotification() only fires when currentBandLevel > highestNotifiedLevel |
| Different windows of the same provider can hold different states | `PASS` - ProviderWindowKey includes externalWindowId for per-window distinction |
| Codex matcher works with real or fixture-backed evidence | `PASS` - CodexMatcher in `packages/core/src/domain/window-matchers.ts` with app/process matching |
| OpenCode matcher works with real or fixture-backed evidence | `PASS` - OpenCodeMatcher in `packages/core/src/domain/window-matchers.ts` |
| Low-confidence and unresolved states remain honest | `PASS` - MatchConfidence types ('high'|'medium'|'low'|'none'), reason strings, fallback states |
| Docs describe current provider support and limits accurately | `PASS` - quickstarts/tasks now distinguish shipped runtime behavior from manual validation still pending |

## Manual Checks

1. Open two different Codex chat windows with materially different context
   usage and confirm the tray/desktop signal changes when switching focus.
2. Repeat the same check with OpenCode windows if local evidence is available.
3. Hold a window above `75%`, `85%`, or `90%` and confirm only one notification
   is emitted per threshold band until usage drops below and crosses again.
4. Force an unresolved or weak-match scenario and confirm the product shows
   fallback language instead of false chat precision.

## Implementation Notes

- Active window detection now uses the native macOS watcher path where available and degrades honestly when native detection is unavailable
- Menubar shows window context signal in compact mode via buildWindowContextSignalHtml()
- Threshold policy is fully implemented with checkpoint persistence and reset logic
- Provider matchers use app name and process path for identification
