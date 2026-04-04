# Token Tracker

Token Tracker is a local-first product for understanding AI coding tool usage,
cost, and efficiency across Codex, Claude, Cursor, and OpenCode.

## Current Status

The local-first MVP, productization, and monitoring UX slices are implemented:

- **CLI** (`ttm`): doctor, providers, import, summary, sessions, analyze, export, compare-snapshot — all working
- **Desktop shell**: Node.js HTTP server at `localhost:3100` with overview, analytics, session detail, and compact menu-bar view
- **Native wrapper**: Tauri v2 macOS app with tray/menu bar entry, compact menubar window, and dashboard window
- **Local storage**: SQLite-backed at `.ttm/ttm.sqlite`
- **Provider ingestion**: Codex and OpenCode adapters working on real local data
- **Analysis**: efficiency scoring, waste detection, outcome classification, explanation factors
- **Analytics**: provider cost distribution, model token distribution, daily tokens/cost trends, model breakdown table, daily activity table
- **Export**: local JSON export of normalized analytics (no raw prompts or transcripts) + SVG analytics summary card download
- **Comparison**: manual-input comparison snapshots against reference apps (CodexBar, AI Token Monitor, Tokscale)
- **Monitoring UX**: health indicator on menubar, per-provider reset progress bars (Codex only — from provider rate limit data; other providers show no reset bar), accessible filter form, human-readable reset context, file watching with configurable refresh cadence (1-60s, default 5s, persisted locally)
- **Analytics**: configurable time window controls (default from preferences, 7/14/30/90-day override), activity heatmap, cache-efficiency visualization, copy-to-clipboard export
- **Themes**: Dark mode toggle with localStorage persistence, CSS variable-based theme system
- **Compact modes**: Detailed and minimal menubar modes with user toggle; session/weekly meters are heuristic (session-count-based, not quota tracking); reset progress bars are quota-backed for Codex only (from rate limit data in session JSONL)
- **Provider status layer**: Incident status tracking (ok/degraded/incident/auth_needed/maintenance) surfaced in CLI doctor/providers, overview table (unpriced warnings), analytics distribution (unpriced notes), and menubar rows (incident badges)

## Provider Support

| Provider | Status | Notes |
|---|---|---|
| Codex | ✅ Validated | Parses `~/.codex/sessions/*.jsonl`; includes rate limit data for true quota meters |
| OpenCode | ✅ Validated | Reads `~/.local/share/opencode/opencode.db`; no quota data available |
| Cursor | ⚠️ Strategy pending | Auth token accessible locally but no usage/quota/session API surface found — gRPC schema unknown |
| Claude | ❌ Unavailable | No validated local session source |

See `specs/002-productization/research.md` for Cursor investigation details.

## Quickstart

```bash
npm install
npm run build

# Diagnose provider health
node packages/cli/dist/index.js doctor

# List known providers and their strategy status
node packages/cli/dist/index.js providers

# Import sessions from local sources
node packages/cli/dist/index.js import

# View summary
node packages/cli/dist/index.js summary

# List sessions
node packages/cli/dist/index.js sessions --provider codex --limit 10

# Analyze a specific session
node packages/cli/dist/index.js analyze <session-id>

# Export analytics data (last 30 days by default)
node packages/cli/dist/index.js export
node packages/cli/dist/index.js export custom.json --days 7

# Capture comparison snapshot
node packages/cli/dist/index.js compare-snapshot --provider codex --reference-app codexbar --ref-sessions 217 --ref-tokens 1895191369 --ref-cost-usd 4563.48

# Start desktop shell
node apps/desktop/dist/index.js
# Dashboard:  http://localhost:3100/
# Analytics:  http://localhost:3100/analytics
# Menu bar:   http://localhost:3100/menubar
# API:        http://localhost:3100/api/summary
#             http://localhost:3100/api/analytics
```

## Workspace Layout

```text
apps/
  desktop/         Node.js HTTP server — overview, analytics, session detail, /menubar
  desktop-tauri/   Tauri v2 native macOS wrapper — tray, menu bar, dashboard window
packages/
  core/            canonical types, adapters, analysis, pricing, SQLite storage, analytics read models
  cli/             ttm command surface (doctor, providers, import, summary, export, compare-snapshot, sessions, analyze)
specs/
  001-local-mvp/     spec, plan, tasks, research, data model, quickstart
  002-productization/  spec, plan, tasks, research, data model, quickstart
docs/
  architecture/    local storage and system boundaries
  specs/           contracts and metric definitions
```

