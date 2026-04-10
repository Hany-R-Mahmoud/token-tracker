# Feature Specification: Installed Shell Runtime Handshake And Failure Truth

**Feature Branch**: `015b-installed-shell-runtime-handshake-and-failure-truth`  
**Created**: 2026-04-08  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Installed desktop runtime debug findings on 2026-04-08, updated desktop diagnostic routes in `apps/desktop/src/index.ts`, and shell startup behavior in `apps/desktop-tauri/src-tauri/src/lib.rs`.

## Goal

Make the installed desktop app surface truthful runtime-state information before
showing product empty states, especially when the shell has attached to the
wrong server or failed to verify ownership.

## Problem Statement

Recent work improved runtime-aware empty states inside the desktop server, but
that only helps after the shell reaches the correct runtime. In the current
failure, the shell attached to the wrong runtime first, so the user still saw
misleading product messaging:

- Overview implied missing imports
- Menubar implied missing imports
- Analytics behaved like an old build

The truth problem now lives one layer above the route handlers: the shell needs
to verify and expose runtime attachment state before treating the app as ready.

## Evidence

- The correct canonical DB exists and contains `262` sessions.
- The installed app bundle contains the newer runtime code.
- The shell still attached to a stale runtime on `3100`.
- That runtime returned old behavior and no `/api/runtime-status`.
- Therefore route-level truth improvements were bypassed.

## Root-Cause Analysis

### Root cause 1: shell assumes runtime attachment success too early

The Tauri shell navigates to `http://localhost:3100/` and `.../menubar` after a
weak readiness check. It does not require a full handshake proving:

- runtime identity
- runtime version
- runtime DB path
- runtime ownership

### Root cause 2: route-level diagnostics are inaccessible when shell attachment is wrong

Even good runtime diagnostics inside the desktop server cannot help if the shell
never reaches the intended server.

### Root cause 3: installed product still lacks a top-level "runtime attachment failed" state

The user experience currently jumps too quickly from shell startup into product
surfaces. There is still no dedicated installed-shell failure state for:

- wrong runtime attached
- runtime identity mismatch
- runtime handshake missing
- startup blocked by port collision

## Scope

- shell-to-runtime handshake state
- dashboard startup gating
- runtime mismatch UI
- menubar/runtime failure truth
- installed-app diagnostics flow

## Non-Goals

- no visual redesign of analytics content
- no data ingestion changes
- no provider metrics redesign

## Product Rules

- Product empty states must never be shown before runtime ownership is verified.
- The installed shell must have an explicit runtime-attachment state.
- Wrong-runtime attachment is a startup failure, not an Overview empty state.
- Menubar and Analytics must inherit the same verified runtime contract as the
  main dashboard.

## Functional Requirements

- **FR-001**: Shell MUST complete a runtime identity handshake before loading
  the main product surfaces.
- **FR-002**: If handshake fails, shell MUST render a runtime-specific startup
  failure state instead of product empty-state UI.
- **FR-003**: Shell MUST expose enough diagnostic information to identify:
  - attached runtime endpoint
  - runtime bundle path or ownership token
  - active database path
  - startup failure reason
- **FR-004**: Overview, Analytics, and Menubar MUST share the same verified
  runtime attachment contract.
- **FR-005**: Analytics failure to open due to runtime mismatch MUST be treated
  as a runtime-startup issue, not a route-specific content issue.
- **FR-006**: The installed app MUST provide a testable diagnostic flow for
  support/debugging without requiring terminal-only inspection.

## Validation Requirements

- start with a stale old runtime already listening on the old port
- launch installed app
- verify the user sees runtime mismatch / startup truth instead of fake
  "No data imported yet"
- verify Overview, Menubar, and Analytics all stay gated behind the same
  verified runtime
- verify successful attach path shows canonical DB and non-zero sessions

## Recommended File Targets

- `apps/desktop-tauri/src-tauri/src/lib.rs`
- `apps/desktop/src/index.ts`
- shell fallback/static startup page assets if introduced

## Execution Plan

1. Define handshake payload and shell gating rules.
2. Add a startup state machine for:
   - launching runtime
   - waiting for readiness
   - verifying identity
   - surfacing explicit mismatch/failure
3. Route Overview, Analytics, and Menubar only after handshake success.
4. Add installed-app verification scenarios for stale-runtime takeover.

## Success Criteria

- **SC-001**: The installed app never tells the user to run `ttm import` when
  the real issue is runtime mismatch or stale-runtime attachment.
- **SC-002**: Analytics no longer "fails to open" due to invisible runtime
  attachment issues.
- **SC-003**: A tester can diagnose shell/runtime mismatch from the app itself
  without source-level inspection.
