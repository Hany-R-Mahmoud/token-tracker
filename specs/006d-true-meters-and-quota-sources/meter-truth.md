# Meter Truth Matrix — 006d

Last updated: 2026-04-03

## Provider-by-Provider Meter Truth

| Provider | Reset Window Data | Source | Quota-Backed? | Session/Weekly Meters |
|---|---|---|---|---|
| **Codex** | Yes — `resetWindowRemainingPercent`, `resetWindowKind`, `resetWindowResetsAt` | OpenAI rate limit API response embedded in session JSONL (`rateLimits.primary.used_percent`, `resets_at`, `window_minutes`) | ✅ Yes — derived from actual provider rate limit data | ⚠️ Heuristic — session volume only, not quota |
| **OpenCode** | No | OpenCode SQLite does not expose rate limit or quota data | ❌ No | ⚠️ Heuristic — session volume only, not quota |
| **Cursor** | No | Auth token accessible locally but no usage/quota/session API surface found — gRPC schema unknown | ❌ No | ⚠️ Heuristic — session volume only, not quota |
| **Claude** | No | No validated local session source | ❌ No | ⚠️ Heuristic — session volume only, not quota |

## Meter Semantics in Current UI

| Surface | Meter Type | What It Measures | Quota-Backed? |
|---|---|---|---|
| Menubar reset progress bar (per provider) | Reset window progress | `resetWindowRemainingPercent` from provider data | ✅ Codex only; hidden for other providers |
| Menubar session load meter | Heuristic volume | Total session count / 100 cap | ❌ No — session count, not quota |
| Menubar weekly pace meter | Heuristic volume | Session count / 20 per week assumed "full" | ❌ No — session count, not quota |

## Parity vs Reference Products

| Feature | AI Token Monitor | CodexBar | Token Tracker |
|---|---|---|---|
| True quota meters | ✅ (from provider rate limits) | ✅ (from provider rate limits) | ⚠️ Codex only (from rate limits in JSONL) |
| Heuristic session meters | ❌ | ❌ | ✅ (session volume, clearly labeled) |
| Reset window countdown | ✅ | ✅ | ✅ (Codex only) |
| Multi-provider quota display | ✅ (Claude + Codex) | ✅ (16+ providers) | ⚠️ Codex only |

Token Tracker trails both reference products on true quota meter coverage because only Codex sessions contain embedded rate limit data. OpenCode, Cursor, and Claude do not currently provide quota-backed reset window data in this repo.
