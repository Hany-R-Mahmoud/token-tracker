# Feature Specification: Runtime Data Truth And Desktop Observability

**Feature Branch**: `014-runtime-data-and-observability`  
**Created**: 2026-04-08  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Installed desktop failures reported on 2026-04-08, database path logic in `packages/core/src/db/database.ts`, packaged runtime wiring in `apps/desktop-tauri/src-tauri/src/lib.rs`, runtime preparation in `scripts/prepare-desktop-runtime.sh`, installer creation in `scripts/build-macos-installer.sh`, and desktop server empty-state behavior in `apps/desktop/src/index.ts`.

## Goal

Make the packaged desktop app read the same trustworthy local data as the CLI
and browser-served desktop, and make packaged-runtime failures diagnosable
instead of opaque.

This phase exists because the current product has crossed a boundary:

- development mode and packaged mode are no longer the same runtime
- packaged mode now bootstraps a bundled Node-based desktop server
- data location and startup behavior are implicit rather than contractual

That is why the app can appear installed and "running" while still behaving as
if no data exists.

## Problem Statement

The installed app currently fails the most basic trust test:

1. the user already has historical consumption data
2. the packaged app says `No data imported yet`
3. the app gives no trustworthy explanation of which database it opened, which
   runtime started, or whether startup/migration failed

This is not just a missing import. It is a broken runtime-data contract.

## Evidence

- The repo-local database contains real session history:
  - `.ttm/ttm.sqlite` has `262` sessions
- The migrated home database also contains `262` sessions
- The packaged app still reported the generic empty state
- The packaged runtime is assembled by copying:
  - built desktop server output
  - copied `@ttm/core` runtime
  - a copied local `node` binary
- The native shell starts that server as a child process, but the installed UX
  does not expose:
  - actual database path used
  - child process startup success/failure
  - server readiness diagnostics
  - migration source and target

## Root-Cause Analysis

### Root cause 1: database resolution was originally tied to `process.cwd()`

The original default path logic used `process.cwd()` for both local desktop and
leaderboard storage. That is acceptable in a repo-only prototype, but it is not
valid for an installed app bundle whose working directory is different from the
development workspace.

Even after switching defaults toward `~/.ttm`, the product still lacks a
formal, observable storage contract.

### Root cause 2: packaged runtime is a second deployment mode with weak visibility

The Tauri shell now launches a bundled server runtime, but the product still
mostly behaves as if the desktop is "just localhost". Packaged mode has unique
failure points:

- runtime asset staging
- bundled Node startup
- child-process lifetime
- database resolution
- readiness polling

Those are not surfaced to the user or to testers in a trustworthy way.

### Root cause 3: startup states collapse into generic empty product messaging

When packaged startup is degraded, the user currently sees a business/product
empty state (`No data imported yet`) instead of a runtime state (`desktop
runtime started but opened database X with Y sessions`, or `runtime failed to
start`, or `database migration required`).

This creates false diagnosis and wastes debugging time.

## Scope

- canonical desktop database resolution contract
- canonical leaderboard database resolution contract
- migration policy from legacy repo-local or cwd-local databases
- packaged runtime startup diagnostics
- packaged runtime readiness and child lifecycle observability
- truthful startup states in the desktop app
- verification path to prove packaged app and CLI point to the same data

## Non-Goals

- no provider ingestion redesign in this phase
- no analytics redesign
- no menubar interaction redesign beyond what is required to surface runtime
  truth
- no cloud sync or remote storage

## Product Rules

- The installed app must have a single canonical default database location.
- Packaged and development desktop modes must not silently diverge on storage.
- Empty product copy must never mask runtime or migration failures.
- The app must expose enough runtime truth that a tester can answer:
  - which DB path is active
  - how many sessions were seen at startup
  - whether the runtime started successfully
  - whether a migration or fallback path was used

## Functional Requirements

- **FR-001**: System MUST define a canonical default desktop database path that
  is independent of the current working directory.
- **FR-002**: System MUST define a canonical default leaderboard database path
  that is independent of the current working directory.
- **FR-003**: System MUST implement an explicit migration policy for legacy DB
  locations, including repo-local `.ttm` locations that may still contain the
  user's historical data.
- **FR-004**: System MUST expose the active database path and session count in
  a startup diagnostic state before falling back to product empty states.
- **FR-005**: System MUST distinguish between:
  - runtime failed to start
  - runtime started but DB path is missing
  - runtime started and DB is empty
  - runtime started and DB has sessions
- **FR-006**: System MUST record or surface packaged runtime startup failures in
  a way that is inspectable by testers without attaching a debugger.
- **FR-007**: System MUST not require the repo workspace to remain on disk for
  the installed app to read historical data.
- **FR-008**: System MUST define a packaged-runtime health check that proves the
  child server and desktop shell are aligned.

## Validation Requirements

- packaged app opens the same session count as the CLI for the same machine
- packaged app shows the active DB path somewhere inspectable
- packaged app never shows `No data imported yet` if the active DB has sessions
- a failed runtime bootstrap produces a runtime-specific failure state, not a
  product empty state

## Recommended File Targets

- `packages/core/src/db/database.ts`
- `apps/web/src/db.ts`
- `apps/desktop/src/index.ts`
- `apps/desktop-tauri/src-tauri/src/lib.rs`
- `scripts/prepare-desktop-runtime.sh`
- `scripts/build-macos-installer.sh`

## Execution Plan

1. Formalize the database path contract and legacy path precedence.
2. Add a runtime-status handshake between the Tauri shell and the bundled
   server.
3. Replace generic startup empties with runtime-aware diagnostic states.
4. Add verification that packaged desktop, local desktop, and CLI agree on the
   active DB and session count.
5. Document the runtime/data contract and test flow.

## Success Criteria

- **SC-001**: Installed desktop app and CLI report the same session count on the
  same machine without manual DB copying as part of normal use.
- **SC-002**: A tester can identify the active DB path and startup state from
  the app itself.
- **SC-003**: Legacy repo-local data is either migrated automatically or the app
  gives a specific migration state instead of pretending the user has no data.
- **SC-004**: Packaged runtime failures are diagnosable in under five minutes
  without source-level instrumentation.
