# Replit Prompt: Token Tracker Web Dashboard And Admin Board

Last updated: 2026-04-07

## Purpose

This prompt is for Replit to generate a full web dashboard and admin board for
Token Tracker that stays visually and structurally aligned with the current
desktop app and the planned mobile companion.

This should be one product family.

The web app must not look like a separate design system, a generic admin
template, or a clone of a reference product.

## Inputs Replit Should Treat As Source Of Truth

Use these repo materials as fidelity references:

- [docs/replit-expo-mobile-app-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-expo-mobile-app-prompt.md)
- [docs/research/web-admin-dashboard-landscape-2026-04-07.md](/Users/hanyramadan/token%20traker/docs/research/web-admin-dashboard-landscape-2026-04-07.md)
- [apps/desktop/src/index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts)
- [apps/desktop/src/menubar.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/menubar.ts)
- [apps/desktop/src/styles.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/styles.ts)
- [apps/desktop/src/brand.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/brand.ts)
- [apps/web/src/index.ts](/Users/hanyramadan/token%20traker/apps/web/src/index.ts)
- [apps/desktop-tauri/src-tauri/icons/refracted-token.svg](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/icons/refracted-token.svg)
- [apps/desktop-tauri/src-tauri/icons/icon.png](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/icons/icon.png)

## Prompt

