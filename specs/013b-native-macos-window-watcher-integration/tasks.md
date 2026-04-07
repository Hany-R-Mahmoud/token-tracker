# Tasks: Native macOS Window Watcher Integration

- [x] M001 Start with `agent-pilot` and `agent-orchestrator` to scope the native bridge and validation approach
- [x] M002 Read the current Tauri bridge, resolver, and Phase 013 docs before implementation
- [x] M003 Choose and document the concrete macOS-native window access path
- [x] M004 Replace simulated `get_active_window` with real macOS-backed data
- [x] M005 Replace simulated `get_open_windows` with real macOS-backed data
- [x] M006 Update `get_active_surface_capabilities` to reflect actual macOS runtime support
- [x] M007 Update `resolve_active_surface` to use real watcher output and truthful fallback semantics
- [x] M008 Wire the desktop runtime to prefer watcher-backed active surface resolution over latest-session fallback
- [ ] M009 Validate Codex active-window detection on macOS
- [ ] M010 Validate OpenCode active-window detection on macOS
- [ ] M011 Validate multi-window distinction for at least one provider
- [ ] M012 Validate degraded/unavailable state when permissions are missing or denied
- [x] M013 Add or update tests for the bridge/resolver behavior
- [x] M014 Run `agent-reviewer` for correctness and truthfulness
- [x] M015 Run `agent-tester` for validation evidence and edge cases
- [x] M016 Run `agent-docs` to update implementation-status language
