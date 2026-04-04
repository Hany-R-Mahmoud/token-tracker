# Token Tracker Master Plan

## Positioning

Token Tracker is a **local-first usage intelligence and monitoring product** with surfaces built on one shared core:

- `ttm` CLI for power users and automation
- Desktop web shell for deeper session drill-down, analytics, and monitoring
- Native macOS wrapper (Tauri v2) with tray/menu bar and compact menubar window
- Comparison snapshots against reference apps (CodexBar, AI Token Monitor, Tokscale)
- Glanceable monitoring with health indicators, reset progress, and filter state

Optional cloud sync and team dashboards remain future work.

## Product Thesis

Existing tools answer:

- how many tokens were used
- how much they cost
- when limits reset

This product answers:

- whether the consumption was efficient
- where waste is happening
- which tools or models are underperforming
- how individual sessions roll up into patterns

## Current Architecture

### Shared Core (`packages/core`)

- Canonical session types and domain model
- Provider adapters (Codex ✅, OpenCode ✅, Cursor ⚠️, Claude ❌)
- Static pricing engine with known/unknown pricing transparency
- Session normalization, scoring, and analysis engine
- SQLite storage with explanation factors
- Analytics read models (provider, model, daily buckets)
- Window-scoped export bundle generation

### CLI (`packages/cli`)

- `ttm doctor` — provider health diagnostics with unified strategy status vocabulary
- `ttm providers` — list all known providers and their strategy status
- `ttm import` — incremental session import from available providers
- `ttm summary` — provider-level summary with pricing coverage warnings
- `ttm sessions` — recent sessions with `--provider` and `--limit` filters
- `ttm analyze <id>` — detailed session analysis with explanation factors
- `ttm export [path] [--days N]` — local JSON export of normalized analytics (no raw prompts/transcripts)
- `ttm compare-snapshot --provider <id> [--reference-app <app>] [--ref-* <val>]` — comparison snapshots against reference apps

### Desktop (`apps/desktop`)

Node.js HTTP server serving server-rendered HTML from the shared read service:

- `/` — Overview: provider summaries with reset column, labeled filter form, paginated sessions table
- `/?session=<id>` — Session detail with tokens, cost, efficiency, explanation factors
- `/analytics` — Analytics: provider cost distribution, model token distribution, daily trend charts, model breakdown table, daily activity table
- `/menubar` — Compact monitoring view (320px wide) with health indicator, aggregate bar, per-provider health dots + reset progress bars, 3 recent sessions
- `/api/summary` — JSON API for summary snapshot
- `/api/analytics` — JSON API for analytics snapshot

### Native Wrapper (`apps/desktop-tauri`)

Tauri v2 macOS app wrapping the desktop shell:

- System tray/menu bar entry with app icon
- Tray left-click opens compact menubar window at `/menubar` (360×520, no decorations, always-on-top, skip taskbar)
- "Open Dashboard" menu item focuses the main dashboard window
- "Quit" exits cleanly
- Production bundle produces `Token Tracker.app` and `Token Tracker_0.1.0_aarch64.dmg`

## Provider Status

| Provider | Ingestion | Strategy Status | Notes |
|---|---|---|---|
| Codex | ✅ Working | validated | Parses `~/.codex/sessions/*.jsonl` |
| OpenCode | ✅ Working | validated | Reads `~/.local/share/opencode/opencode.db` |
| Cursor | ❌ Not implemented | strategy pending | Auth token accessible in state.vscdb but no usage API found — gRPC, undocumented |
| Claude | ❌ Not implemented | unavailable | No validated local session source |

## What Ships Now

### Implemented and Verified

- Local SQLite storage with full schema
- Codex and OpenCode incremental import with checkpointing
- Transparent pricing: known models show costs, unknown pricing is surfaced honestly
- Heuristic analysis: efficiency score, waste score, outcome classification, explanation factors
- CLI with doctor, providers, import, summary, sessions, analyze, export, compare-snapshot commands
- Desktop overview with provider summaries (reset column), labeled filter form, paginated sessions table
- Desktop analytics with provider cost distribution, model token distribution, daily trend charts, model breakdown table, daily activity table
- Session detail panel with explanation data
- Compact menu-bar monitoring view at `/menubar` with health indicator, provider health dots, reset progress bars, recent sessions
- Native macOS wrapper (Tauri v2) with tray/menu bar, compact menubar window, and dashboard window
- Production bundle: `Token Tracker.app` + `Token Tracker_0.1.0_aarch64.dmg`
- Window-scoped export bundle (configurable `--days`, excludes raw prompts/transcripts)
- Comparison snapshots with automatic discrepancy detection (match/near_match/mismatch/inconclusive)
- Unified provider strategy status vocabulary (`validated`, `strategy pending`, `unavailable`)
- Empty-state and error-state handling across all surfaces
- Filter form with labeled inputs and accessible search affordance
- Page clamping under combined filter changes

