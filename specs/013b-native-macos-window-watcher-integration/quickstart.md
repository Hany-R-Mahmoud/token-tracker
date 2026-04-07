# Quickstart: Native macOS Window Watcher Integration

## Read First

- `/Users/hanyramadan/token traker/specs/013-active-surface-truth-and-notification-delivery/spec.md`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/apps/desktop/src/active-surface-resolver.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/specs/013b-native-macos-window-watcher-integration/spec.md`
- `/Users/hanyramadan/token traker/specs/013b-native-macos-window-watcher-integration/plan.md`
- `/Users/hanyramadan/token traker/specs/013b-native-macos-window-watcher-integration/tasks.md`

## Validation Commands

- `npm run build`
- `npm run typecheck`
- relevant domain and bridge tests
- manual macOS validation with real Codex/OpenCode windows if available

## Acceptance Checklist

| Requirement | Status |
|---|---|
| Tauri commands return real macOS-backed window data | `PASS` - active and open window commands now execute AppleScript-backed macOS queries instead of simulated payloads |
| Simulated bridge path removed or clearly retained only as fallback/test mode | `PASS` - runtime bridge paths are native-first and only fall back explicitly when native data is unavailable |
| Capability states reflect real runtime support | `PASS` - the bridge reports degraded/unavailable states instead of always claiming native success |
| Resolver prefers watcher data over latest-session fallback | `PASS` - desktop runtime and Tauri resolver both prefer native watcher output before latest-session fallback |
| Codex active window validates on macOS | `PENDING` - manual runtime validation still needed on a machine with live Codex windows |
| OpenCode active window validates on macOS | `PENDING` - manual runtime validation still needed on a machine with live OpenCode windows |
| Multi-window distinction works for at least one provider | `PARTIAL` - deterministic per-window IDs are in place, but live multi-window validation remains open |
| Permission-denied state is surfaced honestly | `PARTIAL` - degraded fallback paths are implemented, but explicit permission-denied runtime validation is still pending |

## Manual Checks

1. Open Codex and confirm the active window is detected with real metadata.
2. Open OpenCode and confirm the active window is detected with real metadata.
3. Open two windows for one provider and confirm the runtime distinguishes them.
4. Deny or simulate missing permission and confirm capability state degrades
   honestly instead of claiming native watcher success.
