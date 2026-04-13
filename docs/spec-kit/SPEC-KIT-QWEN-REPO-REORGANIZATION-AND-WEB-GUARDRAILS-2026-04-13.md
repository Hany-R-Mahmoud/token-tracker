# SPEC-KIT: Qwen Repo Reorganization And Web Guardrails

**Date:** 2026-04-13  
**Authors:** Codex using `agent-orchestrator` and official Next.js docs  
**Audience:** Qwen Code  
**Purpose:** Execute a safe, phased reorganization of the repo with strong
React and Next.js guardrails, while preserving current behavior and avoiding a
framework migration disguised as cleanup

---

## Goal Summary

This pass exists to make the repo easier to navigate, reason about, and evolve
without breaking the current product.

The immediate problem is structural, not feature-related:

- `apps/web/src` is too flat and mixes bootstrap, auth, routing, persistence,
  domain logic, and HTML rendering in the same layer
- `apps/desktop/src` is flatter than it should be for the amount of shell,
  server, rendering, runtime, and preferences logic it now holds
- generated/build artifacts are present in the tree and should not drive source
  organization decisions
- `packages/core` is mostly the healthiest package already and should be
  reorganized only where the move is clearly justified
- the repo should become easier to migrate toward a proper Next.js App Router
  web surface later, but this pass must **not** attempt that migration

This is a structure-and-boundaries pass first.

Do not treat it as a redesign, product rewrite, or framework conversion.

---

## Source Of Truth

Read these first:

- `/Users/hanyramadan/token traker/AGENTS.md`
- `/Users/hanyramadan/token traker/package.json`
- `/Users/hanyramadan/token traker/apps/web/package.json`
- `/Users/hanyramadan/token traker/apps/web/src/index.ts`
- `/Users/hanyramadan/token traker/apps/web/src/auth.ts`
- `/Users/hanyramadan/token traker/apps/web/src/routes.ts`
- `/Users/hanyramadan/token traker/apps/web/src/db.ts`
- `/Users/hanyramadan/token traker/apps/web/src/ingestion.ts`
- `/Users/hanyramadan/token traker/apps/web/src/scoring.ts`
- `/Users/hanyramadan/token traker/apps/web/src/rendering/pages.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar-data.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/handlers/routes.ts`
- `/Users/hanyramadan/token traker/packages/core/src/index.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts`
- `/Users/hanyramadan/token traker/packages/cli/src/index.ts`
- `/Users/hanyramadan/token traker/specs/018-phase-016-gap-audit-and-closure/spec.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`

Official guidance informing the web guardrails:

