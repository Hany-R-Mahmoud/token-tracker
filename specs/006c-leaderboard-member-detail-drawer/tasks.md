# Tasks: Leaderboard Member Detail Drawer

- [x] C001 Design the smallest client-side interaction model for row-to-drawer behavior (embedded JSON payloads in data-member attribute, tiny vanilla JS script, no framework)
- [x] C002 Define the aggregated member-detail payload shape (displayName, username, efficiencyScore, sessionCount, totalTokens, totalCostUsd, averageCacheHitRate, outcomeSuccessRate, period, windowDays — all aggregated, no raw session data)
- [x] C003 Implement drawer open/close behavior from leaderboard rows (click or Enter/Space opens drawer, Escape or close button closes, overlay click closes)
- [x] C004 Render aggregated member context without leaking raw session content (verified: only aggregated stats shown, no prompts/transcripts/session IDs/file paths)
- [x] C005 Add keyboard/focus handling and close affordances (tabindex=0, role=button, aria-label, Escape key handler, focus on close button when opened)
- [x] C006 Handle empty/loading/error states cleanly (drawer only populated from valid data-member attribute; no loading state needed since data is embedded; no error state since data is pre-rendered)
- [x] C007 Validate privacy rules for opted-out/hidden users (only opted-in members appear in leaderboard; drawer data comes from leaderboard snapshot which only includes opted-in members; no hidden user data leaked)
- [x] C008 Update docs and task status honestly
