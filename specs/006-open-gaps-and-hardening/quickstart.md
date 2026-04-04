# Quickstart: Open Gaps And Hardening Program

## Goal

Run the remaining-gap program in bounded slices without reopening roadmap drift
or overclaiming parity.

## Required Reading

- `/Users/hanyramadan/token traker/specs/006-open-gaps-and-hardening/spec.md`
- `/Users/hanyramadan/token traker/specs/006-open-gaps-and-hardening/plan.md`
- `/Users/hanyramadan/token traker/specs/006-open-gaps-and-hardening/tasks.md`
- `/Users/hanyramadan/token traker/PROJECT_PLAN.md`
- `/Users/hanyramadan/token traker/docs/reference-products.md`

## Validation Rule

At the end of each child spec:

- run the child-spec-specific quickstart checks
- run `agent-reviewer`
- run `agent-security` where auth/data boundaries are touched
- sync docs before declaring status

Do not call Phase 006 complete until the remaining open items are explicitly
classified as shipped, partial, deferred, or unsupported.
