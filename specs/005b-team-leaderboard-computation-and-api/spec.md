# Feature Specification: Team Leaderboard Computation And API

**Feature Branch**: `005b-team-leaderboard-computation-and-api`  
**Created**: 2026-04-03  
**Status**: Draft

## Goal

Build the snapshot computation engine and API surfaces for the team leaderboard.

## Scope

- leaderboard snapshot schema
- composite ranking logic
- period handling
- snapshot recompute function/job
- leaderboard read APIs
- my-rank API
- admin recompute endpoint
- seed/demo data support

## Requirements

- Use snapshot-based computation, not live page-load aggregation
- Implement the composite efficiency score in a clear, testable way
- Enforce minimum participation thresholds
- Support periods: `today`, `week`, `month`, `all_time`
- Compute rank deltas versus prior snapshots
- Return only aggregated data; never raw session content
- Prevent cross-team access
- Seed realistic demo data for validation

## Ranking Rule

OpenCode must implement the composite scoring logic from the local spec draft
unless a strong evidence-based improvement is proposed and documented.

## Mandatory Agents

- `agent-orchestrator`
- `agent-security`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-debugging`
