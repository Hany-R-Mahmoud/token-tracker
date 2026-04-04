# Feature Specification: Team Leaderboard UI And Settings

**Feature Branch**: `005c-team-leaderboard-ui-and-settings`  
**Created**: 2026-04-03  
**Status**: Draft

## Goal

Build the user-facing team leaderboard experience and settings flows.

## Scope

- leaderboard page
- leaderboard header and period controls
- leaderboard table
- row/detail drawer
- anonymous/insufficient-data states
- my-rank personal card
- sidebar navigation updates
- opt-in/settings experience polish

## Requirements

- The leaderboard UI must frame the feature as growth and learning, not shaming
- "You" row should be identifiable to the current user
- Anonymous and opted-out handling must match the privacy model
- Detail drawer must show aggregated context only
- Personal dashboard card must only appear for opted-in users
- Loading, empty, and pending-snapshot states must be handled gracefully

## Design Guardrails

- Neutral, supportive language
- No red “worst performer” framing
- Context panels must explain the score, not just display rank
- Opt-in and privacy messaging must be readable in settings

## Mandatory Agents

- `agent-orchestrator`
- `agent-impeccable`
- `agent-security`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
