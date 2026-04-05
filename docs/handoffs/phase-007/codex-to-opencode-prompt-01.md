# Codex to OpenCode — Phase 007 Initial Prompt

**Date:** 2026-04-05
**Phase:** 007 — Success Analysis and Representation

## Prompt

```
Work in /Users/hanyramadan/token traker.

Task: implement Phase 009 (Success Analysis) from the spec kit.

Read these files:
- specs/009-success-analysis-and-representation/spec.md
- specs/009-success-analysis-and-representation/plan.md
- specs/009-success-analysis-and-representation/tasks.md

Implement:
1. Extend session domain types with completion/verification/confidence/success-signal fields
2. Build evidence subsystem in packages/core/src/analysis/
3. Extend canonical session/domain layer
4. Wire shared analysis outputs into all surfaces
5. Validate compatibility and honesty
6. Reconcile docs and handoff artifacts

Do not:
- Add cloud telemetry
- Add external provider APIs
- Add adapter-level scoring policy
- Expose raw git diffs, raw test logs, or private local evidence
- Claim perfect success truth where evidence is only partial
```
