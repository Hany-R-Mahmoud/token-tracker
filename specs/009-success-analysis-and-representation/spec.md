# Feature Specification: Phase 009 Revisit — Visual Analytics, Dashboard Redesign, And Brand System

**Feature Branch**: `009-success-analysis-and-representation`
**Created**: 2026-04-05
**Revised**: 2026-04-07
**Status**: Planning Refresh
**Primary Execution Owners**: `agent-orchestrator` for planning, `agent-researcher` for source-backed direction, `agent-impeccable` for design translation, Stitch/Gemini for concept generation, OpenCode for implementation
**Input**:
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/`
- `/Users/hanyramadan/token traker/specs/008-visual-system-and-brand-refresh/`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/styles.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/apps/web/src/index.ts`
- `/Users/hanyramadan/token traker/docs/reference-products.md`
- public references gathered during the Phase 009 revisit research pass

## Why This Revisit Exists

Phase 009 originally became a narrow success-analysis representation phase.
That work added more metrics and more truth layers, but it did **not**
successfully transform the product visually.

Since then the repo has added even more capability:

- success analysis
- context audit
- active-surface truth
- desktop notification policy
- richer menubar behavior
- leaderboard and team surfaces

The product now contains **more data, more decisions, and more comparative
questions** than the current dashboard design can express well.

Today the product is informative, but still too plain:

- too many surfaces are stat cards, simple bars, and tables
- the overview does not tell a clear “what matters right now?” story
- analytics is data-rich but visually low-energy
- the visual system still feels utilitarian instead of ownable
- branding, iconography, and palette are not yet coherent

This revisit turns Phase 009 into the bridge between:

1. the analytical truth already implemented in the repo
2. the overdue visual-system and dashboard redesign work that was planned but
   never fully executed

## Research-Grounded Product Thesis

Across strong public references, the best dashboards are not just “pretty”.
They consistently do the following:

- gather the most important metrics into a single high-signal view
- use shared filters and time controls across the whole screen
- combine KPI cards with trend context, not standalone numbers
- make comparison easy across time, provider, segment, or cohort
- balance overview and exploration in one system
- use a limited, legible chart vocabulary rather than many novel chart types
- annotate the data with summaries, changes, and explanations
- preserve accessibility through simple chart choices, contrast, and text
  equivalents

The strongest references from this research pass:

- PostHog dashboards:
  - templates, shared filters, auto-refresh, mixed insight cards, text cards,
    and layout editing
- Vercel Analytics:
  - strong global controls for timeframe, environment, and dimension filters
- Plausible:
  - “one page, all the important numbers at a glance” discipline
- Grafana:
  - broader chart vocabulary and monitoring posture
- Metabase:
  - “everything in one place” framing and easy exploration
- shadcn/ui charts:
  - pragmatic modern chart patterns with good visual defaults
- Tremor:
  - KPI cards, micro-visualizations, comparison cards, data-rich blocks
- USWDS and CFPB design guidance:
  - keep charts simple, state the message, provide supporting text, ensure
    contrast, and do not rely on hover-only meaning

## Goal

Make Token Tracker feel like a **modern AI usage decision cockpit**:

- energetic
- comparative
- visual-first
- technically credible
- locally grounded

The redesign must help users answer:

1. What changed today, this week, and this month?
2. Which providers, models, and workflows are worth the spend?
3. Where is waste, rework, or context pressure concentrating?
4. Which surface is active right now, and how trustworthy is that view?
5. What should I inspect next?

## Core Product Direction

### Concept

**Working concept**: `Signal Foundry`

The product should feel like raw AI activity is being refined into clear
signals:

- spend
- success
- confidence
- pressure
- trend
- volatility
- focus

The interface should not look like accounting software and not like a generic
dark AI dashboard. It should feel:

- technical
- premium
- high-signal
- fast
- grounded in monitoring and decision-making

### Relationship To Phase 008

Phase 008 already captured the need for a visual system, logo, icon, and brand
refresh. This Phase 009 revisit should **use that intent**, but anchor it in
the much richer current product state.

In practice:

- Phase 008 remains the brand-language foundation
- Phase 009 revisit defines how that language is expressed across actual
  analytical surfaces and current truth layers

## Scope

- redesign the desktop Overview screen
- redesign the desktop Analytics screen
- refine menubar visual grammar so it feels consistent with the dashboard
- define a modern chart vocabulary for Token Tracker
- define product-level information hierarchy for monitoring, comparison, and
  drilldown
