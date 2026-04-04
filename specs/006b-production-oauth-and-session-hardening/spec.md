# Feature Specification: Production OAuth And Session Hardening

**Feature Branch**: `006b-production-oauth-and-session-hardening`  
**Created**: 2026-04-03  
**Status**: Draft  
**Primary Execution Owner**: Codex

## Goal

Replace the current placeholder GitHub OAuth callback path with a real
production-capable identity flow and basic secure session handling for
`apps/web`.

## Scope

- real GitHub code exchange
- user profile fetch and persistence
- session cookie/session record design
- logout/disconnect correctness
- CSRF/session boundary hardening
- docs/setup updates

## Requirements

- Complete the GitHub OAuth code exchange using `GITHUB_CLIENT_ID` and
  `GITHUB_CLIENT_SECRET`.
- Validate OAuth state and reject mismatches.
- Fetch the authenticated GitHub user profile with minimal scopes only.
- Persist only the identity fields needed for display/deduplication.
- Replace placeholder `github_id=0` behavior with a real connected-user session.
- Use secure cookie/session semantics appropriate for the current Node web app.
- Keep GitHub OAuth limited to identity; no repo/code access.

## Acceptable Completion

- local/dev and configured-production flows both work
- missing credentials still degrade honestly
- the app remains usable in dev mode without pretending production auth exists

## Not Acceptable

- storing broad GitHub scopes
- silently trusting callback params without exchange/user fetch
- mixing placeholder and real session states without clear distinction

## Mandatory Agents

- `agent-orchestrator`
- `agent-security`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-debugging`
