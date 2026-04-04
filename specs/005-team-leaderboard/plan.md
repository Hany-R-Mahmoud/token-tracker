# Implementation Plan: Team Leaderboard Program

**Branch**: `005-team-leaderboard` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/005-team-leaderboard/spec.md`

## Summary

This program adds a team-scoped leaderboard system that is qualitatively
different from AI Token Monitor's public/global leaderboard. It introduces
identity, privacy, snapshot computation, API, and UI work. Because this changes
the product boundary from purely local to selectively shared team data, it must
be executed in a tightly controlled order.

## Execution Order

### Step 1 - Foundation

Execute:

- `/Users/hanyramadan/token traker/specs/005a-team-leaderboard-foundation/`

### Step 2 - Computation And API

Execute:

- `/Users/hanyramadan/token traker/specs/005b-team-leaderboard-computation-and-api/`

### Step 3 - UI And Settings

Execute:

- `/Users/hanyramadan/token traker/specs/005c-team-leaderboard-ui-and-settings/`

### Step 4 - Hardening And Rollout

Execute:

- `/Users/hanyramadan/token traker/specs/005d-team-leaderboard-hardening-and-rollout/`

## Validation Gates

- Gate A: 005a must pass before 005b starts.
- Gate B: 005b must pass before 005c starts.
- Gate C: 005c must pass before 005d starts.
- Gate D: Every child spec must end with `agent-tester` and `agent-reviewer`.
- Gate E: `agent-security` review is mandatory before any OAuth or team privacy
  work is considered complete.
- Gate F: `agent-docs` must reconcile docs after every child spec.

## Architecture Guidance

- This feature likely needs a web app / auth / database-backed surface distinct
  from the current local-only desktop shell.
- OpenCode must not force-fit team leaderboard behavior into the current
  localhost-only Node desktop app if that harms the architecture.
- If a new app surface is needed, OpenCode must isolate it clearly rather than
  entangling it with the local-only monitor.
- Reuse the existing analysis concepts and scoring model where appropriate.

## Key Risks

- OAuth/auth security errors
- privacy leaks in snapshots or UI
- ranking incentives encouraging waste or shame
- over-coupling team/cloud features with the local-first app
- heavy infra assumptions without clear scaffolding

## Reference Inputs

- `/Users/hanyramadan/token traker/docs/reference-products.md`
- `/Users/hanyramadan/Downloads/TTM_LEADERBOARD_SPEC.md`
- public AI Token Monitor repo: [soulduse/ai-token-monitor](https://github.com/soulduse/ai-token-monitor)

## Delivery Rule

OpenCode must report after each child spec and must not skip security or privacy
review just because the UI looks complete.
