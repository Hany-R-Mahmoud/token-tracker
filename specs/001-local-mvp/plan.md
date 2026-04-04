# Implementation Plan: Local-First MVP Completion

**Branch**: `001-local-mvp` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-local-mvp/spec.md`

## Summary

Continue the local-first MVP from the current baseline. The repo already has a
shared TypeScript core, local SQLite persistence, Codex import, OpenCode import,
and a usable CLI. This feature finishes the remaining MVP path by tightening the
CLI trust layer, validating the next provider path safely, and adding the first
desktop dashboard shell that reads the same local store.

## Technical Context

**Language/Version**: TypeScript 5.8, Node.js 24.x  
**Primary Dependencies**: TypeScript workspace packages, Node built-in
`node:sqlite`, OpenCode CLI, Specify CLI  
**Storage**: Local SQLite database at workspace-local `.ttm/ttm.sqlite` for dev  
**Testing**: `tsc -b`, targeted CLI runs, desktop shell smoke checks  
**Target Platform**: macOS first  
**Project Type**: local-first desktop app + CLI with shared analytics core  
**Performance Goals**: local import and summary commands stay usable on a
single developer machine; summary and session listing should complete in a few
seconds against current local data size  
**Constraints**: offline-capable core, no prompt/code persistence, explainable
analytics only, no cloud dependency for this feature  
**Scale/Scope**: current repo baseline plus one additional provider validation
path and one first desktop shell

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Local-first privacy preserved: pass
- Shared-core architecture preserved: pass
- Explainable analytics preserved: pass
- Vertical slice delivery preserved: pass
- Evidence before claims preserved: pass

## Project Structure

### Documentation (this feature)

```text
specs/001-local-mvp/
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
      ├── domain/
      ├── pricing/
      └── utils/

docs/
├── architecture/
└── specs/
```

**Structure Decision**: Keep the current monorepo. All provider importers,
storage, pricing, and analytics remain in `packages/core`. CLI work stays in
`packages/cli`. The first desktop shell stays in `apps/desktop`.

## Complexity Tracking

No constitutional violations are planned for this feature.
