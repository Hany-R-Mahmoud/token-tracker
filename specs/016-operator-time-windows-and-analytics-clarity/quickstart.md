# Quickstart: Operator Time Windows And Analytics Clarity

## Validation Commands

- `npm run build`
- `npm run typecheck`
- targeted tests added for period-query behavior, if introduced
- any targeted desktop/Tauri validation command added for tray or notification behavior

## Acceptance Checklist

| Requirement | Status |
|---|---|
| Overview, analytics, export, and menubar/tray use one canonical period contract | `PASS` |
| `1hr`, `1 day`, `7 days`, `1 month`, and `all` are real working controls | `PASS` |
| Overview actually changes with the selected period | `PASS` |
| Analytics actually changes with the selected period | `PASS` |
| Export respects the selected period contract | `PASS` |
| Tray title defaults to a scoped spend metric instead of an unlabeled lifetime total | `PASS` |
| Menubar hero labels spend scope explicitly | `PASS` |
| All-time total remains available only when labeled as all-time | `PASS` |
| Context threshold state is visible in-app even when native OS notification is not shown | `PASS` |
| Latest notification delivery mode or suppression reason is inspectable | `PASS` |
| Synthetic observability labels are removed or replaced with truthful analytics labels | `PASS` |
| Key charts include explanatory copy and do not rely on hover alone for main meaning | `PASS` |
| Efficiency and consumption comparisons are more informative than the previous decorative versions | `PASS` |
| Prompt/report artifacts are archived under the Phase 016 handoff folder | `PASS` |

## Manual Checks

1. Switch through all five periods and verify both URL/state and visible numbers
   change as expected.
2. Confirm the tray and menubar make it obvious whether the shown spend is
   `today`, selected-period, or all-time.
3. Trigger or simulate a context threshold condition and verify the app exposes
   delivery outcome or suppression reason somewhere visible.
4. Open overview and analytics and confirm each major chart explains what is
   being compared and what the user should notice.
5. Confirm keyboard users can reach period controls and any interactive chart
   details.
