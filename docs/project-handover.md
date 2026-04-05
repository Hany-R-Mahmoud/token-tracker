# Token Tracker Project Handover

Last updated: 2026-04-05

## Purpose

This file is the high-signal handover artifact for the Token Tracker project.
It is meant to help a new engineer, agent, or future session understand:

- what the product is
- what has been built so far
- how the roadmap evolved
- where the project stands right now
- how Token Tracker compares to the reference products
- what is finished, what is still missing, and what is currently blocked
- what the next logical execution tracks are

This document favors honest product state over optimistic roadmap language.

## Product Summary

Token Tracker is a **local-first usage intelligence and monitoring product**
for AI coding tools. It is designed to go beyond basic "tokens used" reporting
and answer:

- was the spend efficient?
- where is waste happening?
- which providers or models are underperforming?
- how do individual sessions roll up into trends and outcomes?

The project currently spans four main surfaces:

- **CLI** for power users and automation
- **Desktop shell** for overview, analytics, and session inspection
- **Native macOS wrapper** for tray/menu bar behavior
- **Private team leaderboard web app** for opt-in team comparison

## Product Thesis

Most usage tools answer:

- how many tokens were used
- how much they cost
- when limits reset

Token Tracker is trying to answer:

- whether the consumption was worth it
- what the spend produced
- where patterns of waste or efficiency are emerging
- how to monitor usage locally without giving up privacy

## Current Design Context

The repo includes a design context in
`/Users/hanyramadan/token traker/.impeccable.md`.

Current intended tone:

- bold
- energetic
- modern
- technical
- approachable

Current audience:

- developers
- technical leads
- users who want quick-glance monitoring plus deeper local investigation

## Architecture Snapshot

### Shared Core

Path: `/Users/hanyramadan/token traker/packages/core`

Owns:

- canonical session types and domain model
- provider adapters
- pricing engine
- analysis heuristics and explanation factors
- SQLite storage
- analytics read models
- comparison snapshot support

### CLI

Path: `/Users/hanyramadan/token traker/packages/cli`

Current command surface:

- `ttm doctor`
- `ttm providers`
- `ttm import`
- `ttm summary`
- `ttm sessions`
- `ttm analyze <id>`
- `ttm export [path] [--days N]`
- `ttm compare-snapshot --provider <id> ...`

### Desktop Shell

Path: `/Users/hanyramadan/token traker/apps/desktop`

Current routes:

- `/` overview
- `/?session=<id>` session detail
- `/analytics`
- `/menubar`
- `/api/summary`
- `/api/analytics`
- `/export/analytics-svg`

### Native Wrapper

Path: `/Users/hanyramadan/token traker/apps/desktop-tauri`

Current role:

- tray/menu bar shell
- dashboard window
- menubar popover window
- tray title / tooltip integration

### Team Leaderboard Web App

Path: `/Users/hanyramadan/token traker/apps/web`

Current role:

- opt-in team leaderboard
- GitHub identity/session flow
- settings
- leaderboard snapshots
- privacy-safe member comparison

## Roadmap History So Far

This section compresses the work completed through Phases 001–008 into a
single readable timeline.

### Phase 001: Local MVP

Intent:

- prove the local-first product shape
- build the first end-to-end usage intelligence loop

Delivered:

- shared SQLite-backed local store
- Codex ingestion
- OpenCode ingestion
- CLI foundation
- desktop HTTP shell
- overview, analytics, session detail, and initial menubar surface

Outcome:

- Token Tracker became a real local product, not just a concept

### Phase 002: Productization

Intent:

- make the MVP feel more like a usable product
- improve parity on analytics and monitoring basics

Delivered:

- better monitoring UX
- reset visibility
- filter UX
- heatmap
- cache-efficiency visualization
- dark mode support
- analytics export improvements
- provider status surfacing

Outcome:

- the product became more credible as a daily-use tool

### Phase 003: Monitoring And Glanceable UX

Intent:

- strengthen live monitoring and compact-surface usefulness

Delivered:

- file watching
- refresh state indicators
- countdown UX
- heuristic session/weekly meters
- preferences persistence

Outcome:

- monitoring became more ambient and more reliable

### Phase 004: Competitive Parity Program

Intent:

- close the highest-value gaps versus AI Token Monitor and CodexBar without
  abandoning the local-first thesis

Delivered:

- better parity language
- stronger monitoring and provider-status flows
- analytics/time-window improvements
- leaderboard data-bridge groundwork

Outcome:

