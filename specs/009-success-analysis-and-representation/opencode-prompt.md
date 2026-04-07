Implement the Phase 009 revisit from these files:

- `/Users/hanyramadan/token traker/docs/research/phase-009-visual-analytics-revisit.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/spec.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/plan.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/tasks.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/quickstart.md`
- `/Users/hanyramadan/token traker/specs/008-visual-system-and-brand-refresh/spec.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/styles.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`

Execution rules:

1. Start with `agent-orchestrator`.
2. Use:
   - `agent-impeccable`
   - `agent-implementer`
   - `agent-tester`
   - `agent-reviewer`
   - `agent-docs`
   - `agent-debugging`
3. Use `agent-security` only if any new visual/interaction flow changes trust
   boundaries, sharing, auth, or external-link behavior.
4. Do not redesign from scratch in a vacuum. Build on the actual data and truth
   layers already in the repo.
5. Do not ship generic SaaS cards or a purple-on-dark AI dashboard.
6. Preserve honest fallback, degraded, heuristic, and unknown states visually.
7. Keep implementation realistic for the current stack. No framework rewrite.

Implementation goals:

- redesign Overview into a monitoring-first decision cockpit
- redesign Analytics into a comparison-first and trend-rich analysis surface
- align Menubar visual language with the desktop product
- introduce a coherent palette, typography direction, and state system
- define and integrate a logo/app-icon/tray-icon direction
- improve KPI cards so numbers include trend or comparison context
- add richer, modern visualizations where they help understanding
- preserve accessibility, responsiveness, and honesty

Required output:

1. Files changed
2. Summary of the chosen visual direction
3. Validation commands and results
4. Screens or sections redesigned
5. Remaining limitations

If design generation is needed first:

- produce the exact Stitch or Gemini prompt before implementation starts
- ask for at least 2 materially different directions
- prefer one bold direction and one cleaner editorial direction

Exact execution command:

```zsh
cd "/Users/hanyramadan/token traker"
opencode run "$(cat specs/009-success-analysis-and-representation/opencode-prompt.md)"
```
