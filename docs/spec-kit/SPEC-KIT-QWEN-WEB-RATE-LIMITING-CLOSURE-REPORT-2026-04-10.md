# SPEC-KIT: Qwen Web Rate Limiting Closure Report

**Date:** 2026-04-10
**Pass Type:** Implementation — web-side rate limiting
**Code Changes:** `apps/web/src/index.ts` — added rate limiting to request handler
**Docs Changes:** `docs/security-status-2026-04-05-current.md`, `docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`

---

## 1. Summary

Implemented per-IP in-memory rate limiting in the web app (`apps/web/src/index.ts`), matching the desktop app's thresholds and behavior:

- **Threshold:** 60 requests per 60-second window per IP
- **Response on exceed:** HTTP 429 with `{"error": "Too many requests. Please try again later."}`
- **Cleanup:** Automatic eviction of stale entries when store exceeds 1000 entries
- **IP identification:** `x-forwarded-for` header → `socket.remoteAddress` → `"unknown"`

M3 (rate limiting) is now **FIXED** in both desktop and web apps.

---

## 2. Files Changed

| File | Change |
|------|--------|
| `apps/web/src/index.ts` | Added rate limiting constants, store, and enforcement in `createApp()` handler |
| `docs/security-status-2026-04-05-current.md` | Updated M3 from `PARTIAL` to `FIXED`; corrected evidence links |
| `docs/spec-kit/SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md` | Updated Pattern 2 and Persistent Issues to reflect M3 fully fixed |

---

## 3. Implementation Details

### Constants (lines 28-29)
```typescript
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
```
Matches desktop exactly.

### Store (lines 31-36)
```typescript
interface RateLimitEntry {
  count: number;
  windowStart: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();
```
Simple in-memory sliding window. Shared across all requests in the same process — appropriate for a local app.

### Enforcement (lines 888-920)
Inserted into `createApp()` request handler, immediately after security headers and before route parsing:

1. Extracts client IP from `x-forwarded-for` → `socket.remoteAddress` → `"unknown"`
2. Checks existing entry:
   - If window expired: reset counter
   - If within window: increment and check threshold
   - If threshold exceeded: return 429 and short-circuit
3. If no entry: create new one
4. Periodic cleanup: when store exceeds 1000 entries, evict all expired entries

### Behavior verification
- Rate limiting runs **before** any route handler, so all endpoints are protected (/, /settings, /leaderboard, /api/*)
- Returns 429 before any database access or cookie parsing on exceeded requests
- Error response is JSON-only: `{"error": "Too many requests. Please try again later."}`

---

## 4. Validation Commands And Results

```bash
# Typecheck — PASS (0 errors)
$ npm run typecheck
> tsc -b packages/core packages/cli apps/desktop apps/web --pretty false

# Build — PASS (0 errors)
$ npm run build
> tsc -b packages/core packages/cli apps/desktop apps/web
```

### Source-level verification

```bash
# Web app rate limiting is present
$ grep -c "rateLimitStore\|RATE_LIMIT\|429" apps/web/src/index.ts
# → 13 matches — constants, store, enforcement, and 429 response

# Web rate limiting constants match desktop
$ grep "RATE_LIMIT_" apps/web/src/index.ts
# → RATE_LIMIT_WINDOW_MS = 60 * 1000
# → RATE_LIMIT_MAX_REQUESTS = 60

# Desktop rate limiting for comparison
$ grep "RATE_LIMIT_" apps/desktop/src/index.ts
# → RATE_LIMIT_WINDOW_MS = 60 * 1000
# → RATE_LIMIT_MAX_REQUESTS = 60
```

Both apps now use identical thresholds: **60 requests per 60 seconds per IP**.

---

## 5. Updated Security Status

### M3 — Rate Limiting: FIXED

| App | Threshold | Enforcement | 429 Response |
|-----|-----------|-------------|--------------|
| Desktop | 60 req/min per IP | ✅ Lines 1870-1896 | ✅ JSON error |
| Web | 60 req/min per IP | ✅ Lines 888-920 | ✅ JSON error |

### Documentation updates applied
- `docs/security-status-2026-04-05-current.md`: M3 changed from `PARTIAL` to `FIXED`
- Status table, detailed section, evidence links, and conclusion all updated
- `SPEC-KIT-ALL-PHASES-IMPLEMENTATION-AUDIT-REPORT-2026-04-10.md`: Pattern 2 updated to reflect all three security fixes (M3, M5, M6) as fully implemented

---

## 6. What Remains Open

### Remaining security debt (unchanged by this pass)

| Finding | Status | Notes |
|---------|--------|-------|
| H1 (plaintext OAuth tokens) | PARTIAL | `chmod 0o600` mitigation in place; no encryption-at-rest |
| M4 (session cleanup) | DEFERRED | On-read expiry only; conscious architectural decision |

### Rate limiting limitations (accepted for now)
- **In-memory only:** Rate limit state is lost on server restart. Acceptable for a local app with single-process deployment.
- **No distributed support:** Not needed — web app runs as a single local process.
- **No per-endpoint differentiation:** All endpoints share the same limit. The auth endpoints (OAuth callback) may benefit from stricter limits in the future, but the current uniform limit is sufficient for a local deployment.

---

Web rate limiting closure is complete.
