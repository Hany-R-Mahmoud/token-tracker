# Plan: Visual System And Brand Refresh

## Phase Path

1. Brand and concept lock
2. Design system generation
3. Screen generation
4. Variant review and narrowing
5. Implementation handoff
6. Execution and verification

## Chosen `agent-impeccable` Route

Primary mode:

- `frontend-design`

Supporting modes:

- `arrange`
- `typeset`
- `colorize`
- `overdrive`
- `adapt`
- `polish`

Why this route:

- `arrange` to break the current card/table-heavy dashboard rhythm
- `typeset` to give the product a more ownable voice
- `colorize` to make data states and graphs more legible and memorable
- `overdrive` because the user explicitly wants a bigger leap, not incremental polish
- `adapt` because menubar/dashboard/leaderboard all need responsive clarity
- `polish` to keep the result premium rather than chaotic

## Execution Sequence

### Stage 1: Direction Lock

- Confirm Prism Forge as the default concept unless Stitch variants produce a
  stronger direction with the same product fit
- Decide logo metaphor, color families, typography pairings, and visual depth
- Reject any direction that feels too close to AI Token Monitor or CodexBar

### Stage 2: Design System

- Create a design system prompt for Stitch covering:
  - brand principles
  - theme tokens
  - chart grammar
  - surface depth
  - spacing and type rhythm
  - icon/logo direction

### Stage 3: Screen Generation

- Generate Overview
- Generate Analytics
- Generate Menubar
- Generate Leaderboard
- Generate Settings
- Generate Empty / onboarding states
- Generate Logo / icon exploration board

### Stage 4: Variant Narrowing

- Generate 2-3 variants for Overview, Analytics, and Menubar
- Keep the strongest common direction
- Ensure the selected direction still supports implementation realism

### Stage 5: OpenCode Handoff

- Translate the chosen design into an implementation brief
- Define file targets, theme token strategy, chart implementation direction, and
  logo asset requirements

## Risks To Name Early

- visual ambition may outrun the current server-rendered implementation model
- logo generation may need one extra vector-polish pass after Stitch
- 3D accents can become decorative clutter if not disciplined
- dark mode can collapse contrast if it simply mirrors light mode
- menubar density can regress glanceability if the design becomes too ornate

## Success Test

If someone sees the redesigned product next to the current product and the two
reference apps, they should immediately say:

- this is the same product family across all surfaces
- this looks more modern and more intentional
- this has its own brand, not borrowed vibes
- the data is easier to understand through visuals
