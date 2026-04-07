# Gemini Prompt Pack: Phase 009 Revisit — Concept Exploration And Brand Direction

Use Gemini for broader visual exploration, mood range, and logo/icon ideation.
These prompts are intentionally a bit more exploratory than the Stitch prompts,
but they still need to stay grounded in the product and the spec.

## 1. Master Exploration Prompt

```md
I’m redesigning a local-first desktop analytics product called Token Tracker.

I need concept exploration for the product’s Overview dashboard, Analytics
screen, Menubar command center, and brand system.

Product context:
- Token Tracker helps developers and technical leads understand AI coding tool
  usage across tools like Codex and OpenCode
- It tracks spend, tokens, success quality, context pressure, waste, provider
  comparison, and active-surface truth
- It is not just about cost; it is about understanding whether the spend is
  productive and how trustworthy the current signals are

Current weakness:
- the product has good data and logic, but still looks too plain
- too many surfaces are stat cards, basic bars, and tables
- there is little brand identity, little visual energy, and weak comparison
  storytelling

Design goal:
- make it feel like a modern AI usage decision cockpit
- energetic, premium, technical, and high-signal
- not generic SaaS
- not cyberpunk AI
- not dark purple gradient slop
- not spreadsheet software

Working concept:
- Signal Foundry
- metaphor: noisy AI activity is refined into clear, trustworthy signals

Need from you:
- propose 2 to 3 materially different art directions for the product
- for each direction, describe:
  - visual thesis
  - layout character
  - palette direction
  - typography direction
  - chart treatment
  - brand/logo direction
  - how fallback/degraded/truth states should look
- then recommend the strongest direction for this product

Constraints:
- the UI must support dense analytical content
- numbers should rarely appear without comparison or trend context
- strong truth and fallback states must look different
- charts must be accessible and realistic to implement
- avoid novelty for novelty’s sake
- avoid copying PostHog, Vercel Analytics, Plausible, Grafana, or AI Token
  Monitor directly
```

## 2. Overview Concept Prompt

```md
Design concept directions for the Overview screen of a desktop analytics product
called Token Tracker.

The screen needs to help users answer:
- what changed recently?
- what is risky right now?
- what is worth inspecting next?

The data already exists for:
- spend
- token totals
- success quality
- verification state
- context pressure
- active-surface truth
- provider comparison
- recent sessions

I want 2 distinct layout concepts:

Concept A:
- more decision-cockpit
- more operational
- more monitoring-first

Concept B:
- more editorial analytics
- more premium and calm
- still analytical, but less control-room-like

For each concept, define:
- section hierarchy from top to bottom
- what the hero should show
- what KPI cards should include besides plain numbers
- what visual comparison module should sit near the top
- how active-surface truth and context pressure should be represented
- what table/investigation section should look like
- what the page should feel like emotionally

Also include:
- palette direction
- typography direction
- chart ideas
- 1-line rationale for why the concept works
```

## 3. Analytics Concept Prompt

```md
Design concept directions for the Analytics screen of Token Tracker.

This should be the most graph-rich screen in the product.

The screen should support:
- spend trends
- token trends
- session count trends
- provider and model comparison
- success score
- rework score
- value density
- context pressure
- activity heatmap
- outcome and verification distributions

I want a concept that feels:
- premium
- modern
- analytical
- implementation-realistic

Please define:
- the section order of the screen
- which charts are best for each section
- where narrative summaries should appear
- where to place comparison-first panels
- how to avoid chart overload
- how to visually separate “trend”, “comparison”, “composition”, and “truth”

Also include:
- one recommended chart vocabulary for the whole product
- one quadrant/scatter concept if appropriate
- rules for limiting color and category count
```

## 4. Logo And Icon Exploration Prompt

```md
Create a logo exploration brief for Token Tracker.

The brand should feel:
- technical
- premium
- modern
- compact
- recognizable at very small sizes

Product meaning:
- the product turns noisy AI activity into clear signals and decisions
- it tracks, compares, and surfaces truth

Preferred metaphors:
- signal beacon
- refracted token
- layered pulse
- directional tracker mark

Avoid:
- mascots
- robot heads
- coins
- dollar signs
- generic dashboard icons
- corporate shield marks

I need:
- 3 logo directions
- for each direction:
  - symbol idea
  - wordmark feel
  - square app icon behavior
  - tray icon behavior
  - favicon behavior
  - strengths and risks

Then recommend the strongest one for a local-first AI analytics desktop app.
```

## 5. Palette And Typography Prompt

```md
Propose a visual system palette and typography direction for Token Tracker.

Requirements:
- must support light mode and dark mode
- must work for analytical dashboards with many charts
- must support:
  - success
  - warning
  - critical
  - fallback
  - unknown
  - comparison accent
  - primary signal color
- should feel premium and technical, not generic SaaS
- should avoid purple/cyan AI cliché
- should work for tray icon and small UI elements

Typography requirements:
- one display direction
- one dense body/interface direction
- strong numeric emphasis
- good readability in data-heavy screens
- not plain system UI as the only voice

Return:
- palette philosophy
- example token groups
- typography philosophy
- why this system fits the product
```

## 6. Final Selection Prompt

Use this after you have generated design concepts.

```md
Compare these Token Tracker design directions and choose the best one for
implementation.

Evaluate each direction on:
- clarity in 5 seconds
- comparison power
- support for dense analytical content
- visual distinctiveness
- implementation realism
- accessibility risk
- fit for menubar + dashboard + icon system
- honesty of fallback/degraded states

Then provide:
- the winning direction
- what to borrow from the losing directions
- the final visual system summary
- the implementation priorities for Overview, Analytics, Menubar, logo, and
  palette
```
