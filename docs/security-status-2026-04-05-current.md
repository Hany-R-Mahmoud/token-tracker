# Security Status Report — Current Repo State

**Date:** 2026-04-05  
**Purpose:** Reconcile the OpenCode security audit/fix reports with the code that is actually present in the repository today.  
**Scope reviewed:** desktop HTTP app, Tauri shell, web app, CLI, core DB path handling, privacy policy, and the documented fix-specs in `docs/security-fixes/`.

## Executive Summary

The existing security audit report in [docs/security-audit-2026-04-05.md](/Users/hanyramadan/token%20traker/docs/security-audit-2026-04-05.md) was **too optimistic for the current codebase** at the start of this remediation pass.

This document has been updated to reflect the security fixes implemented during the 2026-04-05 remediation pass.

## Current Status Matrix

| ID  | Finding                                      | Previous Status   | Current Status    | Notes                                                                         |
| --- | -------------------------------------------- | ----------------- | ----------------- | ----------------------------------------------------------------------------- |
| H1  | Plaintext GitHub OAuth token storage         | `OPEN`            | `PARTIAL`         | Tokens still stored plaintext; file permission hardening (0o600) added        |
| H2  | Tauri CSP disabled                           | `OPEN`            | `FIXED`           | CSP now set to restrictive policy in tauri.conf.json                          |
| H3  | Dev-mode auth bypass                         | `VERIFIED`        | `VERIFIED`        | Gated behind `TTM_DEV_AUTH === 'true'` and warns to stderr                    |
| M1  | Predictable OAuth state token                | `VERIFIED`        | `VERIFIED`        | Uses UUID-based state token                                                   |
| M2  | Internal error detail leakage                | `PARTIAL`         | `PARTIAL`         | Desktop is generic; web is mostly generic                                     |
| M3  | No rate limiting                             | `OPEN`            | `FIXED`           | In-memory rate limiter added to both desktop and web apps (60 req/min per IP) |
| M4  | No proactive session cleanup                 | `OPEN / DEFERRED` | `OPEN / DEFERRED` | Sessions expire on lookup only; deferred to future work                       |
| M5  | Arbitrary export file paths                  | `OPEN`            | `FIXED`           | CLI export now validates path (no traversal, length limits)                   |
| M6  | Unauthenticated localhost IPC/polling        | `OPEN`            | `FIXED`           | Tauri polling now sends API key; desktop server validates it                  |
| L1  | DB path from env without validation          | `OPEN`            | `FIXED`           | Path validation added for both TTM_DB_PATH and TTM_LEADERBOARD_DB_PATH        |
| L2  | Missing CSP header on HTTP responses         | `VERIFIED`        | `VERIFIED`        | Desktop + web set CSP headers                                                 |
| L3  | Missing `nosniff` / `DENY` / referrer policy | `VERIFIED`        | `VERIFIED`        | Desktop + web set these headers                                               |
| L5  | Weak HTML escaping                           | `VERIFIED`        | `VERIFIED`        | Web escapes `'` and backticks                                                 |
| I2  | Admin API key compare not constant-time      | `VERIFIED`        | `VERIFIED`        | Uses `timingSafeEqual` with length check                                      |

## Implemented Fixes (2026-04-05 Remediation)

### 1. Tauri CSP Hardening (H2 - FIXED)

- **File:** `apps/desktop-tauri/src-tauri/tauri.conf.json`
- **Change:** CSP set from `null` to restrictive policy
- **CSP:** `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3100; img-src 'self' data: https://avatars.githubusercontent.com`

### 2. HTTP Rate Limiting (M3 - FIXED)

- **Desktop (`apps/desktop/src/index.ts`):** Rate limiting with 60 requests/minute per IP
- **Web (`apps/web/src/index.ts`):** Rate limiting with 60 requests/minute per IP
- **Implementation:** In-memory sliding window rate limiter with automatic cleanup (both apps)
- **Threshold:** 60 requests per 60-second window per IP; HTTP 429 when exceeded

### 3. Path Validation (L1 - FIXED)

- **Files:**
  - `packages/core/src/db/database.ts` - validates TTM_DB_PATH
  - `apps/web/src/db.ts` - validates TTM_LEADERBOARD_DB_PATH
- **Validates:** Path traversal (..), length limits (1-4096 chars), format correctness

### 4. CLI Export Path Validation (M5 - FIXED)

- **File:** `packages/cli/src/index.ts`
- **Function:** `validateExportPath()` - validates output path before writing

