# Phase 009 Revisit Research: Visual Analytics, Dashboards, And Brand Direction

Last updated: 2026-04-07

## Purpose

This note grounds the Phase 009 revisit in current public references so the
spec is not driven by taste alone.

The question for this pass was:

How should Token Tracker redesign its dashboard, analytics, and visual system
so that the current product feels modern, energetic, comparative, and easier to
understand without overclaiming certainty?

## Current Repo Diagnosis

Token Tracker now has more analytical depth than its visual system suggests.

The repo already contains:

- success analysis
- context audit
- active-surface truth
- notification gating
- menubar monitoring
- leaderboard/team views

But the visual system is still mostly:

- plain stat cards
- simple bars
- tables
- generic colors
- minimal brand identity

This creates a product mismatch:

- the information model is richer than the interface
- important comparisons are technically possible but visually weak
- the product still looks more like an internal admin report than a distinctive
  decision tool

## External References

### 1. PostHog dashboards

Source:

- [PostHog dashboard docs](https://posthog.com/docs/product-analytics/dashboards)
- [PostHog dashboards product page](https://posthog.com/dashboards)

Key patterns:

- dashboards collect the most important metrics into a single view
- templates help define strong starting structures
- shared date and property filters drive all insights
- text cards and button tiles add context and navigation
- auto-refresh supports monitoring use cases
- different insight types coexist in the same layout

Implication for Token Tracker:

- Overview and Analytics should feel like curated boards of insights, not just
  one long report page
- the product needs section-level narrative context, not only charts
- global timeframe and comparison controls should become more central visually

### 2. Vercel Analytics

Source:

- [Vercel Web Analytics usage docs](https://vercel.com/docs/analytics/using-web-analytics)

Key patterns:

- strong top-level controls for timeframe, environment, and dimensions
- filtered exploration is a first-class workflow
- dashboards become more useful when panels share common controls

Implication for Token Tracker:

- timeframe controls should be promoted visually
- provider/model/time comparisons should feel globally coordinated
- dimension switching should be treated as a primary dashboard action

### 3. Plausible

Source:

- [Plausible simple analytics overview](https://plausible.io/simple-web-analytics)

Key patterns:

- all important stats on one page
- no deep report maze
- every metric is meant to be understandable at a glance
- comparison to previous period is built into the reading model

Implication for Token Tracker:

- the redesign should resist over-fragmentation
- KPI cards should be clearer and more contextual
- one-page clarity is more valuable than more subsections

### 4. Grafana

Source:

- [Grafana dashboards gallery](https://grafana.com/grafana/dashboards/)

Key patterns:

- broad chart vocabulary
- monitoring posture and panel modularity
- heatmaps, histograms, timelines, and richer monitoring views

Implication for Token Tracker:

- the product can responsibly expand beyond repeated horizontal bars
- monitoring-oriented views such as heat, rhythm, burst, or volatility deserve
  stronger representation
- chart vocabulary must still stay constrained and repeatable

### 5. Metabase

Source:

- [Metabase real-time analytics dashboards](https://www.metabase.com/dashboards/real-time-analytics)

Key patterns:

- “everything in one place”
- exploration and sharing are core product values
- dashboards should support both reading and discovery

Implication for Token Tracker:

- Overview should focus on orientation
- Analytics should focus on comparison and discovery
- screen structure should explicitly support both roles

### 6. shadcn/ui charts

Source:

- [shadcn/ui chart examples](https://ui.shadcn.com/charts/area)

Key patterns:

- modern but implementation-realistic chart compositions
- clean defaults
- good examples of mixing charts with compact KPI layouts

Implication for Token Tracker:

- richer visuals do not require exotic charting
- the redesign should prefer realistic chart primitives that can be implemented
  in the current codebase

### 7. Tremor

Source:

- [Tremor homepage](https://tremor.so/)
- [Tremor KPI blocks](https://blocks.tremor.so/blocks/kpi-cards)

Key patterns:

- KPI cards with embedded trend context
- micro visualizations
- composition blocks for dashboards
- accessible analytical UI defaults

Implication for Token Tracker:

- KPI cards should carry more analytical meaning
- micro visualizations belong in cards, not only in larger chart sections
- compact comparisons can replace some low-value text rows

### 8. USWDS and CFPB design guidance

Sources:

- [USWDS data visualization guidance](https://standards.usa.gov/components/data-visualizations/)
- [CFPB data visualization guidelines](https://cfpb.github.io/design-system/guidelines/data-visualization-guidelines)

Key patterns:

- prefer common chart types
- keep one main message per visualization
- explain the takeaway in text
- provide accessible equivalents
- do not rely on hover or color alone
- keep the number of simultaneous series limited

Implication for Token Tracker:

- the redesign should be expressive, not fancy for its own sake
- charts need nearby summaries and clear intent
- fallback and degraded states should be visible in both text and color

## Design Conclusions

### Conclusion 1: Overview should become a signal board

Not just totals, but:

- what changed
- what is risky
- what is improving
- what needs inspection

### Conclusion 2: Analytics should be comparison-first

The current product has enough truth layers to support:

- spend vs success
- pressure vs value
- provider vs provider
- now vs previous period

Those comparisons need visual priority.

### Conclusion 3: Numbers need context

KPI cards should include:

- delta
- sparkline
- threshold
- or rank/comparison

Plain numbers alone are no longer enough.

### Conclusion 4: The product needs a recognizable visual identity

The repo still lacks:

- logo direction
- app icon direction
- tray icon direction
- coherent palette
- distinctive typography voice

This is now blocking the product from feeling finished.

### Conclusion 5: Honesty remains non-negotiable

Polished visuals cannot make:

- fallback data
- degraded states
- heuristic metrics
- low-confidence analysis

look stronger than they are.

The redesign must preserve semantic honesty.

## Recommended Visual Direction

Working direction:

- a premium analytical “signal foundry” or “decision cockpit” feel
- not generic SaaS
- not cyberpunk AI
- not spreadsheet software

Desired traits:

- energetic but restrained
- visual hierarchy stronger than decorative styling
- compact density where useful
- subtle depth, not heavy gloss
- brand that feels technical and ownable

## What The Spec Must Require

The Phase 009 revisit spec should require:

- Overview redesign
- Analytics redesign
- Menubar alignment
- chart vocabulary definition
- visual-system definition
- logo/icon/palette direction
- design generation prompts for Stitch or Gemini
- explicit accessibility and truth-state requirements

## Open Questions Left For Design Generation

1. Which visual direction fits the product best:
   - bold decision cockpit
   - editorial analytics
   - hybrid of both
2. What logo metaphor feels most ownable:
   - signal beacon
   - refracted token
   - layered pulse
3. How energetic can the palette be without hurting readability?
4. Which sections deserve the highest density and which need more breathing room?

## Recommended Next Step

Use the revised spec kit to generate:

- at least 2 stitched dashboard directions
- at least 1 logo/icon exploration board
- at least 1 analytics-focused layout board

Then choose a direction before implementation starts.