- Token Tracker became easier to compare honestly to the public benchmark apps

### Phase 005: Team Leaderboard

Intent:

- add a private, opt-in team leaderboard with privacy safeguards

Delivered:

- separate web app at `localhost:3200`
- home, settings, leaderboard routes
- period-aware snapshots
- composite scoring
- member detail drawer
- session management scaffolding
- admin API protection

Outcome:

- the project expanded from individual usage intelligence to optional team
  visibility

### Phase 006: Open Gaps And Hardening

Intent:

- close known high-value gaps and remove misleading product claims

Delivered:

- SVG analytics export
- member detail drawer hardening
- honest meter semantics
- provider support closure language
- widget feasibility closure

Outcome:

- the repo became much more honest about what is real, heuristic, blocked, or
  explicitly out of scope

### Phase 007: Rich Menubar Insights And Command Center

Intent:

- turn the menubar from a thin launcher into a more meaningful command center

Status:

- **implementation appears to be in progress in the working tree**
- spec exists at:
  `/Users/hanyramadan/token traker/specs/007-rich-menubar-insights-and-command-center/`
- repo code indicates active menubar redesign work and native tray-title work
- docs such as `README.md` have not yet been fully reconciled to the richer
  Phase 007 state

What this means:

- the project likely has more menubar capability in code than the current
  public docs describe
- anyone inheriting the project should inspect the live code before trusting
  the README-level menubar summary

### Phase 008: Visual System And Brand Refresh

Intent:

- give Token Tracker its own differentiated visual identity
- increase graph richness and design sophistication
- introduce a new logo and brand system

Status:

- **planned / spec-ready, not implemented yet**
- spec kit exists at:
  `/Users/hanyramadan/token traker/specs/008-visual-system-and-brand-refresh/`

Current Phase 008 direction:

- concept: `Prism Forge`
- goal: turn Token Tracker into a graph-rich decision cockpit
- primary design tools:
  - Stitch for design generation
  - OpenCode for implementation
  - `agent-impeccable` as design lead

## Current Product Status

### Finished Or Working

- shared core data model and local storage
- Codex adapter
- OpenCode adapter
- pricing transparency with honest unknown-cost handling
- heuristic analysis and explanation factors
- CLI command surface
- desktop overview, analytics, session detail
- JSON export and SVG analytics export
- comparison snapshot harness
- dark mode foundation
- provider incident/status layer
- team leaderboard web app
- member detail drawer
- Tauri tray/menu bar wrapper

### In Progress

- richer menubar/command-center UX from Phase 007
- docs reconciliation for the newer menubar state
- Phase 008 visual-system planning and handoff

### Planned But Not Started

- Phase 008 design generation and implementation
- new logo/icon rollout
- deeper visual-system unification across all surfaces

## Provider State

| Provider | Status | Reality |
|---|---|---|
| Codex | Validated | working local ingestion; includes quota/reset data |
| OpenCode | Validated | working local ingestion; no quota truth available |
| Cursor | Strategy pending | local auth token found, but no validated usage/quota/session surface |
| Claude | Unavailable | no validated local session source in this repo |

## Honest Comparison To Reference Products

Reference source:

- `/Users/hanyramadan/token traker/docs/reference-products.md`

### What AI Token Monitor Represents

- strong benchmark for analytics visuals
- strong benchmark for dashboard readability
- strong benchmark for multi-theme visual polish

### What CodexBar Represents

- strongest benchmark for ambient menubar UX
- strongest benchmark for reset clarity
- strongest benchmark for compact density and signaling

### Where Token Tracker Is Strong

- local analysis posture
- CLI depth
- comparison harnessing
- privacy-safe export behavior
- session-level drilldown and explanation factors
- provider-status vocabulary
- OpenCode support

### Where Token Tracker Is At Or Near Parity

- real-time local monitoring
- heatmap support
- dark mode foundation
- clipboard export
- menubar/tray existence
- reset countdown UX
- provider-status surfacing

### Where Token Tracker Still Trails

- provider breadth
- screenshot/export richness on some surfaces
- true quota coverage outside Codex
- WidgetKit/Home Screen widget
- fully matured visual identity compared to what Phase 008 is aiming for

### Important Parity Truth

Token Tracker should not blindly chase the reference products.

The project should continue borrowing:

- analytics readability ideas from AI Token Monitor
- ambient UX density ideas from CodexBar

It should continue rejecting:

- provider breadth for its own sake
- stack rewrites just to match implementation style
- cloud-first or social-first moves that weaken the local-first thesis

