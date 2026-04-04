# Implementation Plan: Open Gaps And Hardening Program

**Branch**: `006-open-gaps-and-hardening` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-open-gaps-and-hardening/spec.md`

## Summary

Phase 006 is a controlled follow-up phase. It exists because the remaining
gaps are not all the same kind of work:

- some are straightforward product delivery
- some need auth/security correctness
- some need evidence-first source validation
- some need native macOS decisions rather than more Node-only patching

The program must therefore separate what OpenCode should execute from what
Codex should own directly.

## Execution Order

### Step 1 - Screenshot Export

Execute:

- `/Users/hanyramadan/token traker/specs/006a-screenshot-export-and-capture/`

### Step 2 - Production OAuth And Session Hardening

Execute:

- `/Users/hanyramadan/token traker/specs/006b-production-oauth-and-session-hardening/`

### Step 3 - Member Detail Drawer

Execute:

- `/Users/hanyramadan/token traker/specs/006c-leaderboard-member-detail-drawer/`

### Step 4 - Meter Truthfulness

Execute:

- `/Users/hanyramadan/token traker/specs/006d-true-meters-and-quota-sources/`

### Step 5 - Provider Validation / Closure

Execute:

- `/Users/hanyramadan/token traker/specs/006e-provider-validation-and-support-closure/`

### Step 6 - Native Widget Feasibility / Shell

Execute:

- `/Users/hanyramadan/token traker/specs/006f-native-widget-feasibility-and-shell/`

## Recommended Ownership

### Best Owned By OpenCode

- `006a-screenshot-export-and-capture`
- `006c-leaderboard-member-detail-drawer`

These are bounded UI/server tasks in already-existing app surfaces.

### Best Owned By Codex

- `006b-production-oauth-and-session-hardening`
- `006d-true-meters-and-quota-sources`
- `006e-provider-validation-and-support-closure`
- `006f-native-widget-feasibility-and-shell`

These carry a higher risk of false confidence:

- auth flows and secure sessions
- source-of-truth validation for quota/provider data
- evidence-heavy provider claims
- native macOS / Swift / WidgetKit work

## Validation Gates

- Gate A: `006a` must land before export/docs are considered reconciled.
- Gate B: `006b` must pass `agent-security` review before Phase 006 auth claims
  can be updated.
- Gate C: `006c` must preserve aggregated-only privacy boundaries.
- Gate D: `006d` must not replace heuristic labels with quota language unless
  the underlying data is actually quota-backed.
- Gate E: `006e` must produce evidence for each provider decision.
- Gate F: `006f` must explicitly verify whether the current repo/toolchain can
  support a widget path cleanly.

## Architecture Guidance

- Prefer isolated, app-surface-specific changes over cross-cutting rewrites.
- Keep `apps/web` as the leaderboard/auth surface.
- Keep `apps/desktop` focused on local monitoring and export surfaces.
- Only introduce Swift/SwiftUI code under a clearly separated native location.
- Any provider-source validation must start from the existing local/core data
  model and documented machine evidence.

## Delivery Rule

OpenCode should only be given the child specs assigned to it in this plan.
Codex should own the rest directly to avoid repeated auth/speculation failures.
