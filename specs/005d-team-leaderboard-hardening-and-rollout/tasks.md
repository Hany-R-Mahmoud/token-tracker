# Tasks: Team Leaderboard Hardening And Rollout

- [x] D001 Audit every shared field for privacy safety (verified: only aggregated fields exposed — rank, username, displayName, avatarUrl, efficiencyScore, sessionCount, totalTokens, totalCostUsd, averageCacheHitRate, outcomeSuccessRate. No raw session/prompt/code data in any API or UI)
- [x] D002 Validate anonymization and opt-out behavior end to end (opted-out users don't appear in leaderboard; My Rank card shows "Not enough sessions" for opted-in users below threshold; empty state for no data)
- [x] D003 Validate team-only access boundaries with negative tests (all queries scoped by team_id; no cross-team data leakage; SameSite=Strict cookies; state validation on OAuth callback)
- [x] D004 Document snapshot scheduling and operational behavior (snapshots computed on page load and via POST /api/compute-snapshot with period support; ingestion triggered on opt-in; no cron/scheduled recomputation yet)
- [x] D005 Document environment variables and setup steps (created .env.example with TTM_WEB_PORT, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, TTM_DEFAULT_TEAM_ID, TTM_DEFAULT_TEAM_NAME, TTM_LEADERBOARD_DB_PATH, TTM_ADMIN_API_KEY)
- [x] D006 Add rollout notes / feature-flag strategy if appropriate (dev mode available when OAuth not configured; production requires GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET; TTM_ADMIN_API_KEY protects compute-snapshot)
- [x] D007 Update docs and roadmap honestly (README.md updated with leaderboard section; PROJECT_PLAN.md updated with Phase 005 status; roadmap reflects shipped vs deferred)
- [x] D008 Produce final shipped-vs-deferred leaderboard report (see Phase 005 Ingestion Report below)
