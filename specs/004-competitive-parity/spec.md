# Feature Specification: Competitive Parity Program

**Feature Branch**: `004-competitive-parity`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "Create Phase 004 specs that close the remaining gaps versus AI Token Monitor and CodexBar, including repair work from Phase 003."

## Product Goal

Bring Token Tracker to the same competitive edge class as AI Token Monitor and
CodexBar across the gaps we have explicitly identified, while preserving the
local-first shared-core architecture.

This phase is not a single implementation slice. It is a coordinated program of
sequential specs that OpenCode must execute in order.

## Mandatory Coverage

Phase 004 must cover all of the following, with no omissions:

- repair and reconcile the Phase 003 drift/issues before further expansion
- real-time file watching and refresh behavior
- 7/30-day controls and richer time-window navigation
- heatmap / activity graph
- cache-efficiency visualization
- themes and dark mode
- screenshot / clipboard export
- leaderboard / social surface
- first-class reset countdown UX
- session and weekly meters
- live polling / refresh cadence controls
- merge-icons mode or equivalent richer compact status modes
- widget surface
- broader provider coverage
- provider status / incident layer

## Strategic Position

Token Tracker already has strong local analysis, comparison artifacts, and CLI
depth. Phase 004 closes the remaining visible product gaps that keep it behind
AI Token Monitor and CodexBar as a monitoring product.

## Program Structure

OpenCode must execute these specs in order:

1. `/Users/hanyramadan/token traker/specs/004a-phase-003-repair-and-live-monitoring/`
2. `/Users/hanyramadan/token traker/specs/004b-analytics-sharing-and-theme-parity/`
3. `/Users/hanyramadan/token traker/specs/004c-ambient-surfaces-and-platform-parity/`
4. `/Users/hanyramadan/token traker/specs/004d-provider-expansion-and-status-layer/`

No later spec may begin before the earlier spec has passed its validation gates.

## Mandatory Agent Workflow

OpenCode must use the team deliberately. Do not let it choose a lighter process.

### Global Required Agents

1. `agent-orchestrator`
2. `agent-impeccable`
3. `agent-implementer`
4. `agent-tester`
5. `agent-reviewer`
6. `agent-docs`

### Conditional Required Agents

- `agent-debugging`: mandatory if watcher, polling, widget, or provider auth
  behavior is unstable
- `agent-security`: mandatory for browser-cookie, OAuth, API token, Keychain, or
  leaderboard/social implementation review

## Program Guardrails

- Preserve the current shared core as the source of truth.
- Do not replace the current server-rendered desktop shell with a new app stack.
- Do not fabricate Cursor or Claude support; new provider claims require real
  validation.
- Do not let docs drift from actual shipped behavior.
- Keep slices small and validated.
- Use opt-in behavior for anything that touches provider APIs, browser cookies,
  auth, or cloud-backed surfaces.

## Success Criteria

- The product has real-time or near-real-time monitoring behavior for supported
  sources.
- The product supports richer analytics, time navigation, and cache-oriented
  insights.
- The menu bar and auxiliary surfaces are strong enough to compete on ambient
  monitoring quality.
- The product expands provider coverage honestly, with a visible provider-status
  layer.
- The Phase 003 drift is repaired instead of buried.
