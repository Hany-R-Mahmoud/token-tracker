# Project State Report — Phases 001–006

Last updated: 2026-04-03

## Phase 001: Local MVP

| Field | Value |
|---|---|
| **Goal** | Build a local-first CLI and desktop shell for AI coding tool usage analytics |
| **Shipped** | ✅ CLI with 8 commands (doctor, providers, import, summary, sessions, analyze, export, compare-snapshot); desktop HTTP server with overview, analytics, session detail, menubar view; SQLite storage; Codex + OpenCode adapters; file watching; preferences |
| **Partially Shipped** | — |
| **Blocked** | Cursor adapter (gRPC schema unknown), Claude adapter (no local session source) |
| **Open** | — |
| **Docs Corrected** | README.md and PROJECT_PLAN.md reconciled to reflect actual shipped state |

## Phase 002: Productization

| Field | Value |
|---|---|
| **Goal** | Improve menu bar glanceability, reset clarity, analytics visuals, and provider status reporting |
| **Shipped** | ✅ Health indicators, reset progress bars (Codex only), filter form with labels, file watching with configurable cadence, provider incident status layer (5 states), analytics time window controls, activity heatmap, cache-efficiency visualization, dark mode theme system, compact menubar modes, SVG analytics export |
| **Partially Shipped** | — |
| **Blocked** | — |
| **Open** | — |
| **Docs Corrected** | reference-products.md updated with meter truth comparison table |

## Phase 003: Monitoring & Glanceable UX

| Field | Value |
|---|---|
| **Goal** | Repair Phase 002 drift and add live monitoring foundation |
| **Shipped** | ✅ File watching, refresh state indicator, countdown UX, session/weekly meters (heuristic, labeled), preferences persistence, period-aware snapshots |
| **Partially Shipped** | — |
| **Blocked** | — |
| **Open** | — |
| **Docs Corrected** | Task files reconciled to actual implementation |

## Phase 004: Competitive Parity

| Field | Value |
|---|---|
| **Goal** | Close gaps vs AI Token Monitor and CodexBar across analytics, monitoring, and provider status |
| **Shipped** | ✅ Period-aware snapshots (7/14/30/90 days), ingestion bridge from local store to leaderboard DB, honest parity language, provider status surfaced across CLI/desktop/menubar |
| **Partially Shipped** | Provider expansion (D001/D002/D005 blocked — no validated sources for Claude, Gemini, Copilot) |
| **Blocked** | New provider adapters (blocked on validated data sources) |
| **Open** | B009 test suite (was open, now complete — 19/19 tests pass) |
| **Docs Corrected** | README.md, PROJECT_PLAN.md, reference-products.md all reconciled; "in pipeline" language removed |

## Phase 005: Team Leaderboard

| Field | Value |
|---|---|
| **Goal** | Add private team-scoped leaderboard with member detail drawer |
| **Shipped** | ✅ Web app at `localhost:3200` with home, leaderboard, settings; composite scoring with 5-component weights; period-aware snapshots; member detail drawer (base64-encoded payloads, textContent rendering, keyboard accessible); GitHub OAuth scaffolding; session management; admin API key protection |
| **Partially Shipped** | — |
| **Blocked** | Full OAuth flow (requires valid GitHub OAuth credentials) |
| **Open** | — |
| **Docs Corrected** | Task files reconciled; security fixes documented (XSS prevention, attribute escaping) |

## Phase 006: Open Gaps and Hardening

| Sub-Phase | Goal | Outcome |
|---|---|---|
| **006a: Screenshot Export** | Add real image export for analytics | ✅ Shipped — SVG analytics summary card download (server-side generation, no browser dependencies) |
| **006b: (Skipped)** | — | — |
| **006c: Member Detail Drawer** | Add interactive drawer for leaderboard members | ✅ Shipped — base64 payload transport, textContent rendering, keyboard accessible, XSS-safe |
| **006d: True Meters & Quota** | Make meter semantics honest and consistent | ✅ Shipped — visible "reset" prefix on reset bars, tooltips clarify Codex-only quota data, meter truth matrix in reference-products.md |
| **006e: Provider Validation** | Close provider-support story honestly | ✅ Shipped — canonical provider matrix, "in pipeline" language removed, all docs reconciled |
| **006f: Native Widget** | Feasibility of WidgetKit / native shell | ✅ Shipped — Tauri tray/menu bar exists and provides equivalent value; WidgetKit out of scope (requires parallel Swift/Xcode build system) |

## Honest Product State Now

### What Exists and Works
- **CLI**: 8 commands, all functional, all tested
- **Desktop**: HTTP server with overview, analytics, session detail, menubar view, SVG export
- **Web**: Team leaderboard with member detail drawer, scoring, period-aware snapshots
- **Native**: Tauri v2 wrapper with system tray, menu bar, app bundle
- **Monitoring**: File watching, refresh indicators, reset progress bars (Codex only), heuristic session meters (labeled)
- **Export**: JSON export, SVG analytics card, text clipboard copy
- **Themes**: Dark mode with CSS variables and localStorage persistence
- **Privacy**: No raw prompts/transcripts/code exposed in any export or UI

### What Does Not Exist
- **WidgetKit widget**: No Home Screen widget exists; Tauri tray/menu bar provides equivalent ambient monitoring
- **Cursor adapter**: No usage/quota/session API found; gRPC schema unknown
- **Claude adapter**: No local session source found
- **Real quota meters for OpenCode**: Source does not provide quota data
- **Leaderboard with real OAuth**: Requires valid GitHub OAuth credentials

### Docs Reconciled
- README.md: Honest about Codex-only quota data, heuristic meters, blocked providers
- PROJECT_PLAN.md: Phase status tables match actual implementation
- reference-products.md: Meter truth comparison table added; "in pipeline" language removed
- provider-matrix.md: Canonical provider status using consistent vocabulary
- feasibility.md (006f): WidgetKit feasibility documented with toolchain evidence

### Parity vs Reference Products (Honest Assessment)

| Area | AI Token Monitor | CodexBar | Token Tracker |
|---|---|---|---|
| Real-time monitoring | ✅ | ✅ | ✅ |
| Analytics visuals | ✅ Strong | ⚠️ Secondary | ✅ Strong |
| Menu bar glanceability | ✅ Tray | ✅ Strong | ✅ Tray/menu bar |
| True quota meters | ✅ 2 providers | ✅ 16+ providers | ⚠️ 1 provider (Codex) |
| Provider breadth | 2 | 16+ | 2 |
| Home Screen widget | ❌ | ✅ WidgetKit | ❌ |
| Team leaderboard | ✅ | ❌ | ✅ |
| Comparison harness | ❌ | ❌ | ✅ |

Token Tracker leads on comparison harnessing and team leaderboard. It trails on provider breadth and true quota meter coverage. It is at parity on real-time monitoring, analytics visuals, and menu bar glanceability.
