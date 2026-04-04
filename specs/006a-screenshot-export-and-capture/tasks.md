# Tasks: Screenshot Export And Capture

- [x] A001 Review current analytics/overview export surfaces and choose the first export target (analytics summary chosen — highest value surface with aggregated data)
- [x] A002 Choose the smallest stable image-export architecture for the current stack (server-side SVG generation — no browser dependencies, no headless browser, no fragile rendering stack)
- [x] A003 Implement screenshot/image export for the selected target surface (`/export/analytics-svg` endpoint returns SVG with stats, provider cost bars, daily token bars; respects active `days` query param: 7/14/30/90; defaults to 30; invalid values fall back to 30; filename includes window: `token-tracker-analytics-7d.svg`)
- [x] A004 Add success/error messaging for export actions (download link on analytics page, 400 error with JSON message when no data available)
- [x] A005 Ensure exported content excludes raw session/prompt/code details (verified: SVG contains only aggregated stats, provider names, and bar charts — no session IDs, file paths, prompts, or transcripts)
- [x] A006 Keep or refine the existing text clipboard export if still useful (text clipboard button retained alongside SVG download link)
- [x] A007 Validate export behavior across the supported target surfaces (SVG export returns 200 with image/svg+xml, 4275 bytes, valid SVG structure, no sensitive data)
- [x] A008 Update docs and parity language honestly (README.md updated with SVG export feature, PROJECT_PLAN.md updated with Phase 006a status)
