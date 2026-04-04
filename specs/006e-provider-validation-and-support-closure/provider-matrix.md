# Provider Validation Matrix — 006e

Last updated: 2026-04-03

## Canonical Provider Status

This matrix records the validated support status for each provider in Token Tracker.
It uses the same status vocabulary as `packages/core/src/adapters/types.ts`
(`ProviderStrategyStatus`): `validated`, `strategy_pending`, `unavailable`.

| Provider | Shipped Adapter? | Validated Local Source? | Validated Quota/Session Source? | Status | Reason |
|---|---|---|---|---|---|
| **Codex** | ✅ Yes | ✅ `~/.codex/sessions/*.jsonl` | ✅ Rate limit data embedded in session JSONL | `validated` | Fully validated and shipped |
| **OpenCode** | ✅ Yes | ✅ `~/.local/share/opencode/opencode.db` (SQLite) | ❌ No quota data in source | `validated` | Fully validated and shipped; no quota data available from source |
| **Cursor** | ❌ No | ⚠️ Partial investigation — some local data found but insufficient for implementation | ❌ No validated usage/quota/session API | `strategy_pending` | Auth token accessible locally but no usage/quota/session API surface found. Cursor uses undocumented gRPC; no service definitions available. |
| **Claude** | ❌ No | ❌ No validated local session source | ❌ No validated local session source | `unavailable` | No validated local session source has been established. |

## Status Definitions

| Status | Meaning |
|---|---|
| **validated** | Adapter implemented, tested, and included in the product. Users can import data from this provider. |
| **strategy_pending** | Investigation performed but evidence is insufficient for implementation. A credible path may exist but has not been validated. |
| **unavailable** | No validated source found. No credible path identified. |
| **not_started** | No investigation performed. No claims made. |

## What "Support" Means in This Repo

A provider is "supported" in Token Tracker when:
1. A provider adapter exists in `packages/core/src/adapters/`
2. The adapter can discover and import local session data
3. The imported data populates the local SQLite store
4. The CLI and desktop surfaces can display the imported data

A provider is **not** supported when no adapter exists or no validated data source has been established.

## Prior Investigation Notes

These notes summarize what has been investigated so far. They are historical context, not canonical product truth.

**Cursor**: Investigation found an auth token in Cursor's local state database, but no usage, quota, or session API surface was discovered. Cursor appears to use gRPC for its API; no `.proto` service definitions were found in the app bundle. The gRPC schema remains undocumented.

**Claude**: Investigation found no local session database or structured export format. Only plugin skill-injection logs were found, which are not suitable for session analytics.

## Parity vs Reference Products (Provider Breadth)

| Product | Providers Supported | Quota-Backed Meters |
|---|---|---|
| AI Token Monitor | Claude + Codex (2) | ✅ Both |
| CodexBar | 16+ | ✅ Most |
| Token Tracker | Codex + OpenCode (2) | ⚠️ Codex only |

Token Tracker trails both reference products on provider breadth and quota meter coverage. This is documented honestly in `docs/reference-products.md`.

## Next Evidence Steps (If Any)

| Provider | What Would Change Status |
|---|---|
| Cursor | Discovery of Cursor's gRPC service definitions (`.proto` files) OR a documented REST API for usage/quota data |
| Claude | Discovery of a local session format with parseable session/token/cost data |
| Gemini | Investigation has not been performed |
| Copilot | Investigation has not been performed |

No speculative implementation should begin until a validated source is established.
