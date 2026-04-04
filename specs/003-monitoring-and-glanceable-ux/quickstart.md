# Quickstart: Monitoring And Glanceable UX

## Goal

Validate the new monitoring-oriented UX end to end:

- menu bar surface is meaningfully more glanceable
- reset-window information is clearer and more honest
- analytics include visual summaries beyond plain tables
- overview filters remain stable and understandable
- documentation matches shipped behavior

## Baseline Validation

```bash
npm run typecheck
npm run build
node packages/cli/dist/index.js doctor
node packages/cli/dist/index.js summary
node packages/cli/dist/index.js sessions --provider codex --limit 5
```

## Desktop Route Validation

```bash
node apps/desktop/dist/index.js

# expected local routes
# /              — overview with monitoring summaries, filters, recent sessions
# /?session=<id> — session detail
# /analytics     — analytics with visual summaries plus supporting tables
# /menubar       — compact monitoring view
# /api/summary   — JSON summary snapshot
# /api/analytics — JSON analytics snapshot
```

## Monitoring UX Checks

Validate the following manually in the browser:

- `/menubar` communicates top-level usage state without requiring navigation
- `/menubar` remains readable in its compact width
- `/` shows reset-related context clearly where available
- `/` keeps provider/model/search/pagination state understandable
- zero-result filter states provide a clear reset path

## Analytics Checks

Validate the following manually in the browser:

- `/analytics` contains at least one trend-oriented visual summary
- `/analytics` contains at least one distribution-oriented visual summary
- visuals remain understandable with sparse local data
- supporting tables still agree with the visualized aggregates

## Native Wrapper Validation

```bash
npm run dev --workspace @ttm/desktop-tauri
```

Expected behavior:

- native app launches the dashboard window
- tray/menu bar entry still appears
- tray interaction still opens the compact `/menubar` surface
- compact window remains stable after UI changes
- "Open Dashboard" still focuses or reveals the main window cleanly

## Documentation Validation

Verify the following after implementation:

- `/Users/hanyramadan/token traker/README.md` describes only shipped monitoring
  improvements
- `/Users/hanyramadan/token traker/PROJECT_PLAN.md` reflects the new phase and
  current deferred work honestly
- no doc claims imply Cursor or Claude support
