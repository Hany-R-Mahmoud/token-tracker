# Regression Checklist: Token Tracker Refactor Program

**Parent Issue**: [TTM-14](/TTM/issues/TTM-14) — Refactor program: modularize desktop, web, CLI, and core boundaries  
**Status**: Draft for verification  
**Created**: 2026-04-12 by TTM Tester

---

## Purpose

This checklist provides verification steps to ensure refactor work across desktop, web, and CLI surfaces maintains existing behavior. Each phase of refactoring should pass these checks before merging.

---

## Build & Typecheck Expectations

### Phase: Pre-Refactor Baseline

| Check | Command | Expected Result |
|-------|---------|-----------------|
| TypeScript compilation | `npm run build` | Exit code 0, no errors |
| TypeScript strict check | `npm run typecheck` | Exit code 0, no errors |
| Package structure | `ls packages/*/dist apps/*/dist` | All expected dist folders exist |

### Phase: Post-Refactor Validation

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Rebuild all packages | `npm run build` | Exit code 0, no new errors |
| Typecheck all packages | `npm run typecheck` | Exit code 0, no new type errors |
| CLI executable works | `node packages/cli/dist/index.js doctor` | Outputs database path, provider status |
| Desktop starts | `TTM_DESKTOP_PORT=3110 node apps/desktop/dist/index.js &` | Server starts on configured port |
| Web starts | `TTM_WEB_PORT=3201 node apps/web/dist/index.js &` | Server starts on configured port |

---

## Desktop Routes & APIs to Verify

### Core Routes

| Route | Method | Verification |
|-------|--------|--------------|
| `/` | GET | Returns HTML with overview UI |
| `/menubar` | GET | Returns menubar HTML with snapshot data |
| `/menubar?mode=minimal` | GET | Returns compact menubar HTML |
| `/analytics` | GET | Returns analytics page HTML |
| `/analytics?period=1d` | GET | Returns analytics for 1-day period |
| `/analytics?period=7d` | GET | Returns analytics for 7-day period |
| `/analytics?period=1m` | GET | Returns analytics for 30-day period |
| `/analytics?period=all` | GET | Returns analytics for all time |
| `/export/analytics-svg` | GET | Returns SVG file download |
| `/export/analytics-svg?period=7d` | GET | Returns SVG for specified period |

### API Endpoints

| Endpoint | Method | Verification |
|----------|--------|--------------|
| `/api/summary` | GET | Returns JSON with `providerSummaries`, `sessionCount`, `totalTokens`, `totalCostUsd` |
| `/api/summary?api_key=...` | GET | With valid key, returns summary; with invalid, returns 401 |
| `/api/runtime-status` | GET | Returns JSON with runtime status objects |
| `/api/analytics` | GET | Returns JSON with `recentSessions`, `sessionCount`, `totalTokens`, `totalCostUsd` |
| `/api/refresh` | GET | Returns JSON with refresh state |
| `/api/notification-check` | GET | Returns JSON with notification payload |
| `/api/notification-check?api_key=...` | GET | With valid key, returns notification data |

### Query Parameter Behavior

| Parameter | Values | Verification |
|-----------|--------|--------------|
| `period` | `1h`, `1d`, `7d`, `1m`, `all` | Data filtered accordingly |
| `days` (legacy) | `0`→`1h`, `1`→`1d`, `7`→`7d`, `30+`→`1m`, else→`all` | Backward compatible mapping works |
| `page` | Number ≥1 | Pagination works correctly |
| `mode` | `minimal`, `detailed` | Menubar renders in correct mode |
| `q` | Search string | Filters sessions by provider/model |
| `provider` | Provider name | Filters by provider |
| `model` | Model name | Filters by model |

### Menubar Features

| Feature | Verification |
|---------|--------------|
| Provider summaries | Shows tokens, cost, reset, efficiency per provider |
| Period selector | Shows correct period label (Today, Last hour, 7 days, 30 days, All time) |
| Session list | Shows recent sessions with pagination |
| Context pressure | Shows low/medium/high/critical counts |
| Active surface | Shows window context signal with color band |
| Runtime status | Shows active tool indicators |
| Empty state | Shows appropriate message when no sessions |
| Error state | Shows error message when data unavailable |

### Security

| Check | Verification |
|-------|--------------|
| Security headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, etc. present |
| Rate limiting | 429 returned after threshold requests from same IP |
| API key validation | 401 returned for `/api/summary` and `/api/notification-check` without valid key |

---

## Web Routes & Auth Flows to Verify

### Routes

