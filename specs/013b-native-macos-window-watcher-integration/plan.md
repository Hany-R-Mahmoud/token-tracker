# Plan: Native macOS Window Watcher Integration

## Goal Summary

Swap the simulated macOS bridge for a real native watcher path and wire it into
the existing Phase 013 resolver/runtime.

## Constraints And Assumptions

- current architecture is already in place
- the remaining work is specifically native OS integration
- permissions may prevent perfect title/process visibility
- honest degraded behavior is acceptable; fake success is not

## Ordered Execution Plan

### Workstream A: Native Bridge

1. inspect current simulated Tauri commands
2. choose the concrete macOS window-access mechanism
3. implement real `get_active_window`
4. implement real `get_open_windows`
5. derive capability states from actual runtime conditions

### Workstream B: Resolver Wiring

1. feed real window snapshots into the desktop resolver
2. ensure runtime prefers watcher data over latest-session fallback
3. preserve truthful fallback when watcher data is unavailable

### Workstream C: Validation

1. validate Codex active window detection
2. validate OpenCode active window detection
3. validate multi-window distinction
4. validate degraded state when permissions are absent

### Workstream D: Docs And Reporting

1. update relevant docs/status language
2. report exact supported/degraded behavior on macOS

## Risks

- macOS permissions may block some metadata
- chosen API path may provide app/process truth but weak title truth
- open-window enumeration may be less complete than active-window lookup

## Mitigations

- report capability state precisely
- accept partial metadata when still useful
- keep fallback semantics explicit

## Recommended Next Agent

`agent-pilot` should lead, with `agent-architect` reviewing the native bridge
choice before `agent-implementer` changes the Tauri layer.