```md
Build a full web dashboard and admin board website for Token Tracker.

This is not a redesign from scratch.
This is not a generic admin template.
This must feel like the same product family as the current Token Tracker
desktop app and the planned mobile app.

Core goal:
- create a production-ready web dashboard and admin board
- preserve the same product identity, visual language, state language,
  information architecture, and chart vocabulary as Token Tracker
- make the web app feel fully harmonious with the desktop and mobile surfaces
- use the same product resources, brand cues, and component concepts already
  established in Token Tracker

Product posture:
- local-first product roots
- operator-focused analytics
- honest truth-state signaling
- dense but readable analytical UI
- premium, technical, modern, high-signal presentation

Important constraint:
- preserve the current Token Tracker surfaces as the core product language
- extend them for web, do not replace them
- the web admin board must still look like Token Tracker, not like a separate
  back-office system

Primary web navigation:
1. Overview
2. Analytics
3. Team / Leaderboard
4. Sessions
5. Admin
6. Settings

High-level product requirements:
- same brand identity as current Token Tracker
- same refracted-token / diamond mark language
- same palette and typography direction
- same semantic state system
- same compact monitoring cues and menubar-inspired status language
- same chart storytelling style
- same honesty around fallback, unknown, degraded, unresolved, and mixed data

Stack requirements:
- use Next.js 16 with App Router
- use TypeScript
- use Tailwind CSS
- use shadcn/ui only as a primitive/component foundation, not as the visual identity
- use Recharts for charts
- use TanStack Table for admin and data tables
- use React Hook Form + Zod for forms and validation
- use URL state for shared filters and time-range state
- keep the code modular and feature-based
- no any types

Architecture requirements:
- organize by features, not by one giant components folder
- recommended structure:
  - app/
  - src/features/overview/
  - src/features/analytics/
  - src/features/team/
  - src/features/sessions/
  - src/features/admin/
  - src/features/settings/
  - src/components/ui/
  - src/components/shared/
  - src/theme/
  - src/data/mock/
  - src/lib/
  - src/types/
- create a dedicated theme/token layer
- create a dedicated data access layer so mock data can be replaced later
- do not hard-code mock data inside UI components

Data requirements:
- use hard-coded mock data for now
- mock data must mirror the real Token Tracker data model and semantics
- preserve:
  - provider summaries
  - model summaries
  - session lists
  - session detail data
  - leaderboard/team data
  - active-surface truth data
  - context-health data
  - success-analysis data
  - daily activity / trend buckets
  - degraded, fallback, unknown, unresolved states
- prepare the app so a backend API can replace mock data later without major rewrites

Visual system to preserve:
- background primary: #0b1326
- background secondary: #171f33
- background tertiary: #131b2e
- panel strong: #222a3d
- nav background: #060e20
- text primary: #dae2fd
- text secondary: #bac9cc
- text muted: #849396
- border: #2d3449
- border strong: #3b494c
- accent: #a3ffd9
- accent hover: #36ffc4
- accent soft: rgba(163, 255, 217, 0.12)
- success: #36ffc4
- success bg: rgba(54, 255, 196, 0.12)
- warning: #b9c8de
- warning bg: rgba(185, 200, 222, 0.12)
- critical: #b01522
- critical bg: rgba(176, 21, 34, 0.16)
- critical text: #ffc1bd

Typography direction to preserve:
- premium technical display style for large headings and brand moments
- compact uppercase labels
- readable dense body typography
- mono treatment for dense metrics, tables, and token-related values
- preserve the current Token Tracker tone instead of falling back to default dashboard typography

Brand direction to preserve:
- use the current Token Tracker mark as the visual anchor
- preserve the refracted diamond / signal-cut geometry
- keep the product feeling technical, compact, premium, and analytical
- do not introduce mascots, fintech coin language, or generic enterprise shield branding
- avoid purple/cyan AI dashboard clichés

Cross-surface harmony rule:
- desktop, mobile, and web must feel like one product family
- if a component exists in desktop/mobile form, the web version should be a
  faithful extension of the same concept
- admin surfaces must use the same tokens, same spacing language, same state styling, and same chart vocabulary

Overview page requirements:
- preserve the current orientation and triage role of Overview
- keep it as the first-read dashboard
- include:
  - header and subtitle
  - operational hero band
  - KPI deck
  - trend activity
  - provider integrity
  - cluster topology or equivalent cadence surface
  - investigation log
  - active surface truth panel
  - context health panel
  - filter state and shared controls
  - provider summary table/list
  - recent sessions list/table
- keep the same section order and analytical intent as much as possible
- do not flatten it into generic KPI cards only

Analytics page requirements:
- preserve the graph-rich analytical nature of the current app
- keep comparison-first reading
- include:
  - analytics hero
  - trend activity panels
  - value density mapping
  - provider efficiency matrix
  - activity cadence
  - asset volatility
  - outcome composition
  - model pressure
  - distribution views
  - activity heatmap
  - success analysis
  - context pressure
  - active surface truth
  - model breakdown table
  - daily activity table
- preserve the distinction between trend, comparison, composition, pressure,
  truth, and distribution

Team / Leaderboard requirements:
- preserve the current leaderboard/team surface language
- strong rank hierarchy
- same identity treatment
- same honest disconnected and unavailable states
- support member detail drilldown
- keep the experience visually aligned with Overview and Analytics

Sessions page requirements:
- create a dedicated web page for session exploration and drilldown
- preserve the investigation and evidence character of session data
- include:
  - shared filters
  - searchable session table
  - sortable key fields
  - session status / outcome indicators
  - session detail view or drawer
  - success-analysis breakdown
  - context-health details
  - explanation factors and evidence-oriented details
- this page should feel like a natural extension of the current desktop session inspection flow

Admin page requirements:
- create a real admin board, but keep it inside the same product system
- recommended admin sections:
  - Admin Summary
  - Teams
  - Members
  - Providers
  - Sync / Ingestion Status
  - Surface Truth / Health
  - Preferences / Access
  - Audit / Activity Log
- admin should focus on management, visibility, and system controls
- keep the same visual language as the product dashboard
- do not style admin as a generic CRUD portal

Settings page requirements:
- align visually with the rest of the product
- include theme, display preferences, periods, and dashboard behavior controls
- if role/access settings are present, keep them stylistically consistent with the product

Shared filter requirements:
- global or coordinated filters for:
  - timeframe
  - provider
  - model
  - team
  - status / truth state where useful
- preserve filter state in the URL
- make filtered views linkable and shareable

Chart vocabulary requirements:
- use a constrained reusable chart language across the whole app:
  - mini bars
  - line / layered area trends
  - provider integrity lane bars
  - segmented composition bars
  - heatmaps
  - ranked list bars
  - bubble / matrix comparison views
  - compact sparkline treatments
- do not create a different visual language for every page
- labels and summaries should not depend on hover alone

State honesty requirements:
- explicitly implement and visually distinguish:
  - loading
  - empty
  - error
  - disconnected
  - fallback
  - degraded
  - unknown
  - unresolved
  - mixed
- these states must remain honest and visible
- do not smooth over uncertainty with pretty cards

Accessibility and usability requirements:
- keyboard accessible navigation
- semantic HTML
- visible focus states
- sufficient contrast
- chart comprehension without hover dependency
- responsive behavior for desktop, tablet, and laptop widths
- use mobile-friendly collapse patterns where needed but keep the same product meaning

Implementation quality requirements:
- route-level loading and error handling
- reusable chart and panel primitives
- shallow, predictable component trees
- no dead code
- no inline mock data inside screens
- no placeholder lorem ipsum admin copy
- realistic mock values

Design quality guardrails:
- avoid generic SaaS dashboard card soup
- avoid copying PostHog, Grafana, Metabase, Vercel, Plausible, AI Token Monitor, or CodexBar directly
- use them only as structural inspiration
- keep Token Tracker’s own visual identity first

Output expectations:
- generate the full web app
- explain the file structure
- clearly mark:
  - where theme tokens live
  - where brand assets live
  - where charts are implemented
  - where shared filters are managed
  - where mock data lives
  - where backend integration should be added later
- if a design or structural decision is unclear, prefer fidelity to Token Tracker over invention

Final instruction:
This website must feel like the natural web home of Token Tracker.
It should look like the desktop app grew into a full web dashboard and admin
board, while staying in complete harmony with the mobile app and current
product surfaces.
```

## Assumptions In This Prompt

- first version uses mock data
- admin board exists in the same app, not as a separate product
- authentication is required at the architecture level
- first version may ship as single-admin, but auth structure and implementation
  paths must already exist
- RBAC should be scaffolded in the architecture even if only one admin role is
  active in v1
- team/member/provider management is optional in v1 and can begin as read-only
  or partially interactive depending on implementation pace
- shareable filtered dashboard URLs are required
- `Settings` stays as a top-level navigation item
- the main priority is product harmony, not template speed

## Scope Decisions Locked In

1. Authentication is required.
2. v1 can run as single-admin, but auth structure and future RBAC paths must be
   implemented cleanly.
3. Admin management features are optional in v1.
4. Shareable filtered dashboard links are required.
5. `Settings` is a top-level navigation item.
