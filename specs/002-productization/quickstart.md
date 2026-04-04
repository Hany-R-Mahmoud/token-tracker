# Quickstart: Productization And Source Parity

## Goal

Validate the productized local-first build end to end:

- provider coverage remains trustworthy
- analytics and export surfaces work on local data
- desktop shell serves all expected routes
- export output excludes raw transcript bodies

## Baseline Validation

```bash
npm run typecheck
npm run build
node packages/cli/dist/index.js doctor
node packages/cli/dist/index.js providers
node packages/cli/dist/index.js import
node packages/cli/dist/index.js summary
node packages/cli/dist/index.js sessions --provider codex --limit 3
node packages/cli/dist/index.js analyze <session-id>
```

## Desktop Validation

```bash
node apps/desktop/dist/index.js

# expected local routes (all server-rendered HTML unless noted)
# /              — overview with provider summaries + recent sessions
# /?session=<id> — session detail with explanation factors
# /analytics     — model breakdown + daily activity tables
# /menubar       — compact summary prototype (320px wide)
# /api/summary   — JSON summary snapshot
# /api/analytics — JSON analytics snapshot
```

## Export Validation

```bash
# default export (last 30 days)
node packages/cli/dist/index.js export

# custom path + window
node packages/cli/dist/index.js export /tmp/my-export.json --days 7

# verify output excludes raw transcript/prompt bodies
python3 -c "
import json
with open('/tmp/my-export.json') as f:
    data = json.load(f)
for session in data['recentSessions']:
    for key in session.keys():
        assert 'prompt' not in key.lower()
        assert 'transcript' not in key.lower()
        assert 'body' not in key.lower()
print('PASS: no raw prompts/transcripts')
"
```

## Source-Parity Validation

```bash
# validate provider strategy status
node packages/cli/dist/index.js doctor

# expected output:
# codex:     status: validated
# opencode:  status: validated
# cursor:    status: strategy pending
# claude:    status: unavailable
```

## Comparison Validation

```bash
# capture our-side reading for a provider
node packages/cli/dist/index.js compare-snapshot --provider codex

# capture with manual reference app input
node packages/cli/dist/index.js compare-snapshot \
  --provider codex \
  --reference-app codexbar \
  --ref-sessions 217 \
  --ref-tokens 1895191369 \
  --ref-cost-usd 4563.48

# artifacts are written to .ttm/comparisons/comparison-YYYY-MM-DD.json
# status is determined automatically: match | near_match | mismatch | inconclusive
# discrepancies are listed with field name, values, and % difference
```

## Native Wrapper Validation

```bash
# development mode (builds + launches native wrapper with tray/menu bar)
npm run dev --workspace @ttm/desktop-tauri

# production bundle
npm run build --workspace @ttm/desktop-tauri

# output artifacts:
#   src-tauri/target/release/bundle/macos/Token Tracker.app
#   src-tauri/target/release/bundle/dmg/Token Tracker_0.1.0_aarch64.dmg

# expected behavior:
# - native app window opens the dashboard at http://localhost:3100
# - tray/menu bar entry appears with icon
# - tray left-click opens compact menubar window at /menubar
# - "Open Dashboard" menu item focuses the main dashboard window
# - "Quit" exits cleanly
```
