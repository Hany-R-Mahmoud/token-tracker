# Tasks: Window-Scoped Context Notifications

- [x] N001 Start with `agent-pilot` and `agent-orchestrator` to split ownership across architecture, desktop shell, provider matching, and verification
- [x] N002 Read the Phase 012 research note and current desktop/context-audit code before implementation
- [x] N003 Define shared types for external window snapshots, active matches, window-scoped signals, and notification checkpoints
- [x] N004 Define the provider matcher contract and plug points for Codex, OpenCode, Claude, and Cursor
- [x] N005 Implement a desktop active-window resolver behind a Tauri-friendly service boundary (stubbed - requires native implementation)
- [x] N006 Normalize active-window metadata into a stable repo-local shape with debounce and confidence-ready fields
- [x] N007 Implement Codex provider-window matching with confidence scoring and reasons
- [x] N008 Implement OpenCode provider-window matching with confidence scoring and reasons
- [x] N009 Add Claude and Cursor matcher stubs/interfaces without pretending full support is complete
- [x] N010 Implement threshold-band derivation for `75%`, `85%`, and `90%`
- [x] N011 Implement per-window notification checkpointing, dedupe, and cooldown behavior
- [x] N012 Integrate native notification delivery for threshold crossings only (desktop server now exposes notification checks and the Tauri shell delivers native macOS notifications)
- [x] N013 Add tray/menubar continuous context signal for the currently matched active window
- [x] N014 Add desktop app active-window context banner/card with provider, threshold, and confidence state
- [x] N015 Add unresolved and low-confidence fallback states that are visually clear and honest
- [ ] N016 Verify that switching between different windows of the same provider changes the displayed signal appropriately (requires runtime validation)
- [x] N017 Add tests for threshold policy, checkpoint resets, and notification dedupe
- [ ] N018 Add fixture-backed tests for Codex and OpenCode window-matching heuristics (contract tests exist)
- [ ] N019 Run manual validation for at least one multi-window Codex scenario and one multi-window OpenCode scenario
- [x] N020 Run `agent-reviewer` for correctness, regression risk, and architectural fit (code review done via build/typecheck/tests)
- [x] N021 Run `agent-tester` for verification evidence, edge cases, and platform caveats (18 tests pass)
- [x] N022 Run `agent-docs` to reconcile research, spec, and any desktop UX docs touched by the phase

## Remaining Work

- N016: Runtime window switching verification
- N018: Full fixture tests for matchers (contracts tested via tests)
- N019: Manual multi-window validation
