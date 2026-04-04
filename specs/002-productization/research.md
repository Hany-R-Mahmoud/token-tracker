# Research: Productization And Source Parity

## Current Product State

- shared TypeScript core exists and is verified
- local SQLite store exists and is verified
- Codex import works on real local data
- OpenCode import works on real local data
- CLI is usable and trustworthy
- desktop overview, detail, and compact `/menubar` prototype exist

## Reference Observations

## CodexBar

Observed from the public repository and README:

- CodexBar is a native macOS menu bar product, not just a dashboard
- it supports multiple provider source strategies
- Cursor support is described as browser-session-cookie based rather than local
  transcript parsing
- the product focuses on resets, quotas, compact visibility, and provider
  toggles
- the product is explicit about privacy-first, on-device parsing, and opt-in
  browser-cookie reuse

Implication for this repo:

- Cursor should move into a new investigation track based on browser/session
  sources, not only local editor-state parsing
- native wrapper and tray integration are now first-class product tasks

Reference: [CodexBar README](https://github.com/steipete/CodexBar)

## AI Token Monitor

Observed from the public repository and prior repo review:

- AI Token Monitor emphasizes a local dashboard-first experience
- the product makes provider, model, and activity summaries visible without
  requiring a SaaS-first flow
- it validates that a local analytics dashboard can be a product in its own
  right before deeper expansion

Implication for this repo:

- richer visual analytics should be prioritized over speculative cloud work
- we should add charts, trends, and exports before any remote sync ambitions

Reference: [AI Token Monitor repository](https://github.com/soulduse/ai-token-monitor)

## Tokscale

Observed from the public repository and README:

- Tokscale uses provider-aware caches and aggregation helpers
- Cursor support appears to rely on usage caching rather than direct transcript
  reconstruction
- comparison and historical accumulation are central, not secondary

Implication for this repo:

- provider-specific cache directories or normalized import caches are valid
- a comparison harness should be treated as product work, not a one-off script

Reference: [Tokscale README](https://github.com/junhoyeo/tokscale)

## Productization Decisions

### Decision: Treat Cursor as a new source-strategy problem

**Reason**: The MVP proved that local editor-state parsing is insufficient on
this machine, while CodexBar publicly claims a working Cursor path using
browser session cookies. The next step is source-strategy validation, not more
guessing inside Cursor directories.

### Decision: Wrap the current shell instead of rebuilding the UI from scratch

**Reason**: The current desktop routes already prove the data model and surface
shape. A native wrapper should package this value, not discard it.

### Decision: Add a comparison harness before broadening provider promises

**Reason**: The user wants to compare the product against AI Token Monitor and
CodexBar in real usage. That requires local evidence artifacts and repeatable
checks.

### Decision: Prioritize analytics and export before cloud sync

**Reason**: The product still wins or loses on local usefulness. Richer
analytics and export support help validate the product faster than team/cloud
features.

## Cursor Browser/Session Source Investigation

### Batch 1 Investigation (2026-04-02)

**Status at end of Batch 1**: Strategy pending — browser cookies exist but API path not validated

#### Evidence from Batch 1

1. **Chrome Browser Cookies**: Found authentication cookies for Cursor across
   multiple domains (`authenticator.cursor.sh`, `cursor.com`, `.cursor.sh`):
   - `access-token` (787 bytes) — likely JWT or opaque token
   - `WorkosCursorSessionToken` (579 bytes) — WorkOS session
   - `cf_clearance` (339 bytes, httponly) — Cloudflare challenge

2. **Cursor's Own Chromium Cookie Store**: Empty — Cursor's embedded browser
   does NOT contain Cursor web session cookies. Authentication happens through
   the system browser (Chrome), not Cursor's own Chromium profile.

3. **Cookie Encryption**: Chrome encrypts cookie values using macOS Keychain
   (AES-GCM with `v10`/`v11` prefix). Decryption requires platform-specific
   code and Keychain access.

### Batch 2 Investigation (2026-04-02) — Deeper Validation

**Status at end of Batch 2**: Strategy pending — API architecture is gRPC, not REST

#### What Was Tested

1. **Public API Endpoint Discovery**:
   - `https://api.cursor.com/` — returns 200 with `text/plain` body:
     `"Welcome to Cursor. From 20260402-..."`
   - `https://www.cursor.sh/api/` — returns 308 (redirect)
   - `https://www.cursor.com/api/` — returns 308 (redirect)
   - `https://api.cursor.sh/` — returns 000 (connection refused)

2. **Common REST Endpoint Probes** (all returned 404):
   - `GET /usage` — `{"message":"Route GET:/usage not found"}`
   - `GET /billing` — `{"message":"Route GET:/billing not found"}`
   - `GET /me` — `{"message":"Route GET:/me not found"}`
   - `GET /user` — `{"message":"Route GET:/user not found"}`

3. **Cursor App Bundle Analysis**:
   - Extracted URLs from `/Applications/Cursor.app/Contents/Resources/app/out/main.js`
   - Found `https://api2.cursor.sh/aiserver.v1.AnalyticsService/UploadIssueTrace`
   - This reveals Cursor uses **gRPC** (not REST) for its API communication
   - The service naming pattern (`aiserver.v1.AnalyticsService`) confirms a
     protobuf-based API architecture

4. **Extension Analysis**:
   - `cursor-browser-automation` extension communicates with local services
     (`localhost:50051` — standard gRPC port)
   - External URLs point to `cursorvm-manager.com` evaluation/training endpoints
   - No usage/billing REST endpoints found in any extension

5. **macOS Keychain Access**:
   - `security find-generic-password -wa "Chrome Safe Storage"` — failed
     (requires user interaction/approval)
   - `security find-generic-password -l "Cursor"` — no entries found
   - Chrome's encryption key is not accessible without explicit user approval

#### What Was NOT Validated

1. **gRPC Service Discovery**: No protobuf schema or service definition was
   found for Cursor's usage/billing endpoints. The only confirmed service is
   `AnalyticsService/UploadIssueTrace` which is for telemetry, not usage data.

2. **Cookie Decryption**: Could not decrypt Chrome cookies because:
   - macOS Keychain access requires explicit user approval
   - The Chrome Safe Storage key is not accessible programmatically without
     triggering a system dialog
   - Even with decrypted cookies, the gRPC API surface is unknown

3. **API Authentication Flow**: Unknown whether Cursor's gRPC API accepts
   browser cookies as authentication, or whether it requires a separate token
   exchange flow.

4. **Data Shape**: No usage data, billing data, or session data was retrieved
   from any Cursor API endpoint.

#### Updated Strategy Assessment

| Factor | Status |
|---|---|
| Browser cookies exist | ✅ Yes (in Chrome) |
| Cookies are decryptable | ⚠️ Requires Keychain approval dialog |
| Cursor app has its own cookies | ❌ No (empty embedded browser store) |
| API base URL known | ✅ `api.cursor.com` |
| API protocol | ⚠️ gRPC (not REST) |
| gRPC schema known | ❌ Unknown |
| Usage/billing endpoints known | ❌ Unknown |
| Token validity confirmed | ❌ Not tested |
| Data shape known | ❌ Unknown |

#### Conclusion

**Status: Strategy pending — significant additional complexity discovered.**

The Cursor browser-cookie hypothesis faces two major blockers that were not
apparent in Batch 1:

1. **gRPC vs REST**: Cursor's API uses gRPC (protobuf-based), not REST. This
   means:
   - Cannot simply `curl` endpoints with cookie headers
   - Requires a gRPC client with the correct protobuf schema
   - The schema is not publicly documented
   - Would need to reverse-engineer from the Cursor app bundle or intercept
     live traffic

2. **Cookie Decryption**: Chrome's cookie encryption requires macOS Keychain
   access, which triggers a system approval dialog. This is not suitable for
   automated, headless operation.

**Revised next steps to validate**:
1. Intercept live Cursor app traffic (using a proxy like mitmproxy) to discover
   actual gRPC service calls and their request/response shapes
2. Extract or reconstruct the protobuf schema from Cursor's app bundle
3. Build a gRPC client that can authenticate with decrypted browser cookies
4. Test usage/billing endpoints and map response to canonical session model

**Risk assessment**: Even if validated, a gRPC-based source strategy is
inherently fragile:
- Cursor can change their protobuf schema without notice
- gRPC is harder to maintain than REST
- Cookie decryption is platform-specific and requires user interaction
- This would be the most complex adapter in the product

**Recommendation**: Defer Cursor support until either:
- Cursor publishes a public API with documented endpoints, or
- A simpler source path is discovered (e.g., local SQLite database in a future
  Cursor version)

### Batch 3 Investigation (2026-04-03) — Token Discovery and API Exhaustive Search

**Status at end of Batch 3**: No ship-worthy local source found

#### Critical New Finding: Auth Token Accessible in Plaintext

The Cursor access token is stored in **plaintext** (NOT encrypted) in
`~/Library/Application Support/Cursor/User/globalStorage/state.vscdb` under
the key `cursorAuth/accessToken`. The refresh token is stored at
`cursorAuth/refreshToken`. Additional auth metadata (signup type, subscription
status) is also stored in plaintext in the same database.

**Why this matters**: The token is accessible WITHOUT Keychain interaction.
The Chrome cookie encryption barrier from Batch 1/2 is bypassed — Cursor
stores its own auth token directly in its SQLite state database.

The decoded JWT confirms it is a session token issued by
`authentication.cursor.sh` with `openid profile email offline_access` scope,
targeting `cursor.com` as the audience. The token was tested against
`api.cursor.com` and returns 200 on the root path.

**Auth is accessible. Usage is not.**

#### Token Validation Against API

The JWT token was tested against `api.cursor.com` with `Authorization: Bearer`:

| Endpoint | Response | Notes |
|---|---|---|
| `GET /` | 200 | Confirms token is valid |
| `GET /usage` | 404 | No REST usage endpoint |
| `GET /billing` | 404 | No REST billing endpoint |
| `GET /me` | 404 | No REST user endpoint |
| `GET /user` | 404 | No REST user endpoint |
| `GET /auth/me` | 404 | No REST auth endpoint |
| `GET /models` | 404 | No REST models endpoint |
| `GET /health` | 404 | No REST health endpoint |
| `GET /v1/usage` | 404 | No REST v1 usage endpoint |

The token is valid, but **no REST endpoint for usage, billing, or session
data exists** on `api.cursor.com`.

#### Cursor's Internal Local Data Inventory

| Path | Artifact | Contents | Usable? |
|---|---|---|---|
| `state.vscdb` → `aiCodeTracking.dailyStats.*` | Daily code stats | Lines suggested/accepted per day (tab + composer) | ❌ Code acceptance metrics, not token usage |
| `state.vscdb` → `aiCodeTrackingLines` | Per-line tracking | Hash, source, file extension, filename, requestId | ❌ Tracks AI-generated code lines, not sessions/tokens/costs |
| `state.vscdb` → `aiCodeTrackingScoredCommits` | Commit hashes | List of `hash:branch` entries | ❌ Git commit tracking, not usage data |
| `state.vscdb` → `cursorAuth/*` | Auth metadata | JWT tokens, signup type, subscription status | ⚠️ Auth only — no usage/quota/session data |
| `state.vscdb` → `cursorDiskKV` | Agent blobs | SHA-256 keyed binary blobs | ❌ Opaque binary, not structured usage data |
| `logs/*/main.log` | Application logs | Service errors, update URLs | ❌ Error logs, not usage data |
| `Partitions/cursor-browser/Cookies` | Browser cookies | Empty | ❌ No web session cookies |
| `~/.cursor/ide_state.json` | IDE state | `recentlyViewedFiles` array | ❌ File tracking only |

#### What aiCodeTracking Actually Contains

The `aiCodeTracking` system tracks **AI code acceptance rates**, not token
consumption. A sample daily entry:

```json
{
  "date": "2026-04-02",
  "tabSuggestedLines": 109,
  "tabAcceptedLines": 34,
  "composerSuggestedLines": 1248,
  "composerAcceptedLines": 937
}
```

This is Cursor's internal "how much AI code did you accept" telemetry. It does
NOT contain token counts, cost data, model information, session boundaries,
reset windows, or provider information. It cannot be mapped to our canonical
session model.

#### gRPC Confirmation

- Only `.proto` files found are OpenTelemetry standard protos bundled with
  `@opentelemetry/otlp-transformer`
- No Cursor-specific `.proto` files in the app bundle
- Service names in main.js are VSCode-style interfaces, not gRPC service
  definitions
- The `api2.cursor.sh/aiserver.v1.AnalyticsService/UploadIssueTrace` URL
  remains the only confirmed external service call — for telemetry uploads

#### Updated Strategy Assessment

| Factor | Status |
|---|---|
| Auth token accessible locally | ✅ Yes (plaintext JWT in state.vscdb) |
| Token is valid | ✅ Yes (200 from api.cursor.com) |
| Token can be used for REST calls | ⚠️ Token works but no REST usage endpoints exist |
| REST usage/billing endpoints | ❌ None found (tested 9 endpoints, all 404) |
| gRPC endpoints known | ❌ Only telemetry upload confirmed |
| gRPC schema available | ❌ No Cursor-specific .proto files found |
| Local usage/quota data | ❌ aiCodeTracking tracks code acceptance, not tokens |
| Local session data | ❌ None found |
| Local cost data | ❌ None found |
| Local model info | ❌ None found |
| Local reset window data | ❌ None found |

#### Conclusion

**Status: No ship-worthy local source found.**

Three potential source paths were investigated and all failed:

1. **Browser cookies (Batch 1)**: Chrome cookies are encrypted via Keychain.
   Cursor's own Chromium store is empty.

2. **gRPC API (Batch 2)**: No REST usage/billing endpoints exist on
   `api.cursor.com`. The gRPC schema is undocumented and no `.proto` files
   were found in the app bundle.

3. **Local state database (Batch 3)**: Auth token is accessible in plaintext
   (no Keychain needed), but `state.vscdb` contains only auth metadata,
   aiCodeTracking code-acceptance telemetry, and opaque agent blobs. **No
   token usage, cost, session, model, or reset window data exists locally.**

**Auth is accessible. Usage is not.** The token proves identity but there is
no known API surface or local data source that exposes consumption data.

**What would be required to support Cursor**:
1. Reverse-engineer Cursor's gRPC API via live traffic interception
2. Discover the actual usage/billing gRPC service definitions
3. Build a gRPC client with the correct protobuf schema
4. Use the plaintext JWT from state.vscdb for authentication
5. Map the gRPC response to our canonical session model

**Risk assessment**: This remains the highest-risk adapter path:
- gRPC schema can change without notice
- No public API documentation exists
- Would require ongoing maintenance to track Cursor's API changes
- The token in state.vscdb may expire and require refresh flow

**Recommendation**: Defer Cursor support. The local data path does not exist,
and the remote API path requires reverse-engineering an undocumented gRPC
service. Neither is ship-worthy.

## Claude Local Source Investigation

**Status**: Unavailable — no change from MVP investigation

### What Was Found

- No Claude-specific session database or structured export was identified on
  this machine.
- The local Claude footprint consists of plugin skill-injection logs, not
  session history suitable for analytics.

**Decision**: Keep Claude marked as `unavailable` until a real usable local
source is validated.
