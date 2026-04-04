# Implementation Plan: Monitoring And Glanceable UX

**Branch**: `003-monitoring-and-glanceable-ux` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-monitoring-and-glanceable-ux/spec.md`

## Summary

The product already has the right core and enough data to be useful. The next
phase should not widen scope into more providers or cloud sync. It should make
the existing product feel more like a daily monitoring tool by improving
glanceability, reset communication, analytics readability, and filter
interaction quality.

This phase is explicitly execution-oriented for OpenCode. The implementation
must be sliced, validated, and documented in sequence.

## Mandatory Agent Workflow

OpenCode must execute the phase in this order and must not improvise its own
process:

1. `agent-orchestrator`
2. `agent-impeccable`
3. `agent-implementer`
4. `agent-tester`
5. `agent-reviewer`

### Agent Responsibilities

- `agent-orchestrator`: break the phase into concrete implementation slices,
  map files to touch, define validation for each slice, and prevent roadmap
  drift before edits begin
- `agent-impeccable`: define the UI/UX direction for compact monitoring,
  analytics hierarchy, empty states, visual grouping, and responsive behavior
- `agent-implementer`: apply the approved changes in repo style without
  rewriting the stack
- `agent-tester`: run route/build/smoke verification for each completed slice
- `agent-reviewer`: perform a final code-quality and regression review before
  declaring the phase ready

## Technical Context

**Language/Version**: TypeScript 5.8, Node.js 24.x, Rust for Tauri wrapper  
**Primary Dependencies**: existing workspace packages, current server-rendered
desktop shell, Tauri v2 wrapper  
**Storage**: local SQLite at `.ttm/ttm.sqlite`; local app config only if a
small preferences surface is introduced  
**Testing**: `npm run typecheck`, `npm run build`, route checks, Tauri smoke,
targeted interaction checks  
**Target Platform**: macOS first  
**Project Type**: local-first desktop/menu bar product + CLI on one shared core  
**Performance Goals**: overview and menu bar remain fast; analytics visuals stay
lightweight and readable on local machines  
**Constraints**: no architecture rewrite, no speculative providers, no cloud
dependency, no privacy regression  
**Scale/Scope**: UX and monitoring productization on top of shipped 002 work

## Constitution Check

- Local-first privacy preserved: pass
- Shared-core architecture preserved: pass
- Explainable analytics preserved: pass
- Vertical-slice delivery preserved: pass
- Evidence before claims preserved: pass

## Project Structure

### Documentation (this feature)

```text
specs/003-monitoring-and-glanceable-ux/
├── plan.md
├── spec.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── desktop/
│  └── src/
└── desktop-tauri/
   └── src-tauri/

packages/
└── core/
   └── src/
      └── db/
```

**Structure Decision**: Preserve the current monorepo and server-rendered
desktop shell. The work should primarily extend read models and route rendering
inside the current app, with only minimal native-wrapper adjustments if needed.

## Delivery Phases

### Phase 1 - Monitoring UX Architecture Lock

- inspect current overview, analytics, and menu bar surfaces
- define the exact monitoring hierarchy and compact-view priorities
- identify any read-model additions needed for reset clarity or chart-friendly
  rendering
- lock slice boundaries before editing

### Phase 2 - Menu Bar And Reset UX

- improve the compact `/menubar` surface into a more glanceable monitor
- strengthen provider status groupings and top-level summary hierarchy
- improve reset-window wording and display on compact and overview surfaces
- preserve current navigation into the full dashboard

### Phase 3 - Analytics Visual Layer

- add lightweight visual summaries to `/analytics`
- preserve existing tables where they still add value
- ensure empty, sparse, and high-volume states remain readable

### Phase 4 - Filter Interaction Polish

- refine overview filter state communication
- improve active-filter clarity, reset affordances, and zero-result behavior
- keep pagination stable under combined filter changes

### Phase 5 - Monitoring Preferences

- add a minimal local-only settings or preference mechanism if justified
- keep the scope narrow: refresh cadence, default window, or similarly small
  monitoring controls only
- avoid daemon or background-task sprawl

### Phase 6 - Docs, Validation, And Review

- update roadmap and product docs to match shipped behavior
- run full validation from the quickstart
- perform a final review before handoff

## Guardrails

- Do not add Cursor or Claude implementation work here.
- Do not replace the current Node-rendered desktop shell with React/Vite/Next.
- Do not introduce cloud sync, accounts, or leaderboards.
- Do not change the CLI surface unless required to support the UX slice.
- Do not mark docs complete until validation is complete.
- Prefer extending existing read-service and route patterns over introducing new
  data flow models.

## Complexity Tracking

This phase intentionally increases UI density and presentation complexity, but
not architecture complexity. Any new complexity must be justified by clearer
monitoring behavior on already-supported providers.
