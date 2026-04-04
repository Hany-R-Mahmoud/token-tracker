# Tasks: Team Leaderboard UI And Settings

- [x] C001 Build leaderboard route/page (GET /leaderboard with full HTML page, period query param support)
- [x] C002 Build leaderboard header with period tabs and team context (Week/30 days/All time tabs with functional links, team name in subtitle)
- [x] C003 Build leaderboard table with rank/member/efficiency/sessions/tokens/cost/success/cache columns (8 columns, current user highlighted with "You" badge)
- [ ] C004 Build member detail drawer with contextual breakdown and team-average comparison — deferred (requires JS-based interactive drawer; current server-rendered HTML doesn't support this; noted for future SPA migration)
- [x] C005 Build anonymous, opted-out, and insufficient-data states (empty state for no data; My Rank card shows "Not enough sessions" for opted-in users below threshold; period tabs always visible)
- [x] C006 Build "My Rank" personal dashboard card (shows rank/total when user is on leaderboard, or "Not enough sessions" message when opted-in but below threshold)
- [x] C007 Add leaderboard link to navigation (present in nav on all pages: Home, Settings, Leaderboard)
- [x] C008 Polish settings page for GitHub connection and leaderboard opt-in (connect/disconnect buttons, opt-in/opt-out forms with clear status badges)
- [x] C009 Validate privacy behavior in the UI (Privacy Policy card on home page with shared/never-shared lists, "Admins cannot override" statement)
- [x] C010 Validate accessibility, responsiveness, and empty/loading states (semantic HTML, aria labels on status badges, empty states for all surfaces, max-width 800px responsive layout)
