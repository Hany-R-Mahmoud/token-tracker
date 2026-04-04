# Feature Specification: Open Gaps And Hardening Program

**Feature Branch**: `006-open-gaps-and-hardening`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: Remaining gaps after Phases 004 and 005, reconciled against the current repo state and `docs/reference-products.md`.

## Product Goal

Close the remaining high-value gaps that still separate Token Tracker from the
best parts of AI Token Monitor and CodexBar, while keeping the product honest
about what must remain local-first, evidence-based, and platform-specific.

This phase is not a free-form polish pass. It is a bounded closeout program for
the unresolved items we already know about:

- screenshot export
- production GitHub OAuth/session hardening
- leaderboard member detail drawer
- true quota/session meters
- provider validation / support closure
- native widget feasibility

## Program Structure

Phase 006 must execute as child specs in this order:

1. `/Users/hanyramadan/token traker/specs/006a-screenshot-export-and-capture/`
2. `/Users/hanyramadan/token traker/specs/006b-production-oauth-and-session-hardening/`
3. `/Users/hanyramadan/token traker/specs/006c-leaderboard-member-detail-drawer/`
4. `/Users/hanyramadan/token traker/specs/006d-true-meters-and-quota-sources/`
5. `/Users/hanyramadan/token traker/specs/006e-provider-validation-and-support-closure/`
6. `/Users/hanyramadan/token traker/specs/006f-native-widget-feasibility-and-shell/`

No child spec may be called complete unless its own quickstart checks pass.

## Mandatory Coverage

Phase 006 must cover all of the following:

- export UX that moves beyond text-only copy
- real production OAuth exchange instead of placeholder callback behavior
- richer leaderboard member context without exposing raw session content
- meter semantics that are more truthful than the current heuristic-only story
- evidence-based provider strategy decisions without overclaiming support
- clear decision and scaffolding for a native widget path

## Delivery Intent

This program is intentionally split by execution risk:

- OpenCode should handle bounded product/UI/server tasks where the repo already
  contains the needed architecture.
- Codex should handle auth, evidence-heavy source validation, and native-path
  planning or implementation where incorrect guesses would be costly.

## Product Guardrails

- Do not weaken the local-first core to chase parity theatrically.
- Do not claim provider support without validated source evidence on this
  machine or a clearly documented, testable evidence path.
- Do not expose raw prompts, transcripts, code, or file paths in exported or
  leaderboard surfaces.
- Do not collapse desktop, web, and native-widget concerns into one app surface
  if separation is cleaner.
- Do not mark a task complete just because a fallback exists; name partials
  honestly.

## Mandatory Agent Workflow

Every OpenCode-owned child spec must use:

1. `agent-orchestrator`
2. `agent-implementer`
3. `agent-tester`
4. `agent-reviewer`
5. `agent-docs`

Use these as required by the child spec:

- `agent-security` for auth, sessions, cookies, or exported data
- `agent-debugging` for browser/runtime or native-wrapper issues
- `agent-impeccable` for UI-heavy flows

## Success Criteria

- Screenshot/export UX is meaningfully improved or intentionally closed with an
  honest architecture choice.
- Leaderboard auth is real in production mode rather than placeholder-only.
- Leaderboard member detail context exists without privacy regressions.
- Meter semantics are either upgraded to real quota-aware behavior or explicitly
  redesigned so they cannot be misread as quota truth.
- Provider expansion is either advanced with validated evidence or formally
  narrowed/closed with defensible documentation.
- Widget work results in either a real native shell or a documented, verified
  feasibility decision with the next concrete implementation step.
