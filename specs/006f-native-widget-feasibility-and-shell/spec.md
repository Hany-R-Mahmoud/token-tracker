# Feature Specification: Native Widget Feasibility And Shell

**Feature Branch**: `006f-native-widget-feasibility-and-shell`  
**Created**: 2026-04-03  
**Status**: Draft  
**Primary Execution Owner**: Codex

## Goal

Turn the current widget blocker into a concrete native plan by either building a
minimal WidgetKit shell or formally narrowing the next native step with verified
toolchain and architecture evidence.

## Scope

- macOS native/widget feasibility verification
- Swift/SwiftUI/WidgetKit project boundary decision
- data handoff model from current app surfaces to a widget
- minimal shell/prototype if feasible
- docs/setup/next-step guidance

## Requirements

- Verify the current machine/toolchain readiness for Swift/SwiftUI/WidgetKit.
- Decide where native widget code should live in the repo.
- Define the smallest data contract needed by a widget surface.
- If feasible, scaffold a minimal native/widget shell that can render bounded
  monitoring state.
- If full implementation is not feasible in this pass, produce a verified shell
  or setup path rather than repeating a generic blocker statement.

## Acceptable Completion

- minimal native widget shell/prototype exists, or
- a verified native setup package exists with the next exact implementation step

## Mandatory Agents

- `agent-orchestrator`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-debugging`