## What Is Missing

These are the main missing pieces as of this handover.

### Product / Capability Gaps

- Cursor adapter
- Claude adapter
- true quota/reset coverage for more than Codex
- richer screenshot/export coverage across all surfaces
- WidgetKit/Home Screen widget
- final visual-system redesign from Phase 008
- new logo and icon set

### Documentation Gaps

- `README.md` still describes the menubar in older, thinner terms
- current docs do not yet fully reflect the in-progress Phase 007 code path
- Phase 008 exists as a spec kit but has not yet been translated into final
  product docs because it is still a planned track

## Current Blockers

### Hard Technical Blockers

- **Cursor support**: no validated usage/quota/session API surface; gRPC/schema
  uncertainty remains
- **Claude support**: no validated local session source
- **True quota for OpenCode**: source does not expose quota-backed reset data in
  the current repo flow
- **WidgetKit**: would require a parallel Swift/Xcode-native path outside the
  current Tauri-first architecture

### Soft Delivery Blockers

- docs are behind the latest menubar implementation work
- visual ambition for Phase 008 may exceed what the current server-rendered UI
  should absorb in one pass if not staged carefully

## Known Risks

- heuristic analysis can be useful but must not be oversold as ground truth
- provider-source assumptions can drift if local formats change
- visual redesign work could become style-first instead of data-first if not
  kept disciplined
- team features can pull the product away from its strongest local operator
  value if expanded too early

## Current Working Tree Status

At the time this handover was written, the working tree includes active,
uncommitted changes:

- modified:
  - `apps/desktop/src/index.ts`
  - `apps/desktop/src/menubar.ts`
  - `apps/desktop/src/styles.ts`
- untracked:
  - `specs/008-visual-system-and-brand-refresh/`
  - `specs/ui-audit-issues.md`

Implication:

- the repo is not in a "fully reconciled documentation" state
- anyone taking over should inspect the current working tree, not just committed
  docs

## Recommended Next Steps

### Track A: Reconcile The Current Menubar State

- verify the actual Phase 007 behavior end to end
- update `README.md` and any stale docs to match reality
- capture the final accepted Phase 007 status in docs

### Track B: Execute Phase 008

- use the Phase 008 spec kit
- generate design system and screens in Stitch
- choose a final design direction
- hand the chosen direction to OpenCode for implementation

### Track C: Provider Honesty And Narrow Expansion

- continue evidence-first provider research
- only add provider support when a validated source exists
- do not reintroduce vague "in pipeline" claims

### Track D: Docs Discipline

- keep docs aligned with actual shipped behavior
- maintain this handover file whenever a major phase lands

## Files To Read First

If you are taking over the project, start here:

1. `/Users/hanyramadan/token traker/docs/project-handover.md`
2. `/Users/hanyramadan/token traker/README.md`
3. `/Users/hanyramadan/token traker/PROJECT_PLAN.md`
4. `/Users/hanyramadan/token traker/docs/reference-products.md`
5. `/Users/hanyramadan/token traker/docs/handoffs/` — All Codex ↔ OpenCode exchange history

## Handoff Archive Rule

All prompts and reports exchanged between Codex and OpenCode must be saved in:

```
docs/handoffs/<phase>/
```

**Naming convention:**
- `codex-to-opencode-prompt-NN.md` — Prompts from Codex to OpenCode
- `opencode-to-codex-report-NN.md` — Progress reports from OpenCode back to Codex
- `codex-to-opencode-correction-NN.md` — Follow-up correction prompts
- `opencode-to-codex-final-report.md` — Final completion reports

**Rules:**
- Every prompt from Codex to OpenCode must be saved in the handoff archive
- Every report from OpenCode back to Codex must be saved in the handoff archive
- Follow-up correction prompts must also be saved there
- The archive must be updated as part of the workflow, not as an optional cleanup step
- Each phase/spec should keep its own handoff trail together

See `docs/handoffs/README.md` for full details.

## Handover Bottom Line

Token Tracker is already a real local-first product with meaningful depth:

- core ingestion works for Codex and OpenCode
- analysis and monitoring are real
- CLI, desktop, native tray, and web leaderboard surfaces exist
- the project has an honest comparison posture versus reference apps

The project is now entering a new phase:

- finish reconciling the stronger menubar/product polish work
- then give the product a genuinely differentiated visual identity via Phase 008

The most important principle to preserve is this:

**stay local-first, stay honest about data truth, and make the product more
visually powerful without becoming less trustworthy.**
