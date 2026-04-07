Implement Phase 013b using the repo's existing spec/handoff conventions.

Read first:

- `/Users/hanyramadan/token traker/specs/013-active-surface-truth-and-notification-delivery/spec.md`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/apps/desktop/src/active-surface-resolver.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/specs/013b-native-macos-window-watcher-integration/spec.md`
- `/Users/hanyramadan/token traker/specs/013b-native-macos-window-watcher-integration/plan.md`
- `/Users/hanyramadan/token traker/specs/013b-native-macos-window-watcher-integration/tasks.md`
- `/Users/hanyramadan/token traker/specs/013b-native-macos-window-watcher-integration/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Implement the missing native macOS watcher/runtime portion of Phase 013 by
replacing the current simulated Tauri bridge with real macOS-backed window
data for Codex and OpenCode.

Phase-specific rules:

1. Start with `agent-pilot`, then use `agent-orchestrator` and
   `agent-architect` before heavy implementation.
2. Do not leave `source: \"simulated\"` in the primary success path.
3. If permissions or platform APIs block some metadata, degrade honestly instead
   of faking completeness.
4. Codex and OpenCode are the required validated targets in this phase.
5. Keep latest-session fallback explicit and secondary.
6. Report exactly what macOS metadata is truly available after implementation.

Validation:

- `npm run build`
- `npm run typecheck`
- relevant bridge and resolver tests
- manual macOS validation notes if real apps are available
- report Phase 013b acceptance checklist with PASS / FAIL / PARTIAL
- explicitly state whether the simulated bridge path is fully replaced or still
  retained as a fallback/test mode