| Route | Method | Verification |
|-------|--------|--------------|
| `/` | GET | Returns home page HTML |
| `/leaderboard` | GET | Returns leaderboard page HTML |
| `/leaderboard?period=7d` | GET | Returns leaderboard for 7 days |
| `/leaderboard?period=1m` | GET | Returns leaderboard for 30 days |
| `/settings` | GET | Returns settings page HTML (or redirects) |
| `/privacy` | GET | Returns privacy policy HTML |

### API Endpoints

| Endpoint | Method | Verification |
|----------|--------|--------------|
| `/api/leaderboard` | GET | Returns JSON with leaderboard data |
| `/api/leaderboard?period=7d` | GET | Returns filtered leaderboard |
| `/api/leaderboard/sync` | POST | Accepts session data, returns sync status |
| `/api/sync` | POST | Accepts local session sync, returns status |

### OAuth Flow

| Step | Verification |
|------|--------------|
| Unauthenticated request to `/` | Shows login button or redirects to GitHub |
| Click "Login with GitHub" | Redirects to GitHub OAuth authorization |
| Successful OAuth callback | Sets session cookie, redirects to home |
| Logout | Clears session cookie, redirects to home |

### Rate Limiting

| Check | Verification |
|-------|--------------|
| Normal requests | Succeed with 200 |
| Burst requests (60+/min) | Returns 429 after threshold |

### Security Headers

| Check | Verification |
|-------|--------------|
| `X-Content-Type-Options` | `nosniff` present |
| `X-Frame-Options` | `DENY` present |
| Cookie attributes | `HttpOnly`, `SameSite= Lax` configured |

---

## CLI Commands to Verify

### Commands

| Command | Verification |
|---------|--------------|
| `ttm doctor` | Outputs: database path, provider status, sources found, health |
| `ttm providers` | Lists all known providers with status |
| `ttm summary` | Outputs token summary with provider breakdown |
| `ttm summary --period 7d` | Outputs summary for last 7 days |
| `ttm sessions` | Lists recent sessions with pagination |
| `ttm sessions --provider claude` | Filters sessions by provider |
| `ttm sessions --model claude-3.5-sonnet` | Filters sessions by model |
| `ttm analyze <session-id>` | Outputs detailed session analysis |
| `ttm import --file <path>` | Imports sessions from file |
| `ttm export --format json` | Exports sessions to JSON |
| `ttm compare-snapshot <file>` | Compares current state to saved snapshot |
| `ttm help` | Shows help message |

### Doctor Command Expected Output

```
database: /path/to/ttm.sqlite
provider: codex
status: active
sources found: N
provider health: healthy|warning|error
issues: none|<list>

provider: claude
...

provider: opencode
...
```

### Summary Command Expected Output

| Field | Verification |
|-------|--------------|
| Provider name | Shows provider identifier |
| Sessions | Count for period |
| Tokens | Total tokens (input + output) |
| Cost | Total cost in USD |
| Period | Shows configured period |

---

## Integration Tests

### Data Flow

| Test | Verification |
|------|--------------|
| Desktop reads from database | Sessions appear in overview after CLI import |
| Web syncs to leaderboard | Sessions appear in leaderboard after sync |
| CLI imports sessions | Data appears in desktop and web |
| Period filtering | Desktop, web, and CLI all respect period parameter |

### Error Handling

| Scenario | Expected Behavior |
|----------|-------------------|
| Database missing | Desktop/Web/CLI shows error, does not crash |
| Database corrupted | Graceful error message, not stack trace |
| Invalid period param | Falls back to default (1m) |
| Invalid API key | Returns 401, does not expose internal error |
| Rate limit exceeded | Returns 429 with retry-after hint |

---

## Critical Behaviors to Preserve

### Before any refactor, verify:

1. **No data loss**: All existing sessions remain queryable after refactor
2. **No feature loss**: All routes and commands work as before
3. **No performance regression**: Response times remain within 2x baseline
4. **No breaking changes**: CLI flags, API contracts unchanged

### After each refactor phase:

1. Run full build/typecheck
2. Test each desktop route manually or via script
3. Test each web route
4. Run each CLI command
5. Verify database reads/writes correctly
6. Check logs for errors/warnings

---

## Test Execution Notes

- Use alternate ports when testing locally: `TTM_DESKTOP_PORT=3110`, `TTM_WEB_PORT=3201`
- Database location: `~/.ttm/ttm.sqlite`
- Check for console errors in server output
- Verify JSON responses are valid (no malformed output)
- Test both authenticated and unauthenticated web routes

---

## Open Questions

- Should E2E tests be added for critical user flows?
- Should integration tests be added for database operations?
- Is there a need for performance benchmarking baseline?

---

**Next Steps**: This checklist should be reviewed and finalized before refactor work begins. Each child issue in the refactor program should reference which checklist items are in scope for that work.