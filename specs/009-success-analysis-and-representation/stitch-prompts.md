# Stitch Prompt Pack: Phase 009 Revisit — Visual Analytics, Dashboard Redesign, And Brand System

Use these prompts in order. This pack is for concept generation and direction
selection, not implementation.

The goal is to redesign Token Tracker around the richer analytical product that
already exists in the repo:

- success analysis
- context audit
- active-surface truth
- notification gating
- provider/model comparison
- menubar monitoring

The UI must stop feeling like a generic report page and start feeling like a
modern AI usage decision cockpit.

## 1. Design System Prompt

Use this first.

```md
Create a new design system for Token Tracker called "Signal Foundry".

Product:
- Token Tracker is a local-first desktop product for developers and technical
  leads who want to understand AI coding tool usage, spend, efficiency, waste,
  context pressure, and outcome quality across tools like Codex and OpenCode.
- The product is not only about cost. It helps answer:
  - what changed?
  - what is worth the spend?
  - where is the waste?
  - how trustworthy is the current signal?

Audience:
- developers
- technical leads
- operator-minded users
- people who care about monitoring and comparison, not vanity dashboards

Brand personality:
- technical
- premium
- energetic
- high-signal
- confident
- modern
- locally grounded

Emotional goals:
- clarity
- control
- momentum
- trust

Visual direction:
- concept name: Signal Foundry
- metaphor: noisy AI activity is refined into clear, trustworthy signals
- this should feel like a decision cockpit or analytical control room, not a
  spreadsheet and not a clone of AI Token Monitor or CodexBar
- use depth, contrast, rhythm, and hierarchy intelligently
- avoid generic SaaS card soup
- avoid AI-default purple/cyan dark themes
- avoid decorative charts or meaningless gradients

Required system outputs:
- light mode and dark mode
- palette tokens
- typography direction
- card and panel styles
- chart color rules
- success / warning / critical / fallback / unresolved states
- compact menubar-compatible visual language
- logo and icon direction

Color requirements:
- use tinted neutrals, not plain grayscale
- define semantic colors for:
  - success
  - mixed / caution
  - critical / waste
  - unknown
  - fallback / degraded
  - primary signal
  - comparison accent
- the palette must work for dashboards and charts

Typography requirements:
- choose a distinctive display direction and a readable body direction
- optimize for dense analytical UI
- numeric emphasis should feel intentional and premium
- do not use Inter, Roboto, Arial, or a plain system font stack as the whole
  voice

Chart language:
- KPI cards with sparklines
- layered line or area trends
- grouped and stacked bars
- heatmaps
- ranked lists with embedded bars
- segmented composition bars
- at least one quadrant or scatter-like analytical view

Truth-state requirements:
- strong truth and fallback states must look different
- degraded, unresolved, estimated, and unknown states must be visually honest

Brand assets:
- include direction for:
  - full wordmark
  - app icon
  - tray icon
  - favicon-size mark
- preferred metaphors:
  - signal beacon
  - refracted token
  - layered pulse
  - directional tracker mark
- avoid:
  - coins
  - dollar-sign-first branding
  - mascots
  - generic corporate shields

Output goal:
- a design system strong enough that Overview, Analytics, Menubar, and brand
  assets clearly belong to one product family
```

## 2. Overview Screen Prompt

```md
Design the main Overview screen for Token Tracker using the Signal Foundry
design system.

The current product already contains:
- spend totals
- token totals
- success analysis
- verification state
- context health
- active-surface truth
- provider summaries
- session investigation tables

This screen should be restructured around orientation and triage.

Requirements:
- make the first screen feel like a monitoring-first decision cockpit
- do not start with a plain row of stat cards only
- include:
  - hero band with timeframe and a short “state of the system” summary
  - KPI deck with micro-trends
  - now / risk / opportunity strip
  - provider comparison view
  - spend vs success or value comparison
  - active-surface truth panel
  - context pressure panel
  - investigation section for recent sessions and provider table
- show visually distinct states for:
  - healthy
  - mixed
  - risky
  - unknown
  - fallback
- make the page feel alive, premium, and analytical without relying on motion
- keep it realistic for implementation in a modern frontend
- desktop-first, responsive-ready
- do not copy AI Token Monitor
- do not produce generic admin dashboard layout

Deliver:
- at least 2 materially different overview directions
- one stronger decision-cockpit version
- one cleaner editorial-analytics version
```

## 3. Analytics Screen Prompt

```md
Design the Analytics screen for Token Tracker using the Signal Foundry design
system.

This screen should be the most graph-rich screen in the product.

The current data model can support:
- spend over time
- tokens over time
- session count over time
- provider and model comparison
- success score
- rework score
- value density
- context pressure
- activity cadence
- outcome and verification distributions
- active-surface truth states

Requirements:
- structure the screen as a comparison-first analytical workspace
- include:
  - analytics hero with timeframe and narrative summary
  - trend row
  - provider/model comparison row
  - performance and value row
  - pressure and truth row
  - composition row
  - heat / rhythm row
  - narrative footer or takeaway area
- use multiple visualization types, such as:
  - line or layered area trends
  - grouped / stacked bars
  - heatmap
  - segmented composition bars
  - scatter or quadrant view for cost vs value or pressure vs success
- preserve readability and explanation
- avoid charts that require hover to understand
- support light and dark mode
- make the layout feel modern, premium, and implementation-realistic
- do not mimic existing reference products closely
```

## 4. Menubar Alignment Prompt

```md
Design a rich menubar / command center view for Token Tracker using the Signal
Foundry design system.

This is not a full dashboard. It must stay compact and highly glanceable.

Requirements:
- align visually with the redesigned Overview and Analytics screens
- include:
  - compact hero
  - tiny spend and trend context
  - active-surface truth cue
  - context pressure cue
  - provider health/reset block
  - quick actions
- maintain strong density at small width
- use micro-visualizations, not large charts
- support light and dark mode
- make the menubar feel premium and distinctive
- do not clone CodexBar
- tray-icon and hero language should feel like part of the same system
```

## 5. Brand Asset Board Prompt

```md
Design a brand exploration board for Token Tracker using the Signal Foundry
design system.

Explore 3 strong directions for:
- full wordmark
- icon-only mark
- app icon
- tray/menu bar icon
- favicon-size mark

The logo should feel:
- technical
- premium
- modern
- small-size legible
- ownable

Prefer metaphors such as:
- signal beacon
- refracted token
- layered pulse
- directional tracker

Avoid:
- mascots
- robot heads
- plain initials only
- corporate shield marks
- charts or pie charts as logos
- dollar-sign-first iconography

Show how the symbol behaves at:
- hero size
- square icon size
- tiny tray size
```

## 6. Variant Prompt

Use this after choosing the strongest direction.

```md
Generate 3 variants of the selected Token Tracker direction while keeping the
same Signal Foundry product identity.

Variant goals:
- Variant A: more premium and editorial
- Variant B: more energetic and graph-forward
- Variant C: more technical and cockpit-like

Keep:
- the same product meaning
- the same truth-state semantics
- the same visual family

Change:
- hierarchy
- composition
- chart emphasis
- density
- typography emphasis
```

## 7. Design Selection Checklist

Use this when reviewing generated concepts:

- Does the page answer “what changed?” quickly?
- Are KPI numbers paired with trend or comparison context?
- Is there a clear distinction between strong truth and fallback states?
- Does the system feel like one product across dashboard and menubar?
- Is the chart vocabulary varied enough but still coherent?
- Does the design feel distinctive without becoming gimmicky?
- Would the layout still work in code without a framework rewrite?