- define a branded palette, logo direction, icon direction, and tray/app icon
  constraints
- define required empty, loading, warning, degraded, and fallback states
- define prompts and deliverables for Stitch or Gemini concept generation
- reconcile the Phase 009 spec kit to the current state of the repo

## Non-Goals

- no speculative new provider integrations in this phase
- no design that hides uncertainty or heuristic data behind polished visuals
- no generic “card soup” redesign
- no decorative 3D, glass, or neon treatment that harms legibility
- no inaccessible chart choices that depend on hover, color alone, or dense
  legends
- no silent rewrite of product semantics already introduced by Phases 010–013b

## Current State Assessment

### What exists today

- stat-card summary row on Overview
- success and verification summary blocks
- context health sections
- active-surface truth section
- provider and session tables
- analytics bar sections, daily rows, and heatmap
- menubar hero, provider rows, recent sessions, context cue, active-surface cue
- light/dark mode support

### What is weak today

- mostly static card + bar + table composition
- little sense of narrative flow from top to bottom
- weak visual grouping between “monitor now”, “compare”, and “investigate”
- limited micro-visualizations inside KPI cards
- no distinct visual identity, logo, or palette system
- colors are functional but generic
- typography is plain and non-ownable
- the desktop view still feels closer to an admin report than a product

## Design Principles

### 1. Overview is for orientation, not inventory

The overview screen should answer:

- what is happening now
- what changed recently
- what is healthy vs risky
- what deserves inspection next

Overview should not begin with plain totals alone.

### 2. Every important number needs context

Standalone numbers are weak. High-value KPI cards should pair the main metric
with at least one of:

- delta vs previous period
- sparkline
- rank or percentile
- target/threshold state
- comparison to another provider/model

### 3. Comparison beats accumulation

The product is most useful when users can compare:

- provider vs provider
- model vs model
- today vs previous period
- success vs spend
- context pressure vs outcome
- fallback truth vs strong truth

Charts must emphasize comparison, not just raw totals.

### 4. Narrative summaries matter

The best dashboards explain the data, not just show it.

Each major section should be able to include:

- a title
- a one-sentence summary
- a “why this matters” cue
- a next-inspection hint

### 5. Monitoring and analysis are different modes

The product has both:

- monitoring needs
- analytical comparison needs

The system should reflect that split:

- Overview leans monitoring and triage
- Analytics leans comparison and deeper pattern reading
- Menubar leans fast status and action launch

### 6. Truth states are first-class visual states

Fallback, degraded, unresolved, and heuristic views must look intentionally
different from strong truth states.

This applies to:

- success-confidence
- context thresholds
- active-surface tier/source
- estimated vs unknown metrics

## Information Architecture

### Overview target structure

1. **Hero band**
- stronger brand presence
- timeframe selector
- top-level “signal summary” instead of plain totals only
- key sentence about current state

2. **KPI deck with micro-trends**
- spend
- tokens
- success quality
- context pressure
- active-surface truth
- provider volatility or anomaly count

3. **Now / Risk / Opportunity strip**
- near-limit sessions
- weak-confidence sessions
- top waste driver
- top performer

4. **Visual comparison zone**
- provider contribution
- cost vs success or value density comparison
- current-period vs previous-period change

5. **Operational truth zone**
- active-surface truth card
- context health card
- notification state or gating summary

6. **Investigate table zone**
- sessions table
- provider table
- filters with clearer hierarchy and stronger affordances

### Analytics target structure

1. **Analytics hero**
- selected date window
- headline summary sentence
- “best / worst / changed most” bullets

2. **Trend row**
- tokens over time
- cost over time
- session count over time
- optional combined toggle

3. **Performance and value row**
- provider score comparison
- value density comparison
- rework or waste concentration

4. **Pressure and truth row**
- context pressure distribution
- active-surface tier/source distribution when available
- fallback/degraded share if tracked

5. **Composition row**
- provider/model mix
- outcome/verification mix
- token composition by category where available

6. **Heat / rhythm row**
- activity heatmap
- streaks, bursts, or volatility patterns

7. **Narrative footer**
- short takeaways
- data caveats
- explicit unknowns or weak-evidence notes

## Visualization System Requirements

The chart system should prioritize a small, repeatable, modern set:

