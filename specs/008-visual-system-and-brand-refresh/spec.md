# Feature Specification: Visual System And Brand Refresh

**Feature Branch**: `008-visual-system-and-brand-refresh`  
**Created**: 2026-04-05  
**Status**: Draft  
**Primary Execution Owners**: Stitch for design generation, OpenCode for implementation  
**Design Lead**: `agent-impeccable`  
**Input**: Current product surfaces in `apps/desktop/`, `apps/web/`, current design context in `.impeccable.md`, current product and parity notes in `README.md` and `docs/reference-products.md`.

## Goal

Turn Token Tracker from a useful local utility into a distinctive product with
its own visual identity, stronger data storytelling, and a memorable brand.

Phase 008 is not a generic polish pass. It is a deliberate visual-system and UX
program that should make the product feel modern, data-rich, and unmistakably
different from AI Token Monitor and CodexBar.

The outcome should include:

- a new product visual system
- stronger dashboard and menubar visuals
- richer graphs and data storytelling
- full light and dark mode design direction
- a new logo and icon system
- implementation-ready handoff for OpenCode

## Design Context

This phase must follow the existing in-repo design context in
`/Users/hanyramadan/token traker/.impeccable.md`.

Key product truths:

- target users are developers and team leads
- the app answers: "Am I spending wisely?", "Which models are worth it?",
  "Where is the waste?"
- the product should feel bold, energetic, modern, and alive
- the interface should reveal patterns quickly without hiding uncertainty

## Product Design Thesis

Token Tracker should look like a **decision cockpit**, not a spreadsheet and
not a clone of the products that inspired it.

Recommended visual direction for Phase 008:

- **Concept name**: Prism Forge
- **Core metaphor**: raw spend and token activity enter as noise, then the
  product refracts them into clear signals, outcomes, and decisions
- **Memorable signature**: layered prismatic charts, orbital/radial accents,
  and a logo mark built from a split token or refracted beacon form
- **Tone**: confident, technical, premium, energetic
- **Interaction posture**: fast, informative, visual-first, locally grounded

This direction should feel more designed and more ownable than either reference
product:

- not the same dashboard grammar as AI Token Monitor
- not the same tiny-only ambient utility feeling as CodexBar

## Scope

- dashboard visual redesign
- analytics visualization redesign
- menubar visual redesign and density refinement
- leaderboard visual redesign
- settings / preferences visual alignment
- empty/loading/error state redesign
- responsive behavior review
- light mode and dark mode design system
- new logo, app icon, tray icon, and favicon direction
- documentation and handoff artifacts for implementation

## Non-Goals

- no new provider integrations in this phase
- no product-positioning drift away from local-first
- no theatrical 3D that harms readability or performance
- no decorative motion that obscures data
- no misleading visual treatment for heuristic metrics

## Design Objectives

- Make the app feel visually premium and modern without becoming noisy.
- Increase graph density and clarity across overview, analytics, and menubar.
- Use color to expose patterns, confidence, risk, and effectiveness.
- Introduce a branded visual language that can be recognized instantly.
- Preserve quick-glance speed while making the product feel much richer.
- Support both light and dark mode as first-class visual systems.

## Experience Requirements

- The dashboard must feel like a high-signal control room, not a list of cards.
- The menubar must preserve compact utility while gaining stronger visual
  sophistication.
- Analytics must include richer graph vocabulary than simple bars alone.
- The product should surface not only consumption, but also:
  - outcome quality
  - efficiency
  - waste concentration
  - provider/model mix
  - trend direction
- Every primary surface must have visual hierarchy that clarifies:
  - what happened
  - why it matters
  - what to inspect next

## Visualization Requirements

Phase 008 should introduce or redesign visual components such as:

- radial or orbital spend summaries
- layered area or ribbon trend views
- heatmaps with stronger contrast and legibility
- stacked provider/model contribution charts
- efficiency vs cost scatter or quadrant views
- outcome distribution visuals
- compact sparkline or micro-trend treatments in menubar
- 2D/3D-inspired visual accents that feel dimensional without becoming fake-3D

The app should feel more visual, but visuals must remain explainable and useful.

## Brand Requirements

- Design a new logo for Token Tracker.
- The logo must work as:
  - full wordmark + icon
  - square app icon
  - menu bar / tray icon
  - favicon-scale mark
- The logo should feel technical and premium, not playful or corporate-generic.
- The icon should be identifiable at very small sizes.
- The logo should connect to the product metaphor of turning noisy AI usage into
  clear decisions and signals.

## Theming Requirements

- Light mode and dark mode must both be designed intentionally, not as a simple
  inversion.
- Color tokens should support:
  - healthy / efficient
  - mixed / warning
  - waste / critical
  - neutral / unknown
  - provider differentiation
- Neutrals should be tinted, not pure grayscale.
- Typography, spacing, depth, and shadows must adapt meaningfully across themes.

## Differentiation Guardrails

- Do not imitate the reference products' layout structure or visual styling.
- Avoid generic SaaS card grids and gradient-on-dark AI aesthetics.
- Avoid default fonts such as Inter, Roboto, Arial, or plain system stacks as
  the only typographic voice.
- Avoid relying on one visual trick everywhere.
- Build a system that can scale across dashboard, menubar, leaderboard, and
  brand assets.

## Stitch Design Contract

Stitch should be used to generate the design system and screen concepts for
Phase 008.

The design generation flow should be:

1. Create the design system for Prism Forge
2. Generate screen concepts for:
   - Overview
   - Analytics
   - Menubar / command center
   - Leaderboard
   - Settings / preferences
   - Empty / onboarding states
   - Logo / icon exploration board
3. Generate variants for the strongest screens
4. Refine the selected direction before implementation handoff

Stitch outputs should optimize for:

- bold but readable hierarchy
- light and dark mode readiness
- graph-rich composition
- responsive viability
- implementation realism

## OpenCode Execution Contract

OpenCode should implement Phase 008 only after the design direction and screen
set are chosen.

OpenCode must use agents according to the task slice:

1. `agent-orchestrator` for execution slicing and file ownership
2. `agent-impeccable` for design interpretation, critique, and design-system
   translation
3. `agent-implementer` for HTML/CSS/JS/Tauri implementation
4. `agent-debugging` for layout, native wrapper, and runtime polish issues
5. `agent-tester` for responsive, theme, and interaction verification
6. `agent-reviewer` for regressions, a11y, consistency, and visual honesty
7. `agent-docs` for README and design-system documentation updates

Optional:

- `agent-security` if any visual changes alter external-link behavior, auth
  surface exposure, or leaderboard trust boundaries

## Deliverables

Phase 008 should produce:

- a selected visual direction
- a design-system prompt and output set for Stitch
- redesigned screen concepts for key surfaces
- a selected logo direction
- implementation-ready OpenCode handoff
- docs that describe the new product direction honestly

## Acceptable Completion

- the product has a clearly differentiated visual identity
- the dashboard, analytics, and menubar look intentionally related
- light and dark themes are both designed, not improvised
- graphs and visuals are meaningfully richer than the current state
- a new logo exists and is ready for implementation
- OpenCode can execute without inventing the design system from scratch
