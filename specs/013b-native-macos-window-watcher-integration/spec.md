# Feature Specification: Native macOS Window Watcher Integration

**Feature Branch**: `013b-native-macos-window-watcher-integration`  
**Created**: 2026-04-06  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: current Phase 013 runtime and bridge code in
`/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`,
desktop resolver wiring in
`/Users/hanyramadan/token traker/apps/desktop/src/active-surface-resolver.ts`,
desktop server integration in
`/Users/hanyramadan/token traker/apps/desktop/src/index.ts`,
and Phase 013 spec docs.

## Goal

Replace the current **simulated** Tauri active-window bridge with a **real
macOS-native watcher path** so Token Tracker can resolve actual foreground and
open external windows for Codex and OpenCode.

This phase is intentionally narrow. It exists to finish the missing native OS
integration without reopening the rest of Phase 013.

## Scope

- real macOS-backed implementation for:
  - `get_active_window`
  - `get_open_windows`
  - `get_active_surface_capabilities`
  - `resolve_active_surface`
- capability detection for permission/degraded states on macOS
- runtime wiring from real watcher output into the existing
  `ActiveSurfaceResolver`
- validation with real or fixture-backed Codex/OpenCode window data
- docs/status updates for supported and degraded states

## Non-Goals

- no Linux/Wayland parity work in this phase
- no browser native messaging implementation
- no broad browser URL enrichment program
- no full Cursor/Claude active-window support unless it falls out naturally from
  the same validated macOS path
- no speculative fake-success reporting if macOS permissions or APIs block the
  final path

## Product Rules

- The bridge must stop returning simulated placeholder data when claiming macOS
  native watcher support.
- If permissions are missing, the app must surface degraded/unavailable
  capability honestly.
- Latest-session fallback remains allowed only as an explicit fallback tier.
- Codex and OpenCode are the required validated targets for real window data in
  this phase.

## Why This Phase Exists

Phase 013 correctly established the architecture, but the Tauri commands still
return simulated data. That means the product still cannot prove active-window
truth on macOS.

013b exists to close that exact gap.

## Core User Questions

1. Is Token Tracker actually reading the real current macOS foreground window?
2. Can it enumerate open Codex/OpenCode windows separately?
3. Does it degrade honestly when permissions are missing?
4. Does the runtime now prefer real watcher data over latest-session fallback?

## Required Implementation

### macOS native bridge

Required:

- implement real macOS-backed window lookup in the Rust/Tauri layer
- populate:
  - window id
  - title when available
  - app name
  - process id/path when available
  - bounds when available
  - active flag

Allowed implementation paths:

- native macOS APIs
- carefully bounded platform-specific shell/AppleScript bridge if needed

Not acceptable:

- leaving `source: "simulated"` and calling the phase complete
- returning empty vectors while reporting active-window detection as available

### Capability states

Required:

- `activeWindowDetection`
- `openWindowRegistry`
- `desktopNotifications`
- `attentionRequest`

These must reflect real macOS runtime conditions, including permission gaps.

### Resolver wiring

Required:

- `ActiveSurfaceResolver` must consume the real watcher output
- the desktop runtime must prefer real watcher/resolver output over
  latest-session fallback when capability is available
- fallback must remain explicit when watcher data is unavailable/degraded

### Validation targets

Required:

- Codex window detection on macOS
- OpenCode window detection on macOS
- multi-window distinction when two provider windows are open

## Acceptance Standard

Phase 013b is complete only when:

- Tauri commands return real macOS-backed window data instead of simulated data
- active-window capability is reported honestly
- desktop runtime prefers real watcher data when available
- Codex and OpenCode active/open windows can be distinguished in runtime
- degraded/unavailable permission states are represented honestly
- docs/reporting reflect actual behavior
