# Replit Web Admin Evaluation Checklist

Last updated: 2026-04-07

## Purpose

Use this checklist to evaluate whether Replit's generated Token Tracker web
dashboard and admin board actually matches the current product and the intended
cross-surface system.

This is not a generic QA checklist.
It is specifically for catching drift away from Token Tracker.

Related files:

- [docs/replit-web-admin-dashboard-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-web-admin-dashboard-prompt.md)
- [docs/research/web-admin-dashboard-landscape-2026-04-07.md](/Users/hanyramadan/token%20traker/docs/research/web-admin-dashboard-landscape-2026-04-07.md)
- [docs/replit-expo-mobile-app-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-expo-mobile-app-prompt.md)

## Pass / Fail Rule

The result passes only if it feels like Token Tracker expanded onto the web.

It fails if it feels like:

- a generic admin template
- a separate product
- a fintech dashboard
- a clone of Grafana, PostHog, or Vercel
- a shadcn demo with Token Tracker colors pasted on top

## 1. Brand Fidelity

### Must pass

- Uses the current Token Tracker refracted-token / diamond mark language.
- Preserves the premium technical tone of the existing product.
- Preserves the same mint-on-ink visual signature.
- Preserves the same compact uppercase label language.
- Preserves the same “decision cockpit” / operator posture.

### Fail if

- Uses a different logo concept.
- Feels like a generic SaaS brand.
- Uses purple/cyan AI cliché styling.
- Replaces the mark with a coin, shield, robot, or abstract blob.

## 2. Cross-Surface Harmony

### Must pass

- The web app clearly belongs to the same family as desktop and mobile.
- Overview, Analytics, Team, Sessions, Admin, and Settings share one design
  system.
- Admin uses the same tokens, chart language, and state language as the rest
  of the product.
- Compact monitoring cues feel clearly related to the menubar surface.

### Fail if

- Admin looks like a different product.
- Settings looks like a separate template.
- Team/Leaderboard uses a different visual language than Analytics.

## 3. Information Architecture

### Must pass

- Top-level navigation includes:
  - Overview
  - Analytics
  - Team / Leaderboard
  - Sessions
  - Admin
  - Settings
- Overview is clearly the orientation surface.
- Analytics is clearly the comparison/deep-analysis surface.
- Sessions is clearly the inspection/evidence surface.
- Admin is clearly the control/governance surface.
- Settings is top-level and visually aligned.

### Fail if

- Admin controls are mixed into Overview in a messy way.
- Pages feel redundant or structurally confused.
- The app relies on nested tabs and hidden panes instead of clear page roles.

## 4. Overview Fidelity

### Must pass

- Contains an operational hero band.
- Contains a KPI deck.
- Contains trend activity.
- Contains provider integrity.
- Contains cadence / topology style analysis.
- Contains an investigation log or equivalent recent-session inspection area.
- Contains active surface truth.
- Contains context health.
- Contains provider summary and recent-session views.
- Preserves the same reading order and analytical role as the current product.

### Fail if

- Overview is reduced to KPI cards plus one chart.
- Investigation/log thinking disappears.
- Truth-state and context-health surfaces are missing.
- The page becomes a generic executive dashboard.

## 5. Analytics Fidelity

### Must pass

- Contains a distinct analytics hero.
- Contains trend panels.
- Contains value density mapping.
- Contains provider efficiency matrix.
- Contains cadence and volatility views.
- Contains outcome composition.
- Contains model pressure.
- Contains distribution views.
- Contains heatmap-style activity.
- Contains success analysis.
- Contains context pressure.
- Contains active surface truth.
- Contains model breakdown and daily activity tables or equivalent inspectable views.

### Fail if

- Analytics collapses into only line charts and bar charts.
- Comparison-first reading is lost.
- Heatmap / composition / matrix concepts disappear.
- Hover is required to understand major charts.

## 6. Team / Leaderboard Fidelity

### Must pass

- Strong rank hierarchy.
- Strong identity presentation.
- Same honest unavailable/disconnected states as the rest of the product.
- Member detail drilldown exists.
- Surface still feels analytical, not social-first.

### Fail if

- Team feels like a social feed.
- Rank is visually weak.
- Member detail is shallow or missing.

## 7. Sessions Fidelity

### Must pass

- Searchable and filterable session exploration exists.
- Sortable list/table exists.
- Session outcome/status cues are preserved.
- Session detail drilldown exists.
- Success-analysis detail exists.
- Context-related detail exists.
- Evidence/explanation factor treatment exists.

