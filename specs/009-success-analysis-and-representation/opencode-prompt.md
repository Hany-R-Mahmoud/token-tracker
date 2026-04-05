Implement Phase 009 from these files:

- `/Users/hanyramadan/token traker/docs/research/phase-009-success-analysis-research.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/spec.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/plan.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/tasks.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/quickstart.md`

Execution rules:

1. Start with `agent-orchestrator`.
2. Use:
   - `agent-implementer`
   - `agent-tester`
   - `agent-reviewer`
   - `agent-docs`
   - `agent-debugging`
3. Use `agent-security` only if local evidence collection or shared-surface
   representation raises sensitive data-boundary concerns.
4. Implement the shared analysis model first, then wire all surfaces.
5. Keep adapters boring; keep scoring policy centralized in shared analysis code.
6. Keep missing evidence honest and visible. Missing verification must not imply
   failure.
7. Do not expose raw git diff content, raw verification logs, or other private
   local evidence in shared surfaces.

Implementation goals:

- extend the canonical session model with:
  - `completionState`
  - `verificationState`
  - `successScore`
  - `executionQualityScore`
  - `reworkScore`
  - `valueDensityScore`
  - `analysisConfidence`
  - `successSignals`
- add a typed success-signal model
- create a shared evidence subsystem that derives signals from:
  - provider-native completion metadata
  - optional local repo / git evidence
  - optional verification-command evidence
  - retries, loops, errors, contradiction indicators
- preserve backward compatibility for:
  - `efficiencyScore`
  - `wasteScore`
  - `outcome`
  - `outcomeConfidence`
- update all surfaces in one phase:
  - CLI
  - desktop overview
  - analytics
  - menubar
  - leaderboard

Validation requirements:

- add unit tests for score composition
- add tests for evidence collection levels and contradiction handling
- verify old routes still render without crashes
- verify no shared surface leaks private local evidence
- verify docs stay honest about probable vs verified outcomes

Final report must include:

1. Summary of implemented analysis-model changes
2. Files changed
3. Validation commands and results
4. Quickstart checklist with PASS / FAIL / PARTIAL
5. Remaining limitations with evidence only

Exact execution command:

```zsh
cd "/Users/hanyramadan/token traker"
opencode run "$(cat specs/009-success-analysis-and-representation/opencode-prompt.md)"
```