### Prototype but Working

- Explanation factors — stored and displayed, but limited by heuristic quality

### Deferred Future Work

- Cursor adapter (needs validated usage API — gRPC schema unknown)
- Claude adapter (needs validated local source)
- Anomaly detection alerts
- Optional cloud sync

## Phase Status

| Phase | Status |
|---|---|
| Phase 0 — Spec Lock | ✅ Complete |
| Phase 1 — Core Engine | ✅ Complete |
| Phase 2 — Provider Ingestion | ⚠️ Partial (Codex + OpenCode validated, Cursor strategy pending, Claude unavailable) |
| Phase 3 — Analysis Engine | ✅ Complete (heuristics, explanations) |
| Phase 4 — CLI | ✅ Complete (doctor, providers, import, summary, sessions, analyze, export, compare-snapshot) |
| Phase 5 — Desktop UI | ✅ Complete (overview + analytics + detail + filter polish) |
| Phase 6 — Menu Bar UX | ✅ Complete (Tauri v2 native wrapper with tray/menu bar) |
| Phase 7 — Monitoring And Glanceable UX | ✅ Complete (health indicators, reset clarity, analytics visuals, filter polish, live refresh, preferences) |
| Phase 004a — Repair & Live Monitoring | ✅ Complete (16/16 tasks: file watching, refresh state, countdown UX, session/weekly meters, file refactor, preferences) |
| Phase 004b — Analytics & Theme Parity | ⚠️ Partial (7/8 tasks: time windows, heatmap, cache viz, dark mode, clipboard export, accessibility; B006 leaderboard blocked) |
| Phase 004c — Ambient Surfaces | ⚠️ Partial (5/6 tasks: detailed/minimal modes, live sync; C004 widget blocked — requires Swift/SwiftUI) |
| Phase 004d — Provider Status Layer | ⚠️ Partial (4/7 tasks: status model, desktop surfacing, honest unsupported providers; D001/D002/D005 provider expansion blocked — no validated sources) |
| Phase 005 — Team Leaderboard | ⚠️ Partial (foundation ✅, computation ✅, UI ⚠️ (C004 deferred), hardening ✅, tests ✅; member detail drawer still open) |
| Phase 006 — Open Gaps And Hardening | ⚠️ In progress (006b production OAuth/session hardening complete; screenshot export, member drawer, true meters, provider closure, widget shell remain) |
| Phase 8 — Optional Cloud Layer | ⏭️ Not started |

## Blocked / Deferred

| Item | Status | Blocker |
|---|---|---|
| B006 Leaderboard/social | ⚠️ Partial | Private team leaderboard shipped; real OAuth/session handling shipped; member detail drawer still deferred
| C004 Widget surface | ❌ Blocked | Requires Swift/SwiftUI + WidgetKit — not feasible in Node.js/Tauri |
| D001 Provider source research | ❌ Blocked | No validated local sources for Claude, Gemini, Copilot on this machine |
| D002 Highest-confidence provider | ❌ Blocked | Depends on D001 |
| D005 Additional providers | ❌ Blocked | Depends on D001 |
| Screenshot export | ⚠️ Partial | Clipboard copy exists; screenshot requires native API or headless browser
 |

## Risks

- Cursor and Claude data formats may not have stable local sources
- Cursor's gRPC API is undocumented and may change without notice
- Outcome inference is heuristic-based and should not be oversold
- Team/SaaS features can derail the local product if introduced too early

## Next Steps

1. Validate Cursor/Claude local sources or formally close as unsupported
2. Implement member detail drawer in leaderboard (requires JS-based UI)
3. Add rate limiting to all API endpoints (production hardening)
4. Revisit true quota/session meter semantics with validated data sources
5. Revisit optional cloud ambitions only after local product is mature

## Parallel Design Tracks

- `/specs/005-team-leaderboard/` — private team leaderboard program using
  GitHub identity, opt-in sharing, and efficiency-oriented ranking