- KPI cards with sparklines
- stacked area or layered line charts for trend
- grouped or stacked bars for comparisons
- heatmaps for activity cadence
- dot/scatter or quadrant views for cost vs value and pressure vs success
- progress / threshold meters for risk states
- ranked lists with embedded bars or micro-bars
- compact segmented bars for composition

Avoid relying on:

- pie charts as a default
- too many colors in one graphic
- charts with more than five concurrent categories unless faceted
- hover-only explanation

## Overview Visual Requirements

- transform the existing stats row into a more expressive signal deck
- add trend miniatures to core KPIs
- add a high-priority comparison panel near the top
- visually distinguish:
  - healthy
  - mixed
  - risky
  - unknown
  - fallback
- make the page feel alive without requiring motion

## Analytics Visual Requirements

- move beyond repeated horizontal bar rows
- support true visual comparison across providers and time windows
- provide at least one quadrant or scatter-like analytical view
- preserve tables, but position them as support, not as the primary visual story
- use section intros that explain what the chart is meant to reveal

## Menubar Alignment Requirements

The menubar should not copy the full dashboard, but it should share its visual
language:

- same color semantics
- same brand tokens
- same truth-state language
- same metric naming
- stronger micro-visualization treatment for the hero and status cues

## Brand System Requirements

### Logo

Need a new Token Tracker logo direction that works in:

- full wordmark
- square app icon
- tray/menu bar mark
- favicon-scale mark

Preferred metaphors:

- signal beacon
- refracted token
- layered pulse
- directional tracker mark

Avoid:

- coins
- dollar-sign-first branding
- generic robot heads
- cyberpunk clichés

### Palette

Need a named system, not ad hoc colors.

Suggested palette behavior:

- base neutrals with subtle tint
- one strong primary signal color
- one cool comparison accent
- one warm caution accent
- one critical accent
- one low-confidence / unresolved neutral accent

The palette should support:

- light mode
- dark mode
- chart series
- states
- backgrounds
- dividers
- tray icon legibility

### Typography

The current system-ui voice is serviceable but forgettable.

The redesign should define:

- display type for heroes
- compact metric type for cards and menubar
- body type for dense analytical content
- rules for numeric emphasis and tabular alignment

## Accessibility Requirements

This phase must follow accessibility guidance explicitly:

- use common chart types first
- state the main takeaway in nearby text
- do not require hover to understand meaning
- do not rely on color alone
- support screen-reader text or data-table equivalents when charts become
  semantically important
- maintain WCAG AA contrast in both themes
- preserve keyboard access and clear focus states

## Required Design Outputs From Stitch Or Gemini

If design generation is used, we need these outputs:

1. **Design system board**
- palette tokens
- type scale
- surface styles
- status styles
- chart color rules
- icon/logo exploration

2. **Overview concepts**
- at least 2 materially different directions
- one stronger “decision cockpit” version
- one cleaner “editorial analytics” version

3. **Analytics concepts**
- chart-rich comparison layout
- dashboard hierarchy
- narrative summaries

4. **Menubar concepts**
- compact hero
- active-surface cue
- risk states
- small-size icon treatment

5. **Brand asset board**
- logo sketches
- tray icon sketches
- app icon direction

## Prompt Guidance For Stitch Or Gemini

The prompt must ask for:

- modern analytical software, not generic SaaS
- high information density with clear hierarchy
- premium but restrained energy
- desktop-first layout with responsive viability
- visual distinction between strong truth and fallback states
- multiple chart types that are implementation-realistic
- ownable brand language

The prompt must forbid:

- purple-on-dark default AI style
- meaningless gradients
- overly rounded generic admin UI
- purely decorative charts
- inaccessible low-contrast color sets

## Deliverables

- revised Phase 009 spec kit aligned with current product state
- concrete dashboard/analytics redesign program
- visual-system and brand requirements
- chart vocabulary and information architecture
- explicit design-generation brief requirements
- implementation-ready task list

## Acceptable Completion

Phase 009 revisit is complete only when:

- Overview and Analytics have a clearly upgraded visual system
- the redesign uses current product truth layers, not obsolete metrics only
- the product has a defined logo, app icon, and palette direction
- the dashboard tells a story instead of presenting disconnected numbers
- the spec is detailed enough that Stitch/Gemini concepts and OpenCode
  implementation can proceed without guesswork
