# Web Admin Dashboard Landscape Research

Last updated: 2026-04-07

## Goal

Ground the upcoming Token Tracker web dashboard and admin board in current
reference products, open-source dashboard structures, and dashboard-design best
practices before writing the Replit build prompt.

This research is not meant to copy reference products. It is meant to help us
choose the right structure and avoid generic admin-dashboard mistakes.

## Current Token Tracker Context

The new web dashboard must stay in harmony with:

- the current desktop app
- the current leaderboard web surface
- the mobile companion brief in
  [docs/replit-expo-mobile-app-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-expo-mobile-app-prompt.md)

The product already has strong surface primitives:

- Overview
- Analytics
- Menubar / compact monitoring
- Leaderboard / Team
- honest fallback and degraded states
- a clear visual system and brand mark

The web admin dashboard should extend this system, not replace it.

## Research Questions

1. How do strong analytics/admin products structure overview vs drill-down?
2. What chart and panel patterns are most reusable for a rich but maintainable
   dashboard?
3. What architectural patterns show up in modern open-source dashboard repos?
4. What should Token Tracker borrow for a full web admin board?
5. What should Token Tracker explicitly avoid?

## Sources Reviewed

### Product / Documentation References

- [Grafana dashboard best practices](https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/)
- [Metabase dashboards introduction](https://www.metabase.com/docs/latest/dashboards/introduction)
- [Plausible simple analytics](https://plausible.io/simple-web-analytics)
- [Vercel Web Analytics docs](https://vercel.com/docs/analytics)
- [Vercel Speed Insights overview](https://vercel.com/docs/speed-insights/)
- [Apache Superset overview](https://superset.apache.org/)

### Open-Source / Repo References

- [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
- [NextAdminHQ/nextjs-admin-dashboard](https://github.com/NextAdminHQ/nextjs-admin-dashboard)
- [steipete/CodexBar](https://github.com/steipete/CodexBar)

### Internal Repo References

- [docs/reference-products.md](/Users/hanyramadan/token%20traker/docs/reference-products.md)
- [specs/008-visual-system-and-brand-refresh/spec.md](/Users/hanyramadan/token%20traker/specs/008-visual-system-and-brand-refresh/spec.md)
- [docs/replit-expo-mobile-app-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-expo-mobile-app-prompt.md)

## Findings

### 1. The best dashboards answer one primary question per screen

Grafana explicitly recommends that a dashboard should tell a story or answer a
question, and that the layout should progress logically from general to
specific. It also warns against adding cognitive load and against dashboard
sprawl.

Implication for Token Tracker:

- the top-level web dashboard should be an orientation layer first
- the admin board should not be mixed directly into the same reading flow as
  the primary analytics experience
- the main dashboard should answer:
  - what changed?
  - what is risky?
  - what needs inspection?

### 2. Shared filters and drill-down matter more than adding more pages

Metabase and Vercel both emphasize shared filters, configurable time ranges,
 and dashboard views that can be refined without leaving the page. Metabase
 also supports dashboard configuration through URL parameters, fullscreen, and
 refresh behavior.

Implication for Token Tracker:

- global timeframe controls should be first-class
- provider, model, team, and period filters should be shared across screens
- URL state should be preserved for filterable admin and analytics views
- the web app should support deep-linking directly into filtered states

### 3. Simplicity at the top works better than “everything everywhere”

Plausible’s strongest pattern is one-page clarity: the most important numbers
 and breakdowns are visible in one view, filterable by dimension, and readable
 without training.

Implication for Token Tracker:

- the first screen should stay decisive and readable even though the product is
  richer than Plausible
- comparison and narrative summary should be visible without forcing users into
  exploration first
- avoid burying important insights behind tabs inside tabs

### 4. Rich chart variety is useful, but only when the vocabulary stays small

Superset proves that a platform can support broad chart variety, but Grafana’s
 guidance is the more relevant constraint for us: reuse templates, variables,
 and consistent patterns rather than making every panel unique.

Implication for Token Tracker:

- keep a constrained product-wide chart vocabulary
- reuse the same visual patterns across Overview, Analytics, Team, and Admin
- choose a small set of chart primitives and semantic treatments:
  - mini bars
  - time-series trends
  - integrity / comparison lanes
  - segmented composition bars
  - heatmaps
  - scatter / value matrix
  - ranked list bars

### 5. Modern open-source dashboards converge on a modular, feature-based structure

The strongest open-source repo reference for implementation shape was
`next-shadcn-dashboard-starter`, which uses:

- Next.js 16
- TypeScript
- shadcn/ui
- a feature-based folder structure
- charts, tables, forms, and route-aware loading states
- URL-aware filter state and data-table behavior

NextAdmin shows the same broad conclusion from a different direction:

- production-ready admin layout primitives
- reusable UI system
- many surface types built from a consistent toolkit

Implication for Token Tracker:

- the web build should use a modern React/Next stack
- feature-based grouping is a better fit than a flat pages/components dump
- admin tables, settings, and control flows should use the same primitive
  system as the product dashboard

### 6. Compact monitoring should remain its own first-class pattern

CodexBar remains the best reference for ambient monitoring posture:

- minimal UI
- dynamic status signals
- reset countdowns
- compact glanceability

Implication for Token Tracker:

- the web dashboard should include compact monitoring modules that feel related
  to the desktop menubar
- the admin board should not feel like a totally separate back-office product
- small status widgets and compact summary cards should remain part of the
  design language

## Structural Recommendations For Token Tracker

### Product-Level Structure

Separate the product into two coordinated layers:

1. Core dashboard experience
2. Admin / operations board

Recommended main navigation:

- Overview
- Analytics
- Team / Leaderboard
- Sessions
- Admin
- Settings

Recommended Admin sub-navigation:

- Summary
- Teams
- Members
- Providers
- Sync / ingestion status
- Surface truth / health
- Preferences / access
- Audit / activity log

### Information Architecture Principles

- Keep Overview as the orientation surface.
- Keep Analytics as the comparison-first deep analysis surface.
- Keep Team / Leaderboard as a performance and people-oriented surface.
- Keep Sessions as an inspectable evidence list / drill-down surface.
- Keep Admin focused on management, controls, status, and governance.

### Harmony Rules Across Desktop, Mobile, And Web

- one design system
- one metric vocabulary
- one brand mark
- one state language
- one chart language
- one tone for truth, uncertainty, and degradation

The web app may be broader, but it must not feel like a different company built
it.

## Recommended Implementation Stack

Best-fit recommendation for Replit:

- Next.js 16
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui for primitives only
- Recharts for charts
- TanStack Table for admin/data tables
- React Hook Form + Zod for settings/admin forms
- URL state for filters and period selection

Why this stack:

- mature enough for dashboards and admin surfaces
- expressive enough to preserve the current visual system
- easy for Replit to scaffold
- feature-based architecture fits the problem well
- good support for SSR/CSR hybrid rendering and route-level loading states

## What To Borrow

### From Grafana

- dashboard tells a story
- general-to-specific hierarchy
- documentation and panel descriptions
- template/filter reuse
- avoid sprawl and meaningless copies

### From Metabase

- shareable filtered dashboard URLs
- embedding/export mindset
- dashboard-level filter behavior
- clean separation between dashboard and deeper exploration

### From Plausible

- one-page clarity
- important numbers visible without training
- filters that refine instead of fragment

### From Vercel

- strong top-level controls
- overview metrics as launch points into deeper screens
- clear segmentation by environment/device/time range

### From Superset

- support for robust data exploration and admin breadth
- semantic layer thinking
- scalable dataset / dashboard separation

### From next-shadcn-dashboard-starter

- feature-based folder structure
- route-aware loading/error isolation
- tables, filters, and charts from one system
- scalable app organization

### From CodexBar

- compact monitoring posture
- small, dense status cues
- reset and provider state visibility

## What To Avoid

- generic SaaS sidebar + card soup with no product personality
- mixing admin controls directly into primary analytics reading flow
- adding too many chart types without consistent semantics
- hiding degraded or uncertain data behind clean-looking cards
- hover-only comprehension
- creating a second design system for admin
- visual drift between desktop, mobile, and web

## Recommendation

Build the web dashboard as a unified Next.js product with two coordinated
surface types:

1. user-facing operator dashboard
2. admin / control board

Both should use the same tokens, same chart language, same brand mark, same
truth-state semantics, and the same source material used for the mobile prompt.

The strongest structural model is:

- Plausible-like clarity at the top
- Grafana-like storytelling and hierarchy
- Metabase/Vercel-style shared filters and drill-downs
- Superset-level admin breadth where needed
- Next.js feature-based implementation shape
- CodexBar-like compact monitoring modules

## Open Questions

These are the only meaningful scope questions that still affect the final
prompt:

1. Should the first version of the admin board include authentication and RBAC,
   or should it stay single-admin for now?
2. Should admin manage only display/configuration state, or also ingestion,
   provider health, and team/member operations?
3. Should the web dashboard include a public/shareable mode or stay private?
4. Should Settings remain a product-level page or move under Admin?