### Fail if

- Sessions is just a basic CRUD table.
- Detail drilldown is missing.
- The evidence-oriented feel is lost.

## 8. Admin Board Quality

### Must pass

- Admin feels like Token Tracker, not a template portal.
- Includes a useful control/governance summary.
- Includes visibility for teams, members, providers, sync/ingestion, and health.
- Includes audit / activity visibility.
- Keeps management actions optional if needed, but preserves the structure.
- Supports future growth without looking unfinished.

### Fail if

- Admin is purely placeholder CRUD.
- Admin has no product-specific monitoring or truth-state context.
- Admin uses a different component system from the rest of the app.

## 9. Settings Quality

### Must pass

- Top-level route exists.
- Matches the rest of the product visually.
- Contains meaningful product settings, not dummy toggles.
- Includes auth/account-related affordances where appropriate.

### Fail if

- Settings looks like a stock component demo.
- Settings is visually disconnected from the rest of the app.

## 10. Auth Readiness

### Must pass

- Authentication exists in structure and route protection.
- Single-admin v1 is acceptable.
- Future RBAC extension path is clear in architecture.
- Permission boundaries are visible in code organization.

### Fail if

- Auth is completely absent.
- Auth exists only as fake UI with no structure.
- RBAC extensibility would require major rewrites.

## 11. Shareability

### Must pass

- Filter state is encoded in the URL.
- Filtered dashboard views can be shared.
- Timeframe and core dimensions can survive reloads and links.

### Fail if

- Filter state is only local in component state.
- Sharing a view loses the dashboard state.

## 12. Chart Vocabulary Consistency

### Must pass

- Reuses a constrained product-wide chart vocabulary.
- Uses mini bars, trend views, comparison lanes, composition bars, heatmaps,
  ranked list bars, and matrix-style comparisons where appropriate.
- Charts share common spacing, legend treatment, and state styling.

### Fail if

- Every page invents different chart styling.
- Charts look like a random library gallery.
- Admin uses default charts while product pages use a custom visual language.

## 13. State Honesty

### Must pass

- Loading is clearly distinct.
- Empty is clearly distinct.
- Error is clearly distinct.
- Disconnected is clearly distinct.
- Fallback is clearly distinct.
- Degraded is clearly distinct.
- Unknown is clearly distinct.
- Unresolved is clearly distinct.
- Mixed is clearly distinct.

### Fail if

- These states are collapsed into one generic placeholder.
- Uncertainty is hidden for aesthetic cleanliness.
- Fallback and degraded data are visually indistinguishable from healthy data.

## 14. Accessibility And Usability

### Must pass

- Keyboard navigation works.
- Focus states are visible.
- Contrast is sufficient.
- Charts do not rely only on hover.
- Page structure is readable and semantic.
- Responsive behavior works at laptop and tablet widths.

### Fail if

- Meaning relies only on color.
- Focus states are missing.
- Major chart meaning is inaccessible without pointer hover.

## 15. Codebase Quality

### Must pass

- Feature-based architecture is clear.
- Shared primitives are reused.
- Theme/token layer exists.
- Data access layer exists.
- Mock data is separated cleanly.
- Route-level loading and error handling exists.
- No obvious dead code or placeholder demo content remains.

### Fail if

- The project is one large pile of pages and components.
- Mock data is embedded in UI components.
- The design system is not centralized.
- The result still looks like a scaffold.

## 16. Final Judgment Questions

Ask these before accepting the output:

1. If the logo were hidden, would this still feel like Token Tracker?
2. Does Admin feel like the same product, or like a pasted template?
3. Do Overview and Analytics preserve the desktop app’s analytical intent?
4. Does the site treat uncertainty honestly?
5. Could this sit next to the desktop and mobile versions without feeling odd?

If any answer is “no,” the result needs another pass.

## Scoring Grid

Score each area from 1 to 5:

- Brand fidelity
- Cross-surface harmony
- Overview fidelity
- Analytics fidelity
- Team fidelity
- Sessions fidelity
- Admin quality
- Settings quality
- Auth readiness
- Shareability
- Chart consistency
- State honesty
- Accessibility
- Code quality

Suggested acceptance bar:

- no category below 3
- average score at least 4
- brand fidelity, cross-surface harmony, and state honesty must all be 4 or 5
