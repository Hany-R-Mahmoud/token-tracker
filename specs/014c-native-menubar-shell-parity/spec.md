# Feature Specification: Native Menubar Shell Parity

**Feature Branch**: `014c-native-menubar-shell-parity`  
**Created**: 2026-04-08  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Tauri shell behavior in `apps/desktop-tauri/src-tauri/src/lib.rs`, rich menubar spec in `specs/007-rich-menubar-insights-and-command-center/spec.md`, and installed-app feedback from 2026-04-08.

## Goal

Make the menubar interaction feel like a real native menubar utility:

- opens from tray click
- anchors directly beneath the menu bar item
- dismisses reliably on outside click
- does not leave the user fighting a generic always-on-top window

This phase exists because the current menubar implementation is trying to mimic
native menu-extra behavior with a generic Tauri window. That is a strategic
boundary, not a small polish issue.

## Problem Statement

The user reports two core shell failures:

- opening/closing behavior does not feel like other menubar icons
- dismissing the menubar by clicking outside is unreliable

That means the product is failing at ambient desktop ergonomics, which is the
whole point of the native wrapper.

## Evidence

- the menubar surface is implemented as a normal `WebviewWindow`
- it is configured with:
  - `.decorations(false)`
  - `.always_on_top(true)`
  - `.visible_on_all_workspaces(true)`
  - `.skip_taskbar(true)`
- dismissal currently relies on `WindowEvent::Focused(false)` hiding the window
- tray click behavior is custom and window lifecycle is toggled manually

## Root-Cause Analysis

### Root cause 1: generic window semantics are standing in for native menubar semantics

The current implementation is a regular window with styling and focus handlers,
not a native menu bar popover or panel. That means outside-click dismissal,
z-order behavior, and interaction rules are only approximated.

### Root cause 2: dismissal depends on focus transitions that are not a stable contract

`Focused(false)` is being used as a dismissal proxy. That is not equivalent to
native outside-click popover dismissal, especially when the window is
always-on-top and cross-workspace visible.

### Root cause 3: positioning is event-driven but not yet formalized as shell contract

Using the tray rect is directionally correct, but the product lacks a tested and
documented anchoring contract:

- which edge is authoritative
- how multi-display or notch/menu bar geometries behave
- what happens when tray width is smaller than the popover
- what fallback applies if tray rect data is unavailable

## Scope

- native menubar interaction model
- tray-anchored positioning contract
- dismissal contract for outside click, focus change, escape, and re-click
- shell lifecycle ownership between tray, dashboard, and menubar popup
- validation criteria for native-feeling behavior

## Non-Goals

- no redesign of menubar content hierarchy
- no provider or analytics changes
- no generic dashboard navigation changes except where shell ownership is
  clarified

## Product Rules

- Tray click must toggle the menubar predictably.
- Menubar popup must open directly below the tray item unless a documented
  geometry fallback is required.
- Clicking outside must dismiss the popup reliably.
- The shell must feel native first, not merely styled to look compact.

## Functional Requirements

- **FR-001**: System MUST define a tray-anchor positioning contract for the
  menubar popup.
- **FR-002**: System MUST define dismissal behavior for:
  - outside click
  - focus loss
  - tray re-click
  - Escape key if applicable
- **FR-003**: System MUST not depend solely on generic focus-change events if
  they are insufficient to guarantee native-feeling dismissal.
- **FR-004**: System MUST evaluate whether the current Tauri `WebviewWindow`
  approach is capable of meeting native menubar expectations on macOS.
- **FR-005**: If generic Tauri window semantics are insufficient, the phase MUST
  explicitly move to a stronger macOS-native shell abstraction rather than
  continuing to patch edge cases.

## Architecture Decision To Make

This phase must answer one question explicitly:

**Can the product achieve native-feeling menubar behavior with the current
Tauri window model, or does it need a macOS-specific panel/popover layer?**

That decision must be made from evidence, not convenience.

## Validation Requirements

- click tray icon -> popup opens directly beneath it
- click tray icon again -> popup closes
- click elsewhere -> popup closes reliably
- popup does not get stuck as a floating utility window
- popup behavior remains correct after opening dashboard or switching spaces

## Recommended File Targets

- `apps/desktop-tauri/src-tauri/src/lib.rs`
- any native shell abstraction files introduced to separate:
  - tray event handling
  - positioning
  - dismissal
  - shell state

## Execution Plan

1. Instrument and validate current tray/window behavior with reproducible
   scenarios.
2. Decide whether the current Tauri window model is sufficient.
3. Implement a dedicated shell contract for tray anchoring and dismissal.
4. Validate the result against native menubar expectations on real macOS usage,
   not just synthetic clicks.

## Success Criteria

- **SC-001**: The popup opens below the tray item in normal use on the target
  machine.
- **SC-002**: Outside click dismissal works consistently enough to match user
  expectations for menubar utilities.
- **SC-003**: The shell no longer feels like an always-on-top debug window in
  disguise.
