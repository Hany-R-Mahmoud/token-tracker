# Feature Specification: Screenshot Export And Capture

**Feature Branch**: `006a-screenshot-export-and-capture`  
**Created**: 2026-04-03  
**Status**: Draft  
**Primary Execution Owner**: OpenCode

## Goal

Add a real screenshot/export path for useful analytics/dashboard surfaces so
Token Tracker is no longer limited to text-only clipboard export.

## Scope

- screenshot/export architecture choice
- dashboard/analytics export trigger UX
- image generation or capture flow
- export success/failure messaging
- documentation of what is captured

## Requirements

- Implement a real screenshot/image export flow for at least one high-value
  surface:
  - analytics summary, or
  - leaderboard summary card, or
  - overview summary card
- The exported result must be image-like output, not just text copy.
- The flow must work in the current architecture without introducing a large,
  fragile rendering stack.
- The exported image must not expose raw prompt/code/session content.
- Keep the existing clipboard text export if it still adds value.

## Acceptable Solution Shapes

- browser-side capture of a bounded card/section
- server-side SVG/PNG generation for a summary card
- desktop-native capture only if it stays bounded and coherent

## Not Acceptable

- fake screenshot claims that still only copy text
- huge dependency additions for a marginal feature
- capturing arbitrary whole-page content with privacy regressions

## Mandatory Agents

- `agent-orchestrator`
- `agent-impeccable`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
