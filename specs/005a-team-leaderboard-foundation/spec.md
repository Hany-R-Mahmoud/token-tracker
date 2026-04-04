# Feature Specification: Team Leaderboard Foundation

**Feature Branch**: `005a-team-leaderboard-foundation`  
**Created**: 2026-04-03  
**Status**: Draft

## Goal

Create the identity, schema, privacy, and architectural foundation for the team
leaderboard.

## Scope

- choose and scaffold the proper app surface for team/web functionality
- GitHub OAuth integration design and implementation
- user GitHub identity persistence
- leaderboard membership + opt-in schema
- privacy model and access rules
- settings-side identity and opt-in controls foundation

## Requirements

- Implement GitHub OAuth with minimal scopes: `read:user`, `user:email`
- Store GitHub identity fields needed for display and deduplication only
- Keep GitHub connection separate from leaderboard opt-in
- Add leaderboard membership schema scoped by user + team
- Define and implement access control boundaries
- Write privacy copy explaining exactly what is shared
- Ensure admins cannot override user opt-in visibility

## Architectural Decision Requirement

OpenCode must explicitly decide whether this feature belongs in:

- a new web app surface, or
- an existing app surface if one already exists in the repo by the time work starts

It must not blindly jam this into the current local desktop shell if that would
produce a poor architecture.

## Mandatory Agents

- `agent-orchestrator`
- `agent-security`
- `agent-impeccable`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
