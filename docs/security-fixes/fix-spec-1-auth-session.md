# Fix Spec 1: Authentication & Session Security

**Findings:** H3, M1, M4, I2
**Priority:** High

## H3: Dev-mode auth bypass via unsigned `github_id` cookie

**File:** `apps/web/src/index.ts:710-711`

**Issue:** When `GITHUB_CLIENT_ID` is not set, any user can authenticate as any GitHub user by setting `github_id=12345` in their cookie. No signature, no HMAC, no server-side validation.

**Exploit scenario:** If `GITHUB_CLIENT_ID` is accidentally unset in production, any attacker can impersonate any user by guessing their GitHub ID.

**Remediation:** Gate dev-mode auth behind `TTM_DEV_AUTH=true` env var (defaults to `false`). Log a warning when active.

## M1: OAuth state uses `Math.random()` — predictable CSRF token

**File:** `apps/web/src/index.ts:752`

**Issue:** `Math.random()` is not cryptographically secure. An attacker who can observe or predict the PRNG state can forge the OAuth state token.

**Remediation:** Use `crypto.randomUUID()` for the OAuth state token.

## M4: Session expiration not enforced proactively

**File:** `apps/web/src/index.ts:709`, `apps/web/src/db.ts:185-187`

**Issue:** Expired sessions are only deleted on lookup, not proactively. A stolen session remains valid until the legitimate user returns.

**Remediation:** Add periodic cleanup of expired sessions. Add `last_seen_at` TTL check on every request.

## I2: Admin API key comparison not constant-time

**File:** `apps/web/src/index.ts:912`

**Issue:** String comparison is vulnerable to timing attacks. Negligible for local-only, but worth fixing.

**Remediation:** Use `crypto.timingSafeEqual` for admin key comparison.

## Implementation Plan

1. Replace `Math.random().toString(36).slice(2)` with `crypto.randomUUID()`
2. Wrap dev-mode auth in `if (process.env.TTM_DEV_AUTH === 'true')` with console warning
3. Add `cleanupExpiredSessions()` function called on startup and periodically
4. Replace `authHeader !== \`Bearer ${adminApiKey}\`` with timing-safe comparison
