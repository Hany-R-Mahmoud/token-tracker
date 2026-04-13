# Handoff: Codex Assessment — Repo Reorganization

**Date:** 2026-04-13
**From:** Qwen Code
**To:** Codex
**Subject:** Assess completed reorg, validate, and flag remaining work

---

## Context

Qwen executed a multi-phase structural reorganization of the repo per
`docs/spec-kit/SPEC-KIT-QWEN-REPO-REORGANIZATION-AND-WEB-GUARDRAILS-2026-04-13.md`.
This handoff summarizes what landed and what Codex should assess.

---

## What Qwen Did

| Phase | What | Status |
|---|---|---|
| 0 | Baseline inventory + validation | ✅ Pass |
| 1 | Web app boundary (`apps/web/src`) — 9 flat → 6 folders | ✅ Pass |
| 2 | Desktop app boundary (`apps/desktop/src`) — 14 root → 5 folders | ✅ Pass |
| 3 | CLI shared (`packages/cli/src`) — `shared/` folder | ✅ Pass |
| 4 | Import normalization, dead exports removed | ✅ Pass |
| 5 | Final report written | ✅ Done |

### Key structural changes

**`apps/web/src`**
- `auth.ts` → `auth/{cookies,session,github-oauth}.ts`
- `routes.ts` → `routing/routes.ts`
- `db.ts` → `storage/db.ts`
- `scoring.ts`, `ingestion.ts` → `leaderboard/`
- `index.ts` → thin entry + `app/{config,create-app,server}.ts`
- `computeAndSaveSnapshot`, `periodToDays` extracted from `rendering/pages.ts` → `leaderboard/service.ts`

**`apps/desktop/src`**
- Root files → `app/` (bootstrap, security), `runtime/` (env, errors, status, tauri), `shell/` (menubar, preferences, surface), `rendering/` (helpers, brand, export-svg)

**`packages/cli/src`**
- `output.ts`, `types.ts`, `utils.ts` → `shared/`

**`packages/core/src`** — Zero changes (already well-organized).

### Validation at time of handoff
- `npm run typecheck` → 0 errors
- `npm run build` → 0 errors
- Web tests → 20/20 pass
- Desktop tests → 43/43 pass

---

## What Codex Should Assess

### 1. `apps/desktop/src/rendering/analytics.ts`
**File:** `apps/desktop/src/rendering/analytics.ts`

Check that imports in this file are correct after the move of:
- `PAGE_STYLES` → from `../styles/index.js` (was `../styles.js`)
- `escapeHtml`, `formatNumber` → from `./helpers.js` (was `../helpers.js`)
- `buildDesktopNav`, `buildThemeScript` → from `./layout.js` (unchanged)

Verify the file compiles and renders correctly. This is a spot-check of the
desktop rendering import pattern since Codex may have touched similar files
before.

### 2. Remaining Debt Items (from Qwen report)

| # | Item | Priority | Notes |
|---|---|---|---|
| 1 | `apps/web/src/index.ts` dynamic `import()` for `main()` | Low | Works but could be static import with refactored `isMain` check |
| 2 | GET `/leaderboard` mutates DB via `computeAndSaveSnapshot` | Medium | Pre-existing; consider background job or POST endpoint |
| 3 | `packages/cli/src/shared/utils.ts` — `createCommand` unused | Low | Safe to remove |
| 4 | `*.tsbuildinfo` still tracked in git | Low | Add to `.gitignore` in separate commit |
| 5 | `periodToDays` re-export removed from `rendering/pages.ts` | Done | Verify no downstream breakage |

### 3. Import Consistency Sweep

Run a grep across the codebase for any stale import patterns that should have
been updated:

```bash
# Web — should find zero matches
grep -r "from '\.\.\/auth\.js'" apps/web/src/
grep -r "from '\.\.\/db\.js'" apps/web/src/
grep -r "from '\.\.\/routes\.js'" apps/web/src/
grep -r "from '\.\.\/scoring\.js'" apps/web/src/
grep -r "from '\.\.\/ingestion\.js'" apps/web/src/

# Desktop — should find zero matches
grep -r "from '\.\/helpers\.js'" apps/desktop/src/
grep -r "from '\.\/brand\.js'" apps/desktop/src/
grep -r "from '\.\/export-svg\.js'" apps/desktop/src/
grep -r "from '\.\/menubar\.js'" apps/desktop/src/
grep -r "from '\.\/preferences\.js'" apps/desktop/src/
grep -r "from '\.\/tauri-bridge\.js'" apps/desktop/src/
grep -r "from '\.\/error-handler\.js'" apps/desktop/src/
grep -r "from '\.\/runtime-status\.js'" apps/desktop/src/
grep -r "from '\.\/env-config\.js'" apps/desktop/src/
```

### 4. Behavioral Verification Beyond Tests

The test suites cover HTTP routing, OAuth flow, snapshot computation, and
Tauri bridge resolution. Codex should manually verify:

- Desktop server bootstrap path (main `index.ts` request dispatch) — ensure
  no route regression from the import reshuffling
- Menubar HTML generation — `shell/menubar.ts` imports from `rendering/helpers.js`
  and `rendering/brand.js`; verify no broken template logic
- Web `createApp()` — the handler closure uses `DEFAULT_TEAM_ID` from
  `app/config.js` (was a top-level const in old `index.ts`); confirm env var
  resolution is identical

### 5. Test File Path Update

`apps/web/src/index.test.ts` was updated but the compiled `dist/` may be stale
in CI environments. Verify:

```bash
npm run build   # should rebuild dist/ with correct import paths
npm run test    # should re-run all 20 web tests
```

---

## Files Changed Summary

| Package | Files Deleted | Files Created | Files Modified |
|---|---|---|---|
| `apps/web/src` | 5 (`auth.ts`, `db.ts`, `ingestion.ts`, `routes.ts`, `scoring.ts`) | 9 (`app/3`, `auth/3`, `leaderboard/2`, `routing/1`, `storage/1` — note: 1 already existed as copy) | 4 (`index.ts`, `index.test.ts`, `rendering/pages.ts`, `rendering/components.ts`) |
| `apps/desktop/src` | 14 (root-level files moved into subfolders) | 14 (copies in new locations, originals deleted) | 8 (`index.ts`, `handlers/*.ts`, `rendering/*.ts`) |
| `packages/cli/src` | 3 (`output.ts`, `commands/types.ts`, `commands/utils.ts`) | 3 (`shared/output.ts`, `shared/types.ts`, `shared/utils.ts`) | 8 (`index.ts`, `commands/*.ts`) |
| `packages/core/src` | 0 | 0 | 0 |

**Net:** 42 source files touched, 0 new runtime dependencies introduced,
0 behavior changes.

---

## Suggested Next Steps (in priority order)

1. **Run the import consistency sweep** (Section 3 above) — 5 minutes
2. **Manual desktop smoke test** — start the app, verify overview/analytics pages load
3. **Assess item #2** (GET mutates DB) — decide if this warrants a follow-up issue
4. **Add `*.tsbuildinfo` to `.gitignore`** — separate commit, no risk
5. **Commit and push** — the reorg is a single logical unit, recommend one commit

---

## Report Location

- Spec: `docs/spec-kit/SPEC-KIT-QWEN-REPO-REORGANIZATION-AND-WEB-GUARDRAILS-2026-04-13.md`
- Qwen report: `docs/spec-kit/SPEC-KIT-QWEN-REPO-REORGANIZATION-REPORT-2026-04-13.md`
- This handoff: `docs/spec-kit/SPEC-KIT-QWEN-REPO-REORG-CODEX-ASSESSMENT-2026-04-13.md`
