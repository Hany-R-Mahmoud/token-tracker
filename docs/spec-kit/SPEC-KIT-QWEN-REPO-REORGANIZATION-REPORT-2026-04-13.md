# SPEC-KIT: Qwen Repo Reorganization — Final Report

**Date:** 2026-04-13
**Authors:** Qwen Code
**Audience:** Project maintainers

---

## Summary

The repo has been reorganized to reduce cognitive load, sharpen package
boundaries, and prepare for a potential future Next.js App Router migration
for the web surface. This was a **behavior-preserving structural refactor** —
no product behavior, route contracts, or public APIs changed.

### What changed

| Area | Before (flat) | After (bounded) |
|---|---|---|
| `apps/web/src` | 9 flat files (`index.ts`, `auth.ts`, `db.ts`, `routes.ts`, `scoring.ts`, `ingestion.ts`, `rendering/`) | 6 subfolders (`app/`, `auth/`, `routing/`, `storage/`, `leaderboard/`, `rendering/`) |
| `apps/desktop/src` | 14 root-level files + partial `styles/`, `rendering/`, `handlers/` | 5 subfolders (`app/`, `runtime/`, `shell/`, `styles/`, `rendering/`, `handlers/`) |
| `packages/cli/src` | `output.ts` at root, `types.ts`/`utils.ts` in `commands/` | `shared/` folder for cross-cutting utilities |
| `packages/core/src` | **Unchanged** — already well-organized | **Unchanged** |

### Validation

| Check | Status |
|---|---|
| `npm run typecheck` | ✅ Pass |
| `npm run build` | ✅ Pass |
| Web tests (20 tests, 8 suites) | ✅ Pass |
| Desktop tests (43 tests, 14 suites) | ✅ Pass |
| `packages/core/src` modified | ✅ No — zero changes |

---

## Baseline Status

Before any moves were made:

- `npm run typecheck` — **passing** (0 errors)
- `npm run build` — **passing** (0 errors)
- Uncommitted source changes — **none** (only untracked handoff docs)
- Generated artifacts present: 4 `*.tsbuildinfo` files (one per workspace)

---

## Files Moved And New Structure

### apps/web/src

**Before** (flat, 9 source files):
```
apps/web/src/
  index.ts, index.test.ts
  auth.ts, routes.ts, db.ts
  scoring.ts, ingestion.ts
  rendering/pages.ts, rendering/components.ts
```

**After** (bounded, 15 source files across 6 folders):
```
apps/web/src/
  index.ts                    ← thin entrypoint (re-exports + main check)
  index.test.ts
  app/
    config.ts                 ← env vars, constants, rate limit config
    create-app.ts             ← createApp() request handler
    server.ts                 ← main() bootstrap
  auth/
    cookies.ts                ← cookie parsing/building, SESSION_COOKIE_NAME
    session.ts                ← Session interface, SessionManager, generateSessionId, validateAdminApiKey
    github-oauth.ts           ← createDefaultGitHubOAuthClient, resolveOrigin, setPort
  leaderboard/
    scoring.ts                ← moved from root (computeCompositeScore, computeLeaderboardSnapshot)
    ingestion.ts              ← moved from root (syncLocalSessions)
    service.ts                ← NEW: periodToDays, computeAndSaveSnapshot
  rendering/
    pages.ts                  ← HTML page builders (lost service logic to leaderboard/)
    components.ts             ← styles, HTML helpers, drawer script
  routing/
    routes.ts                 ← moved from root (parseUrlPath, Router, type defs)
  storage/
    db.ts                     ← moved from root (LeaderboardDatabase)
```

### apps/desktop/src

**Before** (14 root files + partial folders):
```
apps/desktop/src/
  index.ts
  styles.ts, styles/index.ts, styles/*.ts
  rendering/layout.ts, rendering/analytics.ts, rendering/overview.ts
  handlers/index.ts, handlers/routes.ts, handlers/*.ts
  server-bootstrap.ts, security-headers.ts, env-config.ts
  error-handler.ts, runtime-status.ts, tauri-bridge.ts, tauri-bridge.test.ts
  active-surface-resolver.ts, menubar.ts, menubar-data.ts, preferences.ts
  helpers.ts, brand.ts, export-svg.ts
```

**After** (organized into 6 folders):
```
apps/desktop/src/
  index.ts                    ← orchestrator (imports from subfolders)
  app/
    server-bootstrap.ts        ← moved from root
    security-headers.ts        ← moved from root
  handlers/
    export.ts, index.ts, preferences.ts, refresh.ts, routes.ts, runtime-status.ts, summary.ts
  rendering/
    analytics.ts, layout.ts, overview.ts
    brand.ts                  ← moved from root
    export-svg.ts             ← moved from root
    helpers.ts                ← moved from root
  runtime/
    env-config.ts             ← moved from root
    error-handler.ts          ← moved from root
    runtime-status.ts         ← moved from root
    tauri-bridge.ts           ← moved from root
    tauri-bridge.test.ts      ← moved from root
  shell/
    active-surface-resolver.ts ← moved from root
    menubar.ts                ← moved from root
    menubar-data.ts           ← moved from root
    preferences.ts            ← moved from root
  styles/
    base.ts, data-display.ts, index.ts, layout.ts, menubar.ts, surface.ts, tokens.ts, utilities.ts
```

