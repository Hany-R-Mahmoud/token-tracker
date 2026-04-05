# Stitch Prompt Pack: Visual System And Brand Refresh

Use these prompts with Stitch in order. Treat this file as the design handoff
for Phase 008.

## 1. Design System Prompt

Use this first when creating or updating the design system.

```md
Create a new design system for Token Tracker called "Prism Forge".

Product:
- Token Tracker is a local-first desktop product for developers and team leads
  who want to understand AI coding tool usage, cost, efficiency, waste, and
  outcomes across tools like Codex and OpenCode.
- The product should feel like a decision cockpit, not a spreadsheet and not a
  clone of AI Token Monitor or CodexBar.

Audience:
- developers
- technical leads
- operator-minded users who like depth but need quick pattern recognition

Brand personality:
- bold
- energetic
- modern
- technical
- premium
- confident
- helpful rather than corporate

Emotional goals:
- confidence
- clarity
- momentum

Visual direction:
- concept name: Prism Forge
- metaphor: raw AI usage data enters as noise and is refracted into clear,
  actionable signals
- the system should use layered 2D and subtle 3D-inspired depth, orbital/radial
  accents, tinted neutrals, vivid but disciplined accent colors, and graph-first
  storytelling
- avoid generic SaaS dashboard styling, avoid AI-default purple/cyan aesthetics,
  avoid repetitive card grids, avoid plain enterprise admin vibes

Color system:
- support light and dark themes intentionally
- use tinted neutrals rather than pure gray
- define clear semantic colors for efficient, mixed, waste-heavy, unknown,
  healthy, warning, and critical
- create a palette that can support data-rich graphs and small menubar states

Typography:
- choose a distinctive display font and a refined readable body font
- do not use Inter, Roboto, Arial, or plain system defaults as the only voice
- hierarchy should feel premium, technical, and editorial

Components and surfaces:
- dashboard
- analytics
- menubar / command center
- leaderboard
- settings
- empty / loading / signed-out states

Chart language:
- radial summaries
- layered area or ribbon trends
- stacked provider/model contribution charts
- heatmaps
- efficiency vs cost comparisons
- compact micro-trends for menubar

Brand assets:
- include direction for logo, app icon, tray icon, and favicon
- logo should feel technical and premium, built around a refracted token /
  signal / prism / beacon idea

Output goal:
- a design system strong enough that all generated screens clearly belong to the
  same product family
```

## 2. Overview Screen Prompt

```md
Design the main Overview screen for Token Tracker using the Prism Forge design
system.

Requirements:
- make it feel like a high-signal control room for AI usage
- show total spend, total tokens, total sessions, and a strong effectiveness
  read on the first screen
- include richer visual storytelling than a row of stat cards
- include at least:
  - hero summary
  - spend trend
  - provider contribution
  - efficiency / waste overview
  - recent notable sessions or highlights
  - clear next actions
- use graph-rich composition and strong color hierarchy
- support both light and dark mode in the design direction
- keep the layout implementable in a modern frontend without relying on fantasy
  visuals
- do not mimic AI Token Monitor layout
- do not use generic card grids
```

## 3. Analytics Screen Prompt

```md
Design the Analytics screen for Token Tracker using the Prism Forge design
system.

Requirements:
- this screen should be the most graph-rich screen in the product
- include multiple visualization types, such as:
  - layered area or ribbon chart for spend / tokens over time
  - stacked provider/model comparison
  - heatmap for activity
  - efficiency vs cost comparison
  - outcome distribution
- show how users can understand not just what they spent, but whether it paid
  off
- the screen should feel modern, premium, and visually memorable
- include thoughtful legends, labels, and hierarchy
- support light and dark mode
- the result must be clearly different from the reference products
```

## 4. Menubar Prompt

```md
Design a rich menubar / command center view for Token Tracker using the Prism
Forge design system.

Requirements:
- compact but premium
- highly glanceable
- visually richer than a simple list of rows
- answer in the first view:
  - how much was consumed
  - whether the spend appears effective
- include:
  - hero spend summary
  - micro-trend visuals
  - provider health/reset block
  - effectiveness/outcome block
  - quick actions
  - optional leaderboard preview
- make the menubar feel modern and ownable, not a clone of CodexBar
- maintain readable density at small width
- support light and dark mode
- use small-scale visual depth and color discipline
```

## 5. Leaderboard Prompt

```md
Design the Team Leaderboard screen for Token Tracker using the Prism Forge
design system.

Requirements:
- frame the leaderboard as growth and optimization, not shaming
- make the screen feel competitive in a healthy technical way
- include:
  - page hero
  - rank context
  - member list/table
  - filters / period switching
  - small supporting analytics
  - privacy-safe detail preview area
- visually connect the leaderboard to the same graph and color language as the
  dashboard
- support light and dark mode
```

## 6. Settings Prompt

```md
Design the Settings / Preferences screen for Token Tracker using the Prism
Forge design system.

Requirements:
- settings should feel integrated with the product, not like a generic form page
- include sections for:
  - theme
  - refresh cadence
  - menubar preferences
  - leaderboard / account state
  - export / clipboard behavior if helpful
- use the same type, spacing, and visual rhythm as the rest of the product
- support light and dark mode
```

## 7. Empty / Onboarding Prompt

```md
Design empty and first-run states for Token Tracker using the Prism Forge
design system.

Requirements:
- this should teach the interface, not just say "nothing here"
- include an empty Overview state and an empty Menubar state
- explain how to import data and what the product will show once data arrives
- keep the tone confident and helpful
- support both light and dark mode
- visually reinforce the product brand
```

## 8. Logo Exploration Prompt

```md
Design a logo exploration board for Token Tracker under the Prism Forge visual
system.

Requirements:
- explore 3 strong directions for a new logo and icon
- the logo should feel technical, premium, modern, and distinctive
- connect the symbol to one or more of:
  - prism
  - refracted signal
  - beacon
  - token shard
  - tracked pulse
- show:
  - full wordmark
  - icon-only mark
  - square app icon
  - tiny tray/favicon-scale icon
- ensure the icon remains recognizable at very small sizes
- avoid mascots, generic charts, plain initials, or corporate shield marks
```

## 9. Variant Prompt

Use after generating the strongest screens.

```md
Generate 3 variants of the selected Token Tracker screen while keeping the same
Prism Forge product identity.

Variant goals:
- Variant A: more premium and editorial
- Variant B: more energetic and graph-forward
- Variant C: more technical and cockpit-like

Do not change the product identity. Change hierarchy, composition, type
emphasis, and graph treatment while keeping the same overall system.
```

## 10. OpenCode Design Interpretation Prompt

Use this when handing the selected Stitch direction to OpenCode.

```md
Implement Phase 008 from the selected Stitch designs for Token Tracker.

Use these agents according to the work:
- `agent-orchestrator`
- `agent-impeccable`
- `agent-implementer`
- `agent-debugging`
- `agent-tester`
- `agent-reviewer`
- `agent-docs`

Implementation goals:
- translate the selected Prism Forge direction into production-ready code
- preserve the chosen visual identity across Overview, Analytics, Menubar,
  Leaderboard, Settings, and logo assets
- support light and dark mode intentionally
- implement richer graphs and data storytelling without sacrificing readability
- keep metric semantics honest
- make the product feel clearly different from AI Token Monitor and CodexBar

Final report must include:
- chosen design direction summary
- files changed
- how the design system was translated into tokens/components
- validation for responsiveness, themes, graphs, and logo/icon usage
- remaining gaps with evidence only
```
