# Feature Specification: True Meters And Quota Sources

**Feature Branch**: `006d-true-meters-and-quota-sources`  
**Created**: 2026-04-03  
**Status**: Draft  
**Primary Execution Owner**: Codex

## Goal

Upgrade the current meter story so Token Tracker no longer risks implying
quota-truth where only heuristic session-volume signals exist.

## Scope

- audit of current menubar/session/weekly meters
- provider-by-provider data-source truth table
- quota-aware meter design where validated
- fallback semantics where quota truth is unavailable
- docs/parity language reconciliation

## Requirements

- Produce an explicit meter-truth matrix for each supported provider.
- Distinguish clearly between:
  - true quota-backed meters
  - reset-window progress only
  - heuristic volume meters
- Implement real quota/session meters only where validated source data exists.
- Redesign fallback labeling/UX where quota truth does not exist so users
  cannot misread heuristic meters as quota meters.
- Keep all docs honest about the resulting meter semantics.

## Acceptable Completion

- either real quota-aware meters for at least one provider, or
- a cleaner, safer fallback design that removes any misleading parity claim

## Mandatory Agents

- `agent-orchestrator`
- `agent-security`
- `agent-implementer`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`
- `agent-debugging`
