# Feature Specification: Provider Expansion And Status Layer

**Feature Branch**: `004d-provider-expansion-and-status-layer`  
**Created**: 2026-04-03  
**Status**: Draft

## Goal

Close the remaining breadth and status-intelligence gaps by expanding provider
coverage honestly and adding a provider status / incident layer.

## Scope

- broader provider coverage
- provider status / incident layer

## Requirements

- Use the reference products and validated local research to prioritize provider
  additions.
- Do not claim support for any provider without a validated source strategy on
  this machine or clearly documented evidence path.
- Add a provider status layer that can show validated, degraded, unavailable,
  auth-needed, and incident-like states.
- Add incident/status presentation to desktop and compact monitoring surfaces.
- Prefer incremental provider expansion in validated slices, not one giant leap.

## Provider Priority Guidance

OpenCode must prioritize based on practical parity value and validation ease.
Suggested order:

1. Claude
2. Cursor
3. Gemini
4. Copilot
5. OpenRouter

OpenCode may reorder only if it produces evidence.

## Mandatory Agents

- `agent-orchestrator`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-security`
- `agent-debugging`
