# Quickstart: Competitive Parity Program

## Goal

Run the Phase 004 program spec by spec and keep evidence after each step.

## Required Reading

Read before implementation:

- `/Users/hanyramadan/token traker/specs/004-competitive-parity/spec.md`
- `/Users/hanyramadan/token traker/specs/004-competitive-parity/plan.md`
- `/Users/hanyramadan/token traker/specs/004-competitive-parity/tasks.md`
- `/Users/hanyramadan/token traker/docs/reference-products.md`

## Execution Rule

Do not start all work at once.

Run child specs sequentially:

1. 004a
2. 004b
3. 004c
4. 004d

## Validation Rule

At the end of each child spec:

- `npm run typecheck`
- `npm run build`
- child-spec-specific validation
- `agent-reviewer`
- docs sync
