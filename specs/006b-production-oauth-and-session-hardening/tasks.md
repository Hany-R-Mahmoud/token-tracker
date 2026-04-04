# Tasks: Production OAuth And Session Hardening

- [x] B001 Reviewed current `apps/web` auth flow and identified placeholder callback/session behavior to replace
- [x] B002 Implemented GitHub OAuth code exchange for configured environments via GitHub token and user-profile fetch
- [x] B003 Fetch and persist real GitHub user identity after exchange with minimal scopes only
- [x] B004 Replaced placeholder cookie-only callback completion with a DB-backed session path (`web_sessions`, `ttm_session`)
- [x] B005 Hardened cookie/session handling for connected-user state (HttpOnly, SameSite=Strict, session expiry, logout cleanup)
- [x] B006 Verified disconnect/logout clears the authenticated session safely
- [x] B007 Validated CSRF/state handling and adverse callback cases with real handler tests
- [x] B008 Updated `.env.example`, README, and setup docs honestly