### 5. Authenticated Tauri IPC (M6 - FIXED)

- **Files:**
  - `apps/desktop-tauri/src-tauri/src/lib.rs` - sends API key in query param
  - `apps/desktop/src/index.ts` - validates API key for /api/summary endpoint
- **Implementation:** Tauri tray polling includes `api_key` query param; desktop server validates against `TTM_DESKTOP_API_KEY` env var

### 6. File Permission Hardening (H1 - PARTIAL)

- **File:** `apps/web/src/db.ts`
- **Change:** Added `chmodSync(databasePath, 0o600)` after database creation
- **Note:** This is a best-effort mitigation. The underlying issue (plaintext token storage) remains - tokens are still stored in `github_users.access_token` plaintext. Full encryption is deferred to future work.

### 7. Session Cleanup (M4 - DEFERRED)

- **Status:** No proactive cleanup implemented
- **Rationale:** Sessions expire on-read via `getWebSession()` check. Proactive cleanup adds complexity without clear benefit for the current usage model. Deferred to future work with explicit documentation.

## Remaining Open Items

1. **Plaintext GitHub OAuth tokens (H1 - PARTIAL)**
   - Tokens still stored in `github_users.access_token` plaintext
   - File permissions hardened to 0o600 as mitigation
   - Full encryption deferred to future work

2. **Proactive session cleanup (M4 - DEFERRED)**
   - Sessions clean up on read, not proactively
   - Deferred to future work

## Evidence of Fixes

1. **Tauri CSP:**
   - [apps/desktop-tauri/src-tauri/tauri.conf.json](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/tauri.conf.json#L22)

2. **HTTP Rate Limiting (M3 - FIXED):**
   - Desktop: [apps/desktop/src/index.ts#L51-60](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L51-60) — rate limit constants and store
   - Desktop: [apps/desktop/src/index.ts#L1870-1896](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L1870-1896) — rate limit enforcement with 429 response
   - Web: [apps/web/src/index.ts#L28-36](/Users/hanyramadan/token%20traker/apps/web/src/index.ts#L28-36) — rate limit constants and store
   - Web: [apps/web/src/index.ts#L888-920](/Users/hanyramadan/token%20traker/apps/web/src/index.ts#L888-920) — rate limit enforcement with 429 response

3. **Core DB Path Validation:**
   - [packages/core/src/db/database.ts#L777-827](/Users/hanyramadan/token%20traker/packages/core/src/db/database.ts#L777-827)

4. **Leaderboard DB Path Validation:**
   - [apps/web/src/db.ts#L518-561](/Users/hanyramadan/token%20traker/apps/web/src/db.ts#L518-561)

5. **CLI Export Path Validation:**
   - [packages/cli/src/index.ts#L655-690](/Users/hanyramadan/token%20traker/packages/cli/src/index.ts#L655-690)

6. **Tauri API Key Sending:**
   - [apps/desktop-tauri/src-tauri/src/lib.rs#L28-35](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/src/lib.rs#L28-35)
   - [apps/desktop-tauri/src-tauri/src/lib.rs#L113-120](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/src/lib.rs#L113-120)

7. **Desktop API Key Validation:**
   - [apps/desktop/src/index.ts#L25](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L25)
   - [apps/desktop/src/index.ts#L820-840](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L820-840)

8. **File Permission Hardening:**
   - [apps/web/src/db.ts#L1](/Users/hanyramadan/token%20traker/apps/web/src/db.ts#L1)
   - [apps/web/src/db.ts#L83-89](/Users/hanyramadan/token%20traker/apps/web/src/db.ts#L83-89)

## Verification Commands

```bash
# Build
npm run build

# Typecheck
npm run typecheck
```

## Conclusion

The 2026-04-05 remediation pass addressed the following from the priority list:

- ✅ Fixed Tauri CSP (H2)
- ✅ Added authenticated Tauri→desktop IPC (M6)
- ✅ Added HTTP rate limiting to both desktop and web apps (M3 — 60 req/min per IP)
- ✅ Added DB path validation for TTM_DB_PATH and TTM_LEADERBOARD_DB_PATH (L1)
- ✅ Added CLI export path validation (M5)
- ✅ Added file permission hardening for leaderboard DB (H1 - partial)
- ⚠️ Session cleanup deferred (M4)

The remaining high-severity issue is plaintext GitHub OAuth token storage (H1), which has a file-permission mitigation in place but requires encryption for full remediation. This is deferred to future work.
