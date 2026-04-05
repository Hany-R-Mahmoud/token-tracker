# Fix Spec 3: Tauri Hardening

**Findings:** H2, M6
**Priority:** High

## H2: Tauri CSP is `null` (disabled)

**File:** `apps/desktop-tauri/src-tauri/tauri.conf.json:23`

**Issue:** The Tauri app loads external content (`http://localhost:3100/`) with CSP disabled. If the desktop server is compromised or serves malicious content, the webview has full access to Tauri's native APIs.

**Exploit scenario:** A compromised dependency or DNS rebinding attack could inject malicious scripts into the served pages, which would then have unrestricted access to Tauri's native APIs (file system, shell, etc.).

**Remediation:** Set a restrictive CSP in `tauri.conf.json`:
```json
"csp": "default-src 'self' http://localhost:3100; script-src 'self' http://localhost:3100 'unsafe-inline'; style-src 'self' 'unsafe-inline' http://localhost:3100"
```

## M6: `ureq` dependency has no TLS certificate pinning

**File:** `apps/desktop-tauri/src-tauri/src/lib.rs:110`, `Cargo.toml:24`

**Issue:** The Tauri app polls `http://localhost:3100/api/summary` over plain HTTP. A compromised local process could MITM the connection and return fabricated spend data.

**Risk assessment:** Low for localhost traffic, but worth noting for production.

**Remediation:** Add a simple shared secret or HMAC for inter-process communication if the desktop server is ever exposed beyond loopback.

## Implementation Plan

1. Update `tauri.conf.json` with restrictive CSP
2. Add `X-Request-Auth` header with shared secret for Tauri → desktop server communication
3. Validate the header in the desktop server before responding to `/api/summary`