- Next.js project structure:
  [https://nextjs.org/docs/app/getting-started/project-structure](https://nextjs.org/docs/app/getting-started/project-structure)
- Next.js Server and Client Components:
  [https://nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- Next.js error handling:
  [https://nextjs.org/docs/app/getting-started/error-handling](https://nextjs.org/docs/app/getting-started/error-handling)
- Next.js production checklist:
  [https://nextjs.org/docs/app/guides/production-checklist](https://nextjs.org/docs/app/guides/production-checklist)

---

## Current Repo Diagnosis

### What looks healthy already

- `packages/core/src` already has meaningful domain-aligned folders:
  `adapters`, `analysis`, `db`, `domain`, `leaderboard`, `pricing`, `utils`
- `packages/cli/src/commands` is already a good top-level boundary
- the existing `specs/` and `docs/handoffs/` process is consistent and should
  be preserved

### What is creating avoidable cognitive load

- `apps/web/src/index.ts` currently owns too much:
  - HTTP bootstrap
  - headers
  - rate limiting
  - auth flow wiring
  - cookie/session resolution
  - route dispatch
  - page rendering orchestration
- `apps/web/src` mixes platform concerns and product concerns in the same level
- `apps/desktop/src` mixes:
  - desktop HTTP bootstrap
  - native shell concerns
  - route handlers
  - rendering
  - preferences/runtime wiring
  - style system
- build output folders such as `dist/`, `node_modules/`, and
  `*.tsbuildinfo` exist in app/package trees and can distract cleanup unless
  handled explicitly

### Key architectural judgment

The repo does **not** need a deep, enterprise-style folder explosion.

The right move is:

- reduce flattening
- sharpen boundaries
- keep paths boring and predictable
- preserve current package boundaries
- create a source layout that would make a future Next.js App Router migration
  cleaner, without doing that migration now

---

## Scope

### In scope

- reorganize source files inside existing packages/apps
- introduce clearer folder boundaries inside `apps/web/src`
- introduce clearer folder boundaries inside `apps/desktop/src`
- keep `packages/core` mostly stable and only tighten boundaries where clearly
  helpful
- keep `packages/cli` simple while reducing top-level clutter if needed
- normalize import paths after moves
- update docs or READMEs only where organization claims become stale
- produce a final report with exact moved files, validation evidence, and any
  remaining debt

### Out of scope

- migrating `apps/web` to Next.js in this pass
- redesigning the product UI
- changing public behavior or route contracts unless absolutely required
- renaming domain concepts just for aesthetics
- large-scale abstraction creation
- introducing dependency injection frameworks, service locators, or type-heavy
  architecture
- moving working code into new layers that do not pay for themselves

---

## Non-Negotiable Constraints

1. This is a **behavior-preserving refactor** first.
2. Reorganize one bounded area at a time, not the whole repo in one jump.
3. After each workstream, restore green `build` and `typecheck` before
   continuing.
4. Do not mix “move files around” with “rewrite behavior” in the same step when
   it can be avoided.
5. Do not turn `packages/core` into a dumping ground for app-specific logic.
6. Do not move desktop-only logic into shared packages unless it is truly shared
   and currently duplicated.
7. Do not convert the current web app into a pseudo-Next structure unless the
   file move remains valid in the current Node/TS setup.
8. Do not leave broad temporary barrels that hide ownership.
9. Do not keep stale import aliases, dead files, or compatibility shims longer
   than needed for the pass.
10. Do not claim success if source organization improved but validation regressed.

---

## Preferred End-State

The goal is clearer feature and platform boundaries, not more folders for their
own sake.

### Target shape for `apps/web/src`

```text
apps/web/src/
  app/
    config.ts
    create-app.ts
    server.ts
  auth/
    cookies.ts
    github-oauth.ts
    session.ts
  leaderboard/
    ingestion.ts
    scoring.ts
    service.ts
  rendering/
    components.ts
    pages.ts
  routing/
    parse-url.ts
    handlers.ts
  storage/
    db.ts
  index.ts
  index.test.ts
```

### Target shape for `apps/desktop/src`

```text
apps/desktop/src/
  app/
    bootstrap.ts
    server-bootstrap.ts
    security-headers.ts
  handlers/
    export.ts
    index.ts
    preferences.ts
    refresh.ts
    routes.ts
    runtime-status.ts
    summary.ts
  rendering/
    analytics.ts
    layout.ts
    overview.ts
  runtime/
    env-config.ts
    error-handler.ts
    runtime-status.ts
    tauri-bridge.ts
  shell/
    active-surface-resolver.ts
    menubar.ts
    menubar-data.ts
    preferences.ts
  styles/
    base.ts
    data-display.ts
    index.ts
    layout.ts
    menubar.ts
    surface.ts
    tokens.ts
    utilities.ts
  index.ts
```

### Target shape for `packages/cli/src`

```text
packages/cli/src/
  commands/
  shared/
    output.ts
    types.ts
    utils.ts
  index.ts
```

### Target shape for `packages/core/src`

Keep mostly as-is unless a move removes real confusion:

```text
packages/core/src/
  adapters/
  analysis/
  db/
  domain/
  leaderboard/
  pricing/
  utils/
  index.ts
```

---

## Ordered Execution Plan

### Phase 0: Baseline And Safety Net

Before moving anything:

- inventory every source file under:
  - `apps/web/src`
  - `apps/desktop/src`
  - `packages/cli/src`
  - `packages/core/src`
- identify generated artifacts currently present in-tree:
  - `dist/`
  - `node_modules/`
  - `*.tsbuildinfo`
- record current validation baseline:
  - `npm run typecheck`
  - `npm run build`
- note any existing failures before the refactor so they are not misattributed

Guardrails:

- do not start moving source files before knowing whether baseline already
  fails
- if generated artifacts are tracked or polluting diffs, clean that up in a
  bounded commit first or explicitly exclude them from the reorg pass

### Phase 1: Web App Boundary Cleanup

This is the highest-value source cleanup because `apps/web/src/index.ts` is
overloaded.

Required breakdown:

1. Extract bootstrap-only responsibilities into `app/`
2. isolate auth/session/cookie concerns into `auth/`
3. isolate route parsing/dispatch into `routing/`
4. isolate persistence adapter into `storage/`
5. keep HTML rendering in `rendering/`
6. keep leaderboard-specific logic together under `leaderboard/`

Expected result:

- `apps/web/src/index.ts` becomes a thin entrypoint
- request lifecycle is easier to trace
- auth logic is no longer mixed with HTML/page dispatch code

Guardrails:

- do not change route paths while reorganizing
- do not rewrite auth behavior unless a move makes a bug unavoidable
- do not merge server bootstrap and rendering into one module again
- avoid creating a “services” folder unless more specific names fail

### Phase 2: Desktop App Boundary Cleanup

The desktop app should separate shell/runtime/bootstrap concerns more clearly.

Required breakdown:

1. move shell-facing logic into `shell/`
2. move runtime/environment/error/bridge logic into `runtime/`
3. keep HTTP handlers under `handlers/`
4. keep UI composition under `rendering/`
5. keep style-system files in `styles/`
6. keep `index.ts` as orchestration, not the home for every implementation
   detail

Guardrails:

- do not split cohesive files just to satisfy a folder diagram
- if a file is already correctly placed, leave it
- do not move cross-package shared business logic out of `packages/core`
- do not break Tauri bridge or tray behavior while renaming files

### Phase 3: CLI And Shared Package Hygiene

This phase is intentionally light.

For `packages/cli`:

- move `output.ts`, `types.ts`, and `utils.ts` under a small `shared/` folder
  only if that clearly improves discoverability
- keep commands boring and direct

For `packages/core`:

- leave the current high-level structure intact unless a specific file is
  clearly misplaced
- prefer rename/move only when the new location makes ownership more obvious

Guardrails:

- no “core/platform/common/shared/base” folder sprawl
- no speculative abstractions
- no moving app-specific rendering or shell concerns into shared packages

### Phase 4: Import And Naming Normalization

After the moves:

- normalize import paths
- remove dead exports
- remove stale compatibility shims if they were only temporary
- ensure filenames match the repo’s existing naming style

Guardrails:

- avoid barrel files unless the package already uses them intentionally
- do not hide ownership with a broad `index.ts` in every folder

### Phase 5: Documentation And Report Back

Update only the documentation made stale by the reorg:

- file-path references in docs if they were changed
- developer-facing notes if startup/ownership paths moved

Then write the final report to the required path.

---

## React Guardrails

These apply during the reorg even though this pass is not a UI rewrite.

1. Keep render components as pure as possible.
2. Move side effects and environment access toward boundary modules.
3. Keep state close to where it is used; lift state only when multiple siblings
   truly need it.
4. Prefer composition over prop drilling and over monolithic page modules.
5. Use custom hooks only when logic is genuinely reused or meaningfully
   isolated; do not create hooks as a cosmetic wrapper.
6. Keep loading, empty, and error states explicit.
7. Keep derived state derived; do not store values that can be computed from
   existing state/props.
8. Avoid inline data shaping inside JSX when it hides important logic.
9. Controlled forms remain the default when form state matters.
10. Keep async error handling user-safe and avoid leaking internals.

---

## Next.js Guardrails For Future-Proofing

These rules are to shape the reorganization so a future Next.js migration is
cleaner. They do **not** authorize a migration in this pass.

Grounded in official Next.js docs:

- Next.js App Router is file-convention-based and allows safe colocation of
  non-routable code until `page` or `route` files exist.
- Layouts and pages are Server Components by default.
- `use client` should be added only at intentional client boundaries.
- route-level `error`, `loading`, and `not-found` files are first-class
  patterns.
- Request-time APIs and client boundaries must be intentional because they
  affect rendering and caching behavior.

Future-proof rules:

1. If the web app later migrates to Next.js, prefer `src/app` over a root-level
   `app` folder so config stays clean at the monorepo root.
2. Keep route concerns separate from reusable code so they can map cleanly into
   `app/**/page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, and `error.tsx`.
3. Keep non-routable helpers colocatable via private folders such as
   `_components`, `_lib`, or `_hooks` if App Router is adopted later.
4. Keep “server-only” code clearly separated from browser-only code so future
   `server-only` or `client-only` markers are straightforward.
5. Do not design future web modules assuming everything is client-rendered.
6. If a future Next.js route needs interactivity, isolate it into the smallest
   possible client boundary instead of marking whole trees with `use client`.
7. Do not plan for Server Components calling Route Handlers internally; when
   Next.js is adopted, server-side data access should go straight to the data
   layer.
8. Preserve room for route-level fallbacks:
   - `loading.tsx`
   - `error.tsx`
   - `not-found.tsx`
9. Keep providers as deep as possible if/when they exist, rather than wrapping
   the entire document without need.
10. When the project eventually adopts Next.js features, prefer built-ins such
    as `next/link`, `next/image`, `next/font`, and Metadata API rather than
    recreating them manually.

---

## Detailed File Breakdown Guidance

### `apps/web/src/index.ts`

Target outcome:

- keep only startup wiring and `createApp()` invocation here
- move helper logic out if it is not entrypoint-specific

### `apps/web/src/auth.ts`

Break apart if needed into:

- cookie parsing/building
- OAuth client creation/exchange
- session cookie helpers
- origin/redirect resolution

Do not leave one auth file that also behaves like transport glue.

### `apps/web/src/routes.ts`

Keep route parsing separate from request handling if that improves clarity.

Route parsing should not also become the place for auth or rendering decisions.

### `apps/web/src/db.ts`

This should remain a storage boundary, not a dumping ground for service logic.

### `apps/web/src/ingestion.ts` and `apps/web/src/scoring.ts`

These belong together under a feature-like `leaderboard/` boundary because they
serve the same product area.

### `apps/desktop/src/index.ts`

Reduce it to orchestration and bootstrap. It should not remain the deepest home
for unrelated shell/runtime/server details.

### `apps/desktop/src/menubar.ts`, `menubar-data.ts`,
`active-surface-resolver.ts`

These should live together under a shell-oriented boundary.

### `apps/desktop/src/env-config.ts`, `error-handler.ts`,
`runtime-status.ts`, `tauri-bridge.ts`

These should be grouped around runtime/platform integration, not mixed with
rendering and shell files.

### `packages/core/src`

Move only when the destination is obviously better. This package already has
the best boundaries in the repo and should not be churned casually.

---

## Agent Routing

Qwen should use the minimum specialist set required, in this order:

1. `agent-orchestrator`
   - confirm current file inventory
   - decide exact sequence of work
   - split the pass into small behavior-preserving batches

2. `agent-architect`
   - sanity-check the proposed source boundaries
   - reject unnecessary folder sprawl
   - confirm package ownership stays clean

3. `agent-implementer`
   - execute file moves, import fixes, and bounded cleanup

4. `agent-debugging`
   - only if moves trigger path-resolution, runtime bootstrap, or shell wiring
     regressions

5. `agent-security`
   - only if auth, cookies, env handling, or trust boundaries are moved in a
     way that could weaken them

6. `agent-tester`
   - run validation after each workstream
   - verify no behavior regressions

7. `agent-reviewer`
   - inspect for hidden regressions, broken imports, architectural backsliding,
     and accidental complexity

8. `agent-docs`
   - update stale file references
   - write the final report artifact

Do not parallelize overlapping file-move work across agents when they touch the
same subtree.

---

## Validation Requirements

Qwen must provide evidence for:

1. baseline `npm run typecheck`
2. baseline `npm run build`
3. post-reorg `npm run typecheck`
4. post-reorg `npm run build`
5. any targeted tests that fail or need updates because of file moves
6. exact before/after file ownership for the reorganized areas
7. proof that public behavior and route contracts remained stable, or an exact
   explanation if one change was unavoidable

If a step fails, Qwen must stop and report the failing phase rather than
pretending the cleanup is complete.

---

## Required Report Output

Write a Markdown report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-REPO-REORGANIZATION-REPORT-2026-04-13.md`

The report must include:

1. **Summary**
2. **Baseline Status**
3. **Files Moved And New Structure**
4. **Architecture Decisions**
5. **Validation Commands And Results**
6. **What Stayed Intentionally Unchanged**
7. **Remaining Debt Or Follow-Ups**
8. **Explicit completion statement**

---

## Completion Statement Rules

End the report with one of:

- `Repo reorganization pass is complete.`
- `Repo reorganization pass remains partial because ...`

Use `complete` only if:

- the planned reorganization scope actually landed
- build and typecheck pass after the moves
- the final structure is simpler than before
- no critical regression remains open

---

## Packaging Recommendation

This should remain a Qwen-specific execution brief for a bounded refactor pass.

Do not split it into multiple independent prompts unless Qwen proves the repo
needs separate:

- web reorganization
- desktop reorganization
- docs reconciliation

If the pass grows beyond one clean execution window, split by subtree, not by
arbitrary agent preference:

1. `apps/web`
2. `apps/desktop`
3. docs/import cleanup