## Desktop Shell

The desktop is a Node.js HTTP server serving server-rendered HTML:

- **`/`** — Overview with provider summaries (including reset column), labeled filter form, paginated sessions table, and clickable session links
- **`/?session=<id>`** — Session detail panel with tokens, cost, efficiency, outcome, and explanation factors
- **`/analytics`** — Analytics with provider cost distribution, model token distribution, daily tokens/cost trend charts, model breakdown table, and daily activity table
- **`/menubar`** — Compact monitoring view (320px wide) with health indicator, aggregate bar, per-provider health dots + reset progress bars, 3 recent sessions, and "Open Dashboard" link
- **`/api/summary`** — JSON API returning the summary snapshot
- **`/api/analytics`** — JSON API returning analytics snapshot (provider, model, daily buckets)
- **`/export/analytics-svg`** — SVG analytics summary card download (800x500, aggregated data only)

It runs in any browser and reads from the same local SQLite store as the CLI. The Tauri native wrapper (`apps/desktop-tauri/`) packages this as a macOS app with tray/menu bar integration.

## CLI Commands

| Command | Description |
|---|---|
| `ttm doctor` | Provider health diagnostics with strategy status |
| `ttm providers` | List all known providers and their strategy status |
| `ttm import` | Import sessions from all available providers |
| `ttm summary` | Provider-level summary with pricing coverage |
| `ttm sessions` | Recent sessions list (`--provider`, `--limit`) |
| `ttm analyze <id>` | Detailed session analysis with explanation factors |
| `ttm export [path] [--days N]` | Export normalized analytics bundle (no raw prompts/transcripts) |
| `ttm compare-snapshot --provider <id> [--reference-app <app>] [--ref-* <val>]` | Capture comparison snapshot against reference apps |

## Team Leaderboard (Web)

A separate web surface at `localhost:3200` for private, team-scoped, opt-in leaderboard:

- **`/`** — Home with GitHub connection status, leaderboard opt-in/out, and privacy policy
- **`/settings`** — Settings for GitHub connection and leaderboard visibility
- **`/leaderboard`** — Team leaderboard with My Rank card, period tabs, and 8-column table (Rank, Member, Efficiency, Sessions, Tokens, Cost, Success, Cache)
- **`/api/me`** — Current user status (connected, membership, team)
- **`/api/leaderboard?period=<week|month|all_time>`** — Latest leaderboard snapshot with period support
- **`/api/compute-snapshot?period=<week|month|all_time>`** — POST endpoint to trigger snapshot computation (protected by TTM_ADMIN_API_KEY when set)

Privacy: only aggregated efficiency stats are shared. No raw session/prompt/code data. Opt-in required. Admins cannot override visibility. Minimum 3 sessions to appear.

**Note**: GitHub OAuth requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. When configured, the app now completes the code exchange, fetches the GitHub user profile with minimal scopes, persists the connected identity, and creates a real HttpOnly session cookie. Without credentials, the app falls back to an explicit dev-mode page instead of pretending production auth is available. Set `TTM_WEB_ORIGIN` when the public origin differs from the local default.

**Session Ingestion**: When a user opts in to the leaderboard, their local sessions from `.ttm/ttm.sqlite` are automatically ingested into the leaderboard database. Only aggregated fields are copied (tokens, costs, efficiency, waste, cache, outcome). No raw prompts, transcripts, or message content are shared.

## Architecture

- **Shared core** (`packages/core`): canonical session model, provider adapters, pricing engine, analysis heuristics, SQLite storage, analytics read models, leaderboard types
- **CLI** (`packages/cli`): terminal reports reading from the same local store
- **Desktop** (`apps/desktop`): HTTP server rendering HTML from the same read service
- **Web** (`apps/web`): separate HTTP server for team leaderboard with its own SQLite database

The desktop and web surfaces are isolated — the web app has its own database for team/leaderboard data and does not access the local session store.

## Roadmap

- [ ] Cursor adapter (needs validated usage API — gRPC schema unknown)
- [ ] Claude adapter (needs validated local source)
- [ ] Screenshot export for additional surfaces (leaderboard, overview)
- [ ] Member detail drawer in leaderboard (requires JS-based UI)
- [ ] Optional cloud sync (post-local validation)
