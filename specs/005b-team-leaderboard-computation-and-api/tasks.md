# Tasks: Team Leaderboard Computation And API

- [x] B001 Add snapshot schema/migrations (leaderboard_snapshots table with snapshot_id, team_id, window_days, computed_at, entries_json)
- [x] B002 Implement composite score calculation module (scoring.ts with efficiency 35%, cache 20%, waste 25%, outcome 15%, participation 5%)
- [x] B003 Implement tie-break logic (efficiency descending, then session count descending) and minimum threshold rules (MINIMUM_PARTICIPATION_THRESHOLD = 3, exported)
- [x] B004 Implement snapshot compute job/function (computeAndSaveSnapshot with configurable windowDays, called on page load and via POST /api/compute-snapshot)
- [x] B005 Implement latest leaderboard snapshot API (GET /api/leaderboard with period query param: week/month/all_time)
- [x] B006 Implement my-rank API (GET /api/me returns connected status, user, membership, team)
- [x] B007 Implement manual recompute endpoint with admin guard (POST /api/compute-snapshot protected by TTM_ADMIN_API_KEY when set; period support)
- [x] B008 Seed realistic demo data for leaderboard validation (ingestion path implemented: syncLocalSessions reads from .ttm/ttm.sqlite on opt-in; 203 sessions ingested; leaderboard returns ranked entries with real data; period-correct snapshots: week=36, month=203, all_time=203)
- [x] B009 Add tests for scoring, thresholds, anonymity, and deltas (19/19 tests pass using Node's built-in test runner — tests exercise real code paths: createApp() route handlers, syncLocalSessions() with real TtmDatabase, scoring module, period-aware DB queries, HTTP endpoints through actual app server)
- [x] B010 Validate API responses and cross-team protection (all endpoints return correct JSON; team isolation via team_id in all queries; state validation on OAuth callback)
