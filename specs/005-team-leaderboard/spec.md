# Feature Specification: Team Leaderboard Program

**Feature Branch**: `005-team-leaderboard`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User request for a private team leaderboard inspired by AI Token Monitor's leaderboard pattern, using GitHub identity and TTM's efficiency/analysis strengths.

## Product Goal

Add a **private, team-scoped, opt-in leaderboard** that compares teammates by
quality of AI tool usage rather than by raw token burn.

This is a side program while Phase 004 is still in progress. It must be planned
and specified cleanly so OpenCode can execute it end to end without guessing.

## Strategic Position

AI Token Monitor's leaderboard proves the flow:

- opt-in sharing
- GitHub OAuth identity
- aggregated stats only
- comparison across users

TTM's opportunity is not to clone that leaderboard. It is to build a more
valuable, safer, team-level version:

- private to a team, never global by default
- GitHub-backed identity, but separate opt-in
- ranks by efficiency and outcome quality, not volume
- shows contextual analysis, not just raw spend

## Program Structure

OpenCode must execute these child specs in order:

1. `/Users/hanyramadan/token traker/specs/005a-team-leaderboard-foundation/`
2. `/Users/hanyramadan/token traker/specs/005b-team-leaderboard-computation-and-api/`
3. `/Users/hanyramadan/token traker/specs/005c-team-leaderboard-ui-and-settings/`
4. `/Users/hanyramadan/token traker/specs/005d-team-leaderboard-hardening-and-rollout/`

No later child spec may start before the prior one passes validation gates.

## Mandatory Coverage

Phase 005 must cover all of the following:

- team-scoped private leaderboard model
- GitHub OAuth identity connection
- separate leaderboard opt-in
- snapshot-based ranking computation
- composite efficiency ranking logic
- leaderboard API
- leaderboard page UI
- personal "My Rank" card
- privacy controls and copy
- team-only access controls
- seed/demo data
- rollout, guardrails, and honest limitations

## Mandatory Agent Workflow

OpenCode must use the team deliberately:

### Global Required Agents

1. `agent-orchestrator`
2. `agent-security`
3. `agent-impeccable`
4. `agent-implementer`
5. `agent-tester`
6. `agent-reviewer`
7. `agent-docs`

### Conditional Required Agents

- `agent-debugging`: mandatory if auth callbacks, snapshot jobs, or ranking
  computation become unstable

## Product Guardrails

- The leaderboard is **private to a team**, not global.
- GitHub OAuth is for identity only; repo/code access is out of scope.
- Leaderboard appearance is **opt-in**, separate from GitHub connection.
- No code, prompt, or transcript content is ever shared.
- The primary ranking metric is efficiency-oriented, not volume-oriented.
- The UI must avoid shame framing or "worst performer" highlighting.
- Admins cannot override a user's visibility choice.
- Historical snapshots may anonymize opted-out members but must not leak identity.

## Success Criteria

- Team members can connect GitHub and opt into a team-only leaderboard.
- Leaderboard snapshots compute and rank members on composite efficiency logic.
- Team members can view a leaderboard page and member detail panel with
  aggregated context only.
- Personal dashboard can show a "My Rank" card for opted-in users.
- Access controls and privacy rules are enforced.
