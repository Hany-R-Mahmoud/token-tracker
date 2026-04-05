# Fix Spec 4: HTTP Security Headers

**Findings:** M2, M3, L2, L3
**Priority:** Medium

## M2: Error responses leak internal error details

**Files:** `apps/desktop/src/index.ts:559,571,701`, `apps/web/src/index.ts` (similar pattern)

**Issue:** Stack traces, file paths, SQL errors are returned to any client that can reach the HTTP server.

**Remediation:** Return generic error messages to clients. Log full errors server-side.

## M3: No rate limiting on HTTP endpoints

**Files:** `apps/desktop/src/index.ts`, `apps/web/src/index.ts`

**Issue:** All endpoints can be hit at arbitrary frequency. `/api/compute-snapshot` triggers expensive database writes.

**Remediation:** Add basic in-memory rate limiting (token bucket) per IP, especially for write endpoints.

## L2: No Content-Security-Policy header

**Files:** All HTML responses across desktop and web apps

**Remediation:** Add `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`

## L3: Missing security headers

**Files:** All HTTP responses

**Remediation:** Add `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`

## Implementation Plan

1. Create `securityHeaders` middleware function
2. Apply to all HTTP responses in both desktop and web apps
3. Add simple in-memory rate limiter for `/api/*` endpoints
4. Replace `String(error)` with generic error messages