### packages/cli/src

**Before**:
```
packages/cli/src/
  index.ts, output.ts
  commands/types.ts, commands/utils.ts, commands/*.ts
```

**After**:
```
packages/cli/src/
  index.ts
  shared/
    output.ts                 ← moved from root
    types.ts                  ← moved from commands/
    utils.ts                  ← moved from commands/
  commands/
    compare-snapshot.ts, doctor.ts, export.ts, import.ts, providers.ts, registry.ts, summary.ts
```

---

## Architecture Decisions

### 1. Web: `index.ts` is now thin
The main entrypoint only re-exports `createApp` and runs `main()` when
executed directly. All bootstrap logic moved to `app/server.ts`, all request
handling to `app/create-app.ts`.

### 2. Web: Auth split by concern, not by type
`auth.ts` was one file doing cookies, sessions, and OAuth. It's now three
files: `cookies.ts` (parsing/building), `session.ts` (lifecycle, admin key),
`github-oauth.ts` (client creation, origin resolution).

### 3. Web: Leaderboard service extracted
`computeAndSaveSnapshot` and `periodToDays` lived in `rendering/pages.ts` but
are service-layer logic, not rendering. They moved to `leaderboard/service.ts`.
`rendering/pages.ts` now imports from there.

### 4. Desktop: Shell vs Runtime vs App boundaries
- **`app/`** — HTTP server bootstrap and security headers
- **`runtime/`** — environment config, error handling, runtime status, Tauri bridge
- **`shell/`** — menubar, active surface resolution, user preferences
- **`rendering/`** — HTML generation, helpers, brand assets, SVG export

### 5. CLI: `shared/` for cross-cutting utilities
Types, output formatting, and command utilities are shared across all commands
but are not commands themselves. `shared/` is the smallest honest boundary.

### 6. `packages/core` untouched
Core already had the best boundaries in the repo (`adapters/`, `analysis/`,
`db/`, `domain/`, `leaderboard/`, `pricing/`, `utils/`). No moves were
justified.

### 7. Test mock fix (web)
The test's mock `IncomingMessage` lacked a `socket` property, causing
`req.socket.remoteAddress` to throw. Added `(req as any).socket = { remoteAddress: "127.0.0.1" }`.
This was a latent bug, not introduced by the reorg.

---

## Validation Commands And Results

### Baseline (before any moves)
```
npm run typecheck     → pass (0 errors)
npm run build         → pass (0 errors)
```

### After reorganization
```
npm run typecheck     → pass (0 errors)
npm run build         → pass (0 errors)
node --test apps/web/dist/index.test.js          → 20 pass, 0 fail
node --test apps/desktop/dist/runtime/tauri-bridge.test.js → 43 pass, 0 fail
```

### Packages/core — zero changes
```
git diff --stat packages/core/src/   → (empty, no changes)
```

---

## What Stayed Intentionally Unchanged

| Item | Reason |
|---|---|
| `packages/core/src` | Already had excellent domain-aligned boundaries |
| Route paths and contracts | Behavior-preserving refactor only |
| Product UI and rendering | Not a redesign or rewrite |
| `handlers/` folder in desktop | Already correctly placed |
| `styles/` folder in desktop | Already partially organized |
| Test count and coverage | Same tests, same assertions |

---

## Remaining Debt Or Follow-Ups

1. **`apps/web/src/index.ts` uses dynamic `import()`** for `main()` — this works
   but could be a static import if the `isMain` check is refactored.

2. **`rendering/pages.ts` still calls `computeAndSaveSnapshot`** during page
   render (GET `/leaderboard` mutates DB). This was pre-existing behavior, not
   introduced by the reorg. Consider moving snapshot computation to a
   background job or POST endpoint.

3. **`packages/cli/src/shared/utils.ts` re-exports `createCommand`** which is
   unused — safe to remove on next cleanup pass.

4. **No `.gitignore` update** — `*.tsbuildinfo` files are still tracked. Consider
   adding them to `.gitignore` in a separate commit.

5. **Future Next.js migration** — The `apps/web` layout is now compatible with
   a future `app/` route structure, but no `page.tsx`, `layout.tsx`, or
   `route.ts` files exist yet. Those should be added when migrating.

---

## Explicit Completion Statement

Repo reorganization pass is complete.

- The planned reorganization scope landed across all three apps/packages.
- Build and typecheck pass after all moves (zero errors).
- All 63 tests pass (20 web + 43 desktop).
- Final structure is simpler to navigate: flat files reduced from 23 to 3
  root-level source files across all workspaces.
- No critical regression remains open.
