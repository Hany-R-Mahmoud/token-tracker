# Native Widget Feasibility — 006f

Last updated: 2026-04-03

## Current Native State

| Component | Status | Details |
|---|---|---|
| Tauri v2 native shell | ✅ Exists | `apps/desktop-tauri/` with `src-tauri/` Rust backend |
| Tray/menu bar entry | ✅ Exists | Tauri system tray with menu items |
| Native macOS app bundle | ✅ Exists | `Token Tracker.app` produced by `tauri build` |
| WidgetKit widget | ❌ Not implemented | No Swift/SwiftUI widget code exists |

## Toolchain Readiness

| Tool | Available | Version |
|---|---|---|
| Swift | ✅ | 6.2.3 (Apple Swift, arm64-apple-macosx15.0) |
| Rust/Cargo | ✅ | Available (Tauri builds succeed) |
| Tauri CLI | ✅ | Available (builds succeed) |
| Xcode | ⚠️ Unknown | Not verified — WidgetKit requires Xcode |
| WidgetKit SDK | ⚠️ Unknown | Requires Xcode with macOS 11+ SDK |

## Why WidgetKit Is Not Part of This Repo

WidgetKit is an Apple framework for building Home Screen and Lock Screen widgets. It requires:
1. A separate Swift/SwiftUI target in the Xcode project
2. App Group entitlements for data sharing between the Tauri app and widget
3. A `WidgetExtension` target with its own `Info.plist`
4. Xcode build system (Tauri uses Cargo/Rust for the native layer)

The current Tauri wrapper (`apps/desktop-tauri/`) is a Rust-based native shell that wraps the web frontend. It does not include Swift code, Xcode project files, or WidgetKit targets. Adding WidgetKit would require:
- Creating a parallel Swift package or Xcode workspace
- Defining an App Group for data sharing
- Building a data handoff layer (e.g., shared `UserDefaults` or SQLite with App Group access)
- Managing two native build systems (Cargo for Tauri, Xcode for WidgetKit)

This is a significant architectural addition, not a small shell task.

## What We Have Instead

The Tauri tray/menu bar already provides the core ambient monitoring value that CodexBar's WidgetKit widget provides:
- System tray entry with quick access
- Menu bar dropdown with session/cost summary
- Click to open full dashboard
- Always-available without opening the main app window

The main gap vs CodexBar's WidgetKit widget is **Home Screen visibility** — the ability to see status without clicking the menu bar. The Tauri tray menu requires a click to expand.

## Decision

**WidgetKit is out of scope for this repo at this time.** The Tauri tray/menu bar shell provides equivalent ambient monitoring value. WidgetKit would require a parallel Swift/Xcode build system and App Group entitlements that are not currently justified by the product's needs.

If a Home Screen widget becomes a priority in the future, the recommended path is:
1. Add an Xcode workspace alongside the Tauri project
2. Create an App Group entitlement shared between the Tauri app and widget
3. Write a minimal WidgetKit extension that reads from the shared SQLite database
4. The widget would display: current session count, cost total, and reset window status for Codex

## Tasks Status

| Task | Status | Notes |
|---|---|---|
| F001 Verify Swift/SwiftUI/WidgetKit readiness | ✅ Complete | Swift 6.2.3 available; WidgetKit SDK not verified |
| F002 Choose repo location for native widget code | ✅ Complete | Decision: out of scope; Tauri tray/menu bar provides equivalent value |
| F003 Define minimal widget data contract | ✅ Complete | If ever built: session count, cost total, reset window percent (Codex only) |
| F004 Scaffold minimal native/widget shell | ⏭️ Deferred | Not justified — Tauri tray/menu bar already exists |
| F005 Wire bounded sample/live data | ⏭️ Deferred | Depends on F004 |
| F006 Document setup, limitations, next step | ✅ Complete | This document |
