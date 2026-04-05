# Compact Reporting Baseline

Use this file as the shared, stable reporting contract for OpenCode-to-Codex
handoffs.

## Purpose

Avoid repeating long reporting templates in every phase prompt while keeping the
handoff quality high and comparable.

## Required Report Shape

1. Summary
2. What was completed now
3. Files changed
4. Validation commands and results
5. Acceptance / quickstart status
6. Remaining limitations or blockers
7. Explicit completion statement

## Reporting Rules

- Distinguish clearly between:
  - what was already complete before this pass
  - what was completed in this pass
- Do not claim a requirement is PASS without evidence.
- If a requirement is PARTIAL, say exactly which part is still missing.
- If a command only passes in a built/dist path, report that exact command.
- Do not hide known runtime risks behind successful typecheck/build output.
- When docs or quickstart files were updated, say which claims changed.

## Evidence Rules

- Prefer exact commands and exact results.
- If validation depends on a real route or runtime path, say how it was tested.
- If a limitation is accepted rather than fixed, name it explicitly.

## Completion Statement

End every report with one of these:

- `Phase XXX is fully complete.`
- `Phase XXX remains partial because ...`

Do not invent a stronger closing statement than the evidence supports.
