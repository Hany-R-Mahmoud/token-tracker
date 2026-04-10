# Feature Specification: Packaged Runtime Ownership And Port Isolation

**Feature Branch**: `015-packaged-runtime-ownership-and-port-isolation`  
**Created**: 2026-04-08  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Installed app debugging on 2026-04-08, `apps/desktop-tauri/src-tauri/src/lib.rs`, packaged runtime behavior on `localhost:3100`, and confirmed stale orphan process ownership.

## Goal

Ensure the installed desktop shell only talks to its own packaged runtime and
cannot be hijacked by stale orphan Node servers from older repo-local builds.

## Problem Statement

The current Tauri shell trusts any responder on `localhost:3100` as "desktop
server ready." This is unsafe for a product with multiple build/install paths.

In the reproduced failure:

- the installed app in `/Applications` was current
- port `3100` was already owned by an orphaned repo-bundle runtime
- the shell attached to that stale process
- the stale process pointed to bundle-local `.ttm/ttm.sqlite` and returned zero
  sessions

This is a runtime ownership bug, not a data import bug.

## Evidence

- `~/.ttm/ttm.sqlite` contains `262` sessions
- `curl http://127.0.0.1:3100/api/summary` returned a bundle-local DB path and
  `sessionCount: 0`
- `curl http://127.0.0.1:3100/api/runtime-status` returned `Not Found`
- `ps` showed the process on `3100` came from:
  - `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/target/release/bundle/macos/Token Tracker.app/...`
- not from:
  - `/Applications/Token Tracker.app/...`

## Root-Cause Analysis

### Root cause 1: fixed port with no runtime identity

The shell uses a fixed global port (`3100`) but does not require the runtime on
that port to prove it belongs to the current app instance.

### Root cause 2: readiness check is too weak

`desktop_server_is_ready()` answers "is something serving the API endpoint?" not
"is my packaged runtime alive and current?"

### Root cause 3: orphan runtime lifecycle is unmanaged

Old bundled Node processes can remain detached and continue owning the fixed
port. The current app neither reclaims nor rejects them.

## Scope

- packaged runtime ownership model
- port isolation strategy
- orphan-process detection and handling
- shell/runtime identity contract
- startup verification for installed builds

## Non-Goals

- no analytics redesign
- no UI restyling
- no provider ingestion changes
- no menubar content redesign

## Product Rules

- The shell must only attach to a runtime it can identify as its own.
- A responder on the expected port is not enough; runtime identity must be
  verified.
- Older repo-local or detached runtimes must not be allowed to masquerade as
  the installed app.
- Startup failure must be explicit when ownership verification fails.

## Functional Requirements

- **FR-001**: System MUST stop using blind fixed-port readiness as proof of
  runtime correctness.
- **FR-002**: System MUST introduce a runtime identity handshake between the
  Tauri shell and the packaged server.
- **FR-003**: System MUST include enough identity data to distinguish:
  - current app bundle path
  - runtime version/build
  - runtime start timestamp or instance token
- **FR-004**: System MUST detect when the expected port is already owned by a
  non-matching runtime.
- **FR-005**: On ownership mismatch, system MUST either:
  - start on an isolated alternate port, or
  - terminate/reclaim only the matching stale runtime it owns, or
  - fail explicitly with runtime-specific messaging
- **FR-006**: Installed app MUST NOT attach to repo-bundle runtimes under the
  workspace path when launched from `/Applications`.
- **FR-007**: Runtime lifecycle MUST be designed so orphan processes are
  minimized and detectable.

## Architecture Decision To Make

This phase must answer:

**Should the packaged runtime keep using a fixed port, or should each app
instance allocate an owned port and pass it explicitly to shell URLs?**

The likely stronger option is app-owned dynamic or reserved port allocation plus
runtime identity handshake.

## Validation Requirements

- install app to `/Applications`
- ensure old repo-bundle runtime is still alive
- launch installed app
- verify shell does not attach to stale runtime
- verify reported runtime path belongs to `/Applications/Token Tracker.app`
- verify summary session count matches canonical DB

## Recommended File Targets

- `apps/desktop-tauri/src-tauri/src/lib.rs`
- `apps/desktop/src/index.ts`
- packaging/runtime helpers as needed

## Execution Plan

1. Define the ownership contract and runtime identity payload.
2. Replace naive readiness checks with identity verification.
3. Add port conflict handling for orphan or foreign runtimes.
4. Make shell navigation derive from the verified runtime endpoint.
5. Add installed-app verification steps covering stale-runtime collision.

## Success Criteria

- **SC-001**: Installed app never binds to a stale repo-bundle runtime.
- **SC-002**: Runtime identity can be inspected and matched to the current app
  install path.
- **SC-003**: Reproducing the old orphan-runtime scenario no longer results in
  false empty-state UI.
