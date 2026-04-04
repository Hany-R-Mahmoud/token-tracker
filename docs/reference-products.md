# Reference Products: Feature Snapshot

Last updated: 2026-04-03

Purpose: keep a stable in-repo reference for the public feature surfaces of the
comparison products we use most often during roadmap planning:

- [AI Token Monitor](https://github.com/soulduse/ai-token-monitor)
- [CodexBar](https://github.com/steipete/CodexBar)

This file is intentionally product-surface-focused. It is not a full audit of
implementation details.

## Why This Exists

Token Tracker has already used these products as external reference points for:

- monitoring UX expectations
- menu bar / tray product behavior
- provider support comparison
- analytics presentation ideas
- trust and parity discussions

This doc helps future planning avoid re-researching the same basics.

## AI Token Monitor

Source:

- GitHub repo: [soulduse/ai-token-monitor](https://github.com/soulduse/ai-token-monitor)

### Public Product Positioning

- macOS and Windows tray app
- tracks Claude Code and Codex usage and costs in real time
- dashboard organized around Overview, Analytics, and Leaderboard

### Publicly Documented Features

- real-time token tracking from local session files
- multi-provider toggle between Claude and Codex
- automatic cost estimation
- 7/30-day daily chart
- activity graph / heatmap views
- weekly and monthly period navigation
- model breakdown
- cache efficiency visualization
- tray/menu bar cost display
- multiple visual themes with dark mode support
- screenshot to clipboard
- markdown clipboard export
- opt-in leaderboard with GitHub auth
- auto-hide window behavior

### Publicly Documented Data Sources

- Claude Code: `~/.claude/projects/**/*.jsonl`
- Claude supplementary stats: `~/.claude/stats-cache.json`
- Codex: `~/.codex/sessions/**/*.jsonl`

### Publicly Documented Product Traits

- offline by default unless leaderboard is enabled
- Tauri v2 app
- React + Vite frontend
- file watcher for real-time updates
- preferences persisted locally

### What It Represents For Token Tracker

- strong visual analytics benchmark
- good example of making local data feel readable quickly
- useful reference for charts, heatmaps, themes, and compact summary polish
- weaker than our product on operator tooling depth and comparison harnessing

## CodexBar

Source:

- GitHub repo: [steipete/CodexBar](https://github.com/steipete/CodexBar)

### Public Product Positioning

- tiny macOS menu bar app
- focused on keeping usage limits visible
- optimized for ambient status, reset timing, and compact status signaling

### Publicly Documented Features

- multi-provider menu bar with per-provider toggles
- session and weekly meters with reset countdowns
- optional Codex web dashboard enrichments
- local cost scan for Codex and Claude
- provider status polling and incident badges
- merge-icons mode with provider switcher and optional overview tab
- refresh cadence presets
- bundled CLI for scripts and CI
- WidgetKit widget
- privacy-first local parsing by default

### Publicly Documented Provider Coverage

- Codex
- Claude
- Cursor
- Gemini
- Antigravity
- Droid / Factory
- Copilot
- z.ai
- Kimi
- Kimi K2
- Kiro
- Vertex AI
- Augment
- Amp
- JetBrains AI
- OpenRouter
- Perplexity is included in the repo positioning text

### Publicly Documented Source / Auth Patterns

- local Codex CLI RPC and PTY fallback
- OAuth-backed provider APIs
- browser cookies and local storage
- device-flow auth
- API tokens from Keychain
- local XML / config parsing
- CLI-based provider usage commands

### Publicly Documented Product Traits

- no Dock icon
- dynamic bar icons in menu bar
- tiny two-bar visual meter in the menu bar icon
- reset visibility is a first-class product concept
- optional web/cookie enrichments are opt-in
- permissions are explained explicitly

### What It Represents For Token Tracker

- strongest benchmark for ambient monitoring UX
- strongest benchmark for reset-window communication
- strongest benchmark for compact menu bar density and provider-status signaling
- broader provider coverage than our current roadmap should chase immediately

## Quick Comparison Matrix

| Area | AI Token Monitor | CodexBar | Why It Matters To Token Tracker |
|---|---|---|---|
| Core posture | visual dashboard monitor | ambient menu bar monitor | we need both stronger dashboard visuals and stronger compact monitoring |
| Primary platforms | macOS + Windows | macOS app, Linux CLI | platform breadth is lower priority than UX quality right now |
| Supported providers | Claude + Codex | very broad multi-provider support | provider breadth is a gap, but not the next roadmap target |
| Menu bar sophistication | solid tray app | very strong glanceability | CodexBar is the main benchmark for our `/menubar` and reset UX |
| Analytics visuals | strong | secondary | AI Token Monitor is the main benchmark for `/analytics` visuals |
| Reset UX | present indirectly through period navigation | first-class countdown/meter model | this is one of our clearest current gaps |
| Real-time behavior | documented real-time tracking + file watcher | polling / live status model | useful for future refresh model work |
| Sharing / social | leaderboard, screenshot, clipboard export | none emphasized in the same way | social features remain out of scope for us |
| CLI depth | not the main product story | bundled CLI exists | neither beats our current operator-focused CLI posture |

## Token Tracker Snapshot Against These References

**Last updated**: 2026-04-03 (after Phase 004 program)

### Parity Assessment

| Area | AI Token Monitor | CodexBar | Token Tracker | Gap |
|---|---|---|---|---|
| Real-time file watching | ✅ File watcher | ✅ Polling/live | ✅ watchFile polling (2s) | **Parity** |
| 7/30-day controls | ✅ | ✅ | ✅ 7/14/30/90-day | **Ahead** |
| Activity heatmap | ✅ | ❌ | ✅ | **Parity** |
| Cache-efficiency viz | ✅ | ❌ | ✅ (honest fallback) | **Parity** |
| Dark mode / themes | ✅ Multiple themes | ❌ | ✅ Light/dark toggle | **Parity** |
| Screenshot export | ✅ | ❌ | ❌ Clipboard only | **Trail** |
| Clipboard export | ✅ | ❌ | ✅ Copy summary | **Parity** |
| Leaderboard/social | ✅ Opt-in | ❌ | ❌ Not implemented | **Trail** |
| Widget surface | ❌ | ✅ WidgetKit | ❌ Blocked (Swift) | **Trail** |
| Menu bar glanceability | ✅ Tray app | ✅ Strong | ✅ Detailed/minimal modes | **Parity** |
| Reset countdown | ✅ | ✅ First-class | ✅ Countdown | **Parity** |
| Session/weekly meters | ✅ Quota-based | ✅ Quota-based | ⚠️ Heuristic (session-count, labeled) | **Trail*** |
| Provider status (desktop) | ❌ | ✅ Incident badges | ✅ Unpriced warnings + incident badges | **Parity** |
| Provider status (CLI) | ❌ | ❌ | ✅ 5-state layer | **Ahead** |
| Provider breadth | Claude+Codex | 16+ providers | Codex+OpenCode | **Trail** |
| CLI depth | Not main story | Bundled CLI | ✅ 8 commands | **Ahead** |
| Comparison harness | ❌ | ❌ | ✅ Artifacts | **Ahead** |
| Session drilldown | ❌ | ❌ | ✅ Detail + analysis | **Ahead** |

\* Heuristic meters are session-count-based, not true quota/session meters.
This is a meaningful difference — CodexBar's meters track actual quota usage,
while ours track session volume as a proxy.

### We Already Beat Or Differ Positively On

- Local analysis / operator-tool posture
- Explicit CLI workflow (8 commands vs reference products' minimal CLI)
- Comparison snapshot artifacts with discrepancy detection
- Privacy-safe export bundle (no raw prompts/transcripts)
- Session-level drilldown with heuristic analysis and explanation factors
- OpenCode support in the product surface
- Provider incident status layer (5 states: ok/degraded/incident/auth_needed/maintenance)

### We Are At Parity On

- Real-time file watching (watchFile polling vs AI Token Monitor's watcher)
- 7/30-day time window controls (we offer 7/14/30/90)
- Activity heatmap visualization
- Cache-efficiency visualization with honest unsupported-state messaging
- Dark mode / theme system (CSS variable-based, localStorage persistence)
- Clipboard export (copy summary button)
- Menu bar glanceability (detailed/minimal modes with toggle)
- Reset countdown UX (human-readable countdowns)
- Provider status surfacing (unpriced warnings in overview/analytics, incident badges in menubar, 5-state layer in CLI)

### We Clearly Trail On

- **Screenshot export**: AI Token Monitor can screenshot to clipboard. We only have text copy.
- **Leaderboard/social surface**: AI Token Monitor has opt-in leaderboard with GitHub auth. We have not implemented this.
- **Widget surface**: CodexBar has WidgetKit widget. We documented the Swift/SwiftUI blocker.
- **Provider breadth**: CodexBar supports 16+ providers. We support 2 (Codex, OpenCode) with 2 more in pipeline (Cursor: strategy pending, Claude: unavailable).
- **True quota/session meters**: Our meters are session-count heuristics (labeled as such), not actual quota tracking like CodexBar.

### We Should Not Copy Blindly

- Broad provider expansion as the immediate next step
- Leaderboard / social comparison
- Cloud-backed features that weaken the local-first thesis
- Stack rewrites just to imitate a reference implementation

## Planning Guidance

When using this doc for future specs:

- use AI Token Monitor as the benchmark for analytics visuals and dashboard
  readability
- use CodexBar as the benchmark for menu bar density, reset clarity, and
  ambient monitoring behavior
- do not let provider breadth dominate roadmap choices unless validated sources
  exist and the local-first thesis still holds
- prefer adapting product ideas, not cloning implementation details

## Verification Note

This snapshot is based on the public repo surfaces and README-level
documentation available on 2026-04-03. Re-check the upstream repos before using
this file for precise parity claims.

Parity claims are conservative. Where Token Tracker's implementation differs
in approach (e.g., heuristic meters vs quota meters, watchFile polling vs
native file watcher), the gap is noted explicitly.
