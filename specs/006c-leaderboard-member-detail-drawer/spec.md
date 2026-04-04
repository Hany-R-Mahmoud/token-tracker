# Feature Specification: Leaderboard Member Detail Drawer

**Feature Branch**: `006c-leaderboard-member-detail-drawer`  
**Created**: 2026-04-03  
**Status**: Draft  
**Primary Execution Owner**: OpenCode

## Goal

Add a lightweight interactive member detail drawer to the leaderboard so a team
member can inspect aggregated context for another ranked member without leaving
the page or exposing raw session content.

## Scope

- row interaction behavior
- drawer/panel UI
- aggregated member detail payload
- empty/loading/error handling
- privacy-safe copy and presentation

## Requirements

- Clicking or activating a leaderboard row opens a detail drawer/panel.
- The drawer shows aggregated-only data, such as:
  - efficiency score
  - session count
  - token/cost totals
  - cache rate
  - outcome success rate
  - period/window context
- The drawer must not reveal raw prompts, transcripts, code, file paths, or
  per-message content.
- Keyboard accessibility must work for opening and closing the drawer.
- Anonymous/opted-out users must not leak hidden identity data.

## Acceptable Implementation

- small client-side JS enhancement in the server-rendered app
- lightweight API route or embedded payloads if needed

## Mandatory Agents

- `agent-orchestrator`
- `agent-impeccable`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-security`
