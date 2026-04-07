# Plan: Phase 009 Revisit — Visual Analytics, Dashboard Redesign, And Brand System

## Goal

Reframe Token Tracker’s desktop and analytics experience around modern visual
analytics, clearer monitoring hierarchy, and a coherent brand system that
matches the richer product truth already implemented in the repo.

## Phase Path

1. Audit the current product surfaces and identify visual bottlenecks
2. Lock the visual/product principles from research
3. Define information architecture for Overview, Analytics, and Menubar
4. Define the brand system and chart vocabulary
5. Prepare Stitch/Gemini prompt packages and design deliverables
6. Translate the selected direction into implementation-ready slices
7. Validate design honesty, readability, and accessibility

## Workstreams

### Workstream A: Current-State Audit

- map what the Overview, Analytics, Menubar, and Team surfaces already show
- distinguish:
  - useful analytical content already present
  - visually weak presentation
  - missing comparison views
  - missing brand assets
- identify where the current layout is too table-heavy, card-heavy, or
  narrative-light

### Workstream B: Research Lock

- ground the redesign in:
  - PostHog dashboards
  - Vercel Analytics
  - Plausible
  - Grafana
  - Metabase
  - shadcn/ui chart examples
  - Tremor blocks and KPI patterns
  - USWDS and CFPB data-visualization guidance
- convert external inspiration into repo-specific principles rather than copied
  layouts

### Workstream C: Information Architecture

- define the exact top-to-bottom structure for:
  - Overview
  - Analytics
  - Menubar
- define what belongs in:
  - hero
  - KPI deck
  - comparison zone
  - operational truth zone
  - investigation zone
- ensure each screen answers “what happened”, “why it matters”, and “what next”

### Workstream D: Visual System

- define palette tokens for:
  - primary signal
  - comparison accent
  - success
  - warning
  - critical
  - unresolved / fallback
- define typography roles
- define surface, card, border, and spacing language
- define chart color usage and category limits

### Workstream E: Brand Assets

- define logo direction
- define app icon constraints
- define menubar/tray icon constraints
- define how branding appears in dashboard hero and navigation

### Workstream F: Design Generation Brief

- prepare one or more prompts for:
  - Stitch
  - Gemini
- specify required screens, variants, and output expectations
- request multiple viable design directions, not one polished guess

### Workstream G: Implementation Hand-off

- convert selected design direction into implementation slices:
  - desktop layout system
  - chart primitives
  - KPI card system
  - overview composition
  - analytics composition
  - brand assets
  - icon and tray polish

## Recommended Execution Order

1. Finish the revised spec kit
2. Generate design concepts from Stitch or Gemini
3. Review and choose a direction
4. Break implementation into file-owned slices
5. Implement Overview first
6. Implement Analytics second
7. Align Menubar and iconography
8. Validate accessibility, responsiveness, and truth-state clarity

## Risks To Name Early

- the repo contains more data layers than the current design can comfortably
  express, so the redesign can easily become cluttered
- over-designing the surface could make heuristic or fallback data look more
  certain than it is
- too many chart types would weaken implementation speed and consistency
- strong visual ambition without brand discipline will create a “cool but random”
  result
- icon/logo work can drift away from the product’s local-first, technical tone

## Design Quality Gates

- every major screen must have a clear hierarchy within five seconds
- every key metric must include context, comparison, or trend
- charts must support interpretation without hover alone
- fallback and degraded states must be visually distinct from strong-truth states
- the system must feel like one product across dashboard, analytics, and menubar
- the direction must be implementable in the current repo without a framework
  rewrite

## Success Test

If a user opens the product after this revisit, they should feel:

- this is more distinctive than a generic dashboard
- I can see what changed and what matters
- the visuals help me compare, not just read
- the app feels premium and alive
- uncertainty is still communicated honestly
