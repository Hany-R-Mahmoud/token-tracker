# Tasks: Team Leaderboard Foundation

- [x] A001 Reviewed repo architecture; chose `apps/web` as new web app surface for team features
- [x] A002 Documented architectural decision: separate web surface, not jammed into desktop shell
- [x] A003 Added GitHub OAuth environment/config requirements (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, TTM_ADMIN_API_KEY)
- [x] A004 Added schema for GitHub identity fields (github_users table with github_id, username, display_name, avatar_url, email, access_token)
- [x] A005 Added schema for leaderboard memberships (leaderboard_memberships table with user_github_id, team_id, opted_in, opted_in_at, opted_out_at)
- [x] A006 Implemented GitHub OAuth start/callback/disconnect flow (with dev mode fallback when OAuth not configured; state validation for CSRF prevention; full token exchange blocked without credentials)
- [x] A007 Added settings UI foundation for GitHub connection state (connect/disconnect buttons)
- [x] A008 Added settings UI foundation for leaderboard opt-in state and copy (opt-in/opt-out forms, privacy policy display)
- [x] A009 Implemented privacy and access rules for identity + memberships (TTM_PRIVACY_POLICY, admin cannot override, explicit opt-in required)
- [x] A010 Validated OAuth flow (dev mode), identity persistence, and opt-in gating (all routes return 200, /api/me and /api/leaderboard return correct JSON)
