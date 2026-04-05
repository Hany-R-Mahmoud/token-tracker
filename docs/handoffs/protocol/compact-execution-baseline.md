# Compact Execution Baseline

Use this file as the shared, stable execution contract for Codex-to-OpenCode
handoffs.

## Purpose

Avoid re-sending the same execution boilerplate in every phase prompt.

Future prompts should reference this file instead of repeating all of these
rules inline.

## Baseline Rules

1. Start with `agent-orchestrator`.
2. Use the minimum specialist set required by the phase.
3. Do not stop at planning unless the prompt explicitly says documentation-only.
4. Read the phase research and spec files before implementation.
5. Keep changes aligned with existing repo structure and conventions.
6. Do not overclaim completion without validation evidence.
7. Prefer updating stable shared files over copying repeated prompt boilerplate.
8. Save the prompt and reports in the handoff archive for the phase.

## Default Specialist Set

- `agent-orchestrator`
- `agent-implementer`
- `agent-reviewer`
- `agent-tester`
- `agent-docs`

Add only when relevant:

- `agent-debugging`
- `agent-security`
- `agent-impeccable`

## Completion Expectation

Unless the prompt says otherwise, OpenCode should:

- implement the requested phase end to end
- validate what it changed
- report what passed, what failed, and what remains open

## Prompt Compaction Rule

Prompts should keep only:

- the task-specific mission
- the read-first file list
- phase-specific constraints
- phase-specific acceptance criteria

Everything else should be referenced from this file or the reporting baseline.
