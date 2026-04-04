# Feature Specification: Analytics, Sharing, And Theme Parity

**Feature Branch**: `004b-analytics-sharing-and-theme-parity`  
**Created**: 2026-04-03  
**Status**: Draft

## Goal

Close the main dashboard-side gaps versus AI Token Monitor by improving
analytics depth, sharing/export UX, and visual theming.

## Scope

- 7/30-day controls and richer time-window navigation
- heatmap / activity graph
- cache-efficiency visualization
- themes and dark mode
- screenshot / clipboard export
- leaderboard / social surface

## Requirements

- Add explicit time-window controls at minimum for 7 and 30 days.
- Add richer daily/weekly navigation where it improves readability.
- Add an activity heatmap or equivalent density view.
- Add cache-efficiency visualization where data exists, and honest fallback
  messaging where it does not.
- Add theme support including dark mode.
- Add screenshot/export-to-clipboard flows for useful dashboard summaries.
- Add a leaderboard/social surface in a way that is explicitly opt-in and does
  not break the local-first default.

## Guardrails

- local-first remains the default mode
- leaderboard/social must be opt-in and clearly separated from local core flows
- do not fake cache metrics for providers that cannot support them

## Mandatory Agents

- `agent-orchestrator`
- `agent-impeccable`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-security`
