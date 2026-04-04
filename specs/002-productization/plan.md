# Implementation Plan: Productization And Source Parity

**Branch**: `002-productization` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-productization/spec.md`

## Summary

The local-first MVP is complete enough to productize. The next step is not more
foundation work; it is parity, packaging, and trust. This feature closes the
biggest visible product gaps by validating alternate provider source strategies,
wrapping the current dashboard in a native shell, adding richer analytics, and
creating a comparison workflow against open-source reference apps.

## Technical Context

**Language/Version**: TypeScript 5.8, Node.js 24.x  
**Primary Dependencies**: current workspace packages, native wrapper runtime
(likely Tauri v2), browser-cookie or session-source helpers where needed  
**Storage**: local SQLite at `.ttm/ttm.sqlite`; optional provider-specific cache
directories under app-local config if needed  
**Testing**: `tsc -b`, CLI verification, native wrapper smoke checks, comparison
artifact generation, route/UI verification  
**Target Platform**: macOS first  
**Project Type**: local-first desktop/menu bar product + CLI with one shared
analytics core  
**Performance Goals**: local dashboard and compact tray view remain responsive;
provider refresh stays practical on a single developer machine  
**Constraints**: privacy-first defaults, evidence before provider claims,
minimal prompt persistence, no surprise cloud dependency  
**Scale/Scope**: evolve the current MVP into a daily-drivable native product

## Constitution Check

- Local-first privacy preserved: pass
- Shared-core architecture preserved: pass
- Explainable analytics preserved: pass
- Vertical slice delivery preserved: pass
- Evidence before claims preserved: pass

## Project Structure

### Documentation (this feature)

```text
specs/002-productization/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
└── desktop/
   └── src/

packages/
├── cli/
│  └── src/
└── core/
   └── src/
      ├── adapters/
      ├── analysis/
      ├── db/
      ├── pricing/
      └── utils/
```

**Structure Decision**: Preserve the current monorepo and current HTTP-shell
dashboard while introducing a native wrapper around it. Provider-source parity,
comparison logic, analytics views, and export all stay on top of the shared
core.

## Delivery Phases

### Phase 1 - Source Strategy And Provider Parity

- document the alternate source strategy for Cursor
- test whether browser-cookie / provider-web sourcing is feasible on this
  machine
- implement the source path only if it is verifiable
- keep Claude honest until a real source is proven

### Phase 2 - Native Wrapper And Real Menu Bar

- wrap the current dashboard in a native macOS shell
- host or embed the current compact summary view
- add a true tray / menu bar entry
- verify open-dashboard flow from the menu bar

### Phase 3 - Comparative Trust Harness

- define a local comparison snapshot format
- add a workflow for comparing our readings against reference apps
- generate evidence artifacts for provider totals, resets, and discrepancies

### Phase 4 - Product Analytics And Export

- add trend and model/provider breakdown views
- add export of normalized analytics data
- keep outputs privacy-safe and transcript-light

## Complexity Tracking

The only intentional complexity increase is introducing a native wrapper and
alternate provider-source strategies. This is justified because the MVP has
already proven the shared core, and the remaining gaps are product-shaping
rather than foundational.
