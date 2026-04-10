# SPEC-KIT: Installed Desktop Runtime Debug Report

**Date:** 2026-04-08  
**Modes Applied:** debugging, orchestration  
**Target:** Installed macOS app at `/Applications/Token Tracker.app`  
**Related Specs:**  
- `/Users/hanyramadan/token traker/specs/014-runtime-data-and-observability/spec.md`  
- `/Users/hanyramadan/token traker/specs/014b-surface-route-contract-and-empty-state-truth/spec.md`  
- `/Users/hanyramadan/token traker/specs/014c-native-menubar-shell-parity/spec.md`  

---

## Executive Summary

The installed desktop app is not primarily failing because the local database is
missing. The real failure is that the Tauri shell trusts any process already
listening on `localhost:3100` and then navigates to that process as if it were
the app's own runtime.

In the reproduced failure, port `3100` was owned by an orphaned Node server
launched from an older repo-local app bundle path:

```text
/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/target/release/bundle/macos/Token Tracker.app/Contents/Resources/_up_/runtime/bin/node
```

That stale runtime reported:

- `databasePath`: repo-bundle-local `.ttm/ttm.sqlite`
- `sessionCount`: `0`
- no `/api/runtime-status` route at all

The installed app in `/Applications` had already been updated with the newer
runtime code, but the shell still attached to the stale process because the
ownership check is currently "port is responding" rather than "this is my
runtime."

This explains all three reported symptoms together:

- Overview shows `No data imported yet`
- Menubar shows the same wrong empty state
- Analytics behaves like the old runtime instead of the new packaged app

---

## Reproduction Status

**Status:** Reproduced with direct evidence

### Verified facts

1. The canonical local database still has historical data:

```bash
sqlite3 ~/.ttm/ttm.sqlite 'select count(*) from sessions;'
```

Result:

```text
262
```

2. The installed app exists and was updated recently:

```text
/Applications/Token Tracker.app
```

3. The installed copy contains the newer bundled runtime code, including:

- `databaseSource`
- `canonical_home`
- `/api/runtime-status`
- updated menubar empty copy

4. Despite that, port `3100` was serving an older runtime:

```bash
curl -s http://127.0.0.1:3100/api/summary
```

Response:

```json
{"databasePath":"/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/target/release/bundle/macos/Token Tracker.app/Contents/Resources/_up_/runtime/.ttm/ttm.sqlite","sessionCount":0,"providerSummaries":[]}
```

5. The same server failed the new runtime handshake route:

```bash
curl -s http://127.0.0.1:3100/api/runtime-status
```

Response:

```text
Not Found
```

6. The owner of port `3100` was confirmed:

```bash
lsof -nP -iTCP:3100 -sTCP:LISTEN
ps -p 25963 -o pid=,ppid=,command=
```

Result:

```text
25963     1 /Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/target/release/bundle/macos/Token Tracker.app/Contents/Resources/_up_/runtime/bin/node /Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/target/release/bundle/macos/Token Tracker.app/Contents/Resources/_up_/runtime/apps/desktop/dist/index.js
```

This is not the `/Applications` install path. It is a stale repo-bundle runtime
with parent PID `1`, which strongly suggests an orphaned server process.

---

## Root Cause

### Root Cause 1: Runtime ownership is inferred from port readiness only

Current logic in `apps/desktop-tauri/src-tauri/src/lib.rs`:

- uses fixed URLs on `http://localhost:3100`
- treats `desktop_server_is_ready()` as sufficient proof that the correct
  runtime exists
- does not verify:
  - runtime version
  - runtime source path
  - runtime identity
  - bundled app ownership

This allows any old server on `3100` to hijack the current shell.

### Root Cause 2: The desktop server uses a globally fixed port with no ownership boundary

Because the port is always `3100`, an older repo-bundle runtime and the newly
installed app compete for the same address. If an orphaned process already owns
the port, the new app silently treats it as healthy.

### Root Cause 3: Failure truth is still gated behind successful runtime attachment

Even though newer runtime diagnostics were implemented, the user never reaches
them if the shell attaches to the wrong server. The product is therefore still
failing before it gets to the improved truth surfaces.

---

## Impacted User Surfaces

- **Overview:** connects to stale runtime and sees zero sessions
- **Menubar:** same stale runtime, same empty state
- **Analytics:** rendered by the old runtime, so route behavior does not match
  the updated installed build

---

## Confidence Assessment

**Confidence:** High

Why high:

- data presence was verified independently in `~/.ttm/ttm.sqlite`
- installed app bundle contents were verified independently in `/Applications`
- stale runtime ownership on `3100` was proven by `lsof` and `ps`
- response shape mismatch (`/api/runtime-status` => `Not Found`) proves the
  shell was talking to old server code

---

## Observability Gaps

The following gaps materially slowed diagnosis:

1. No runtime identity token or instance handshake between shell and server
2. No explicit "connected runtime path/version/source" surface in the shell
3. No orphan-runtime detection when fixed port `3100` is already occupied
4. No install/runtime verification flow that proves `/Applications` app is
   attached to its own bundled runtime instead of any localhost responder

---

## Recommended Next Step

Do not patch Overview, Menubar, or Analytics separately first.

The next execution should start with:

1. runtime ownership and port isolation
2. shell-to-runtime identity handshake
3. installed-app verification harness

Those are captured in:

- `/Users/hanyramadan/token traker/specs/015-packaged-runtime-ownership-and-port-isolation/spec.md`
- `/Users/hanyramadan/token traker/specs/015b-installed-shell-runtime-handshake-and-failure-truth/spec.md`
