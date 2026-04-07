# Replit Prompt: Expo Mobile Companion For Token Tracker

Last updated: 2026-04-07

## Purpose

This prompt is for Replit to generate a React Native app with Expo that mirrors
the current Token Tracker product as a mobile companion.

The goal is not to redesign the product. The goal is to preserve the same
component structure, information architecture, visual language, graphs, and
state honesty as the current app, while adapting it to a mobile-native layout.

## Visual References

These are current product assets from the repo. Replit should treat them as
reference material for brand fidelity and visual tone.

### Current App Icon

![Token Tracker icon PNG](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/icons/icon.png)

### Current Refracted Token Mark

![Token Tracker refracted token SVG](/Users/hanyramadan/token%20traker/apps/desktop-tauri/src-tauri/icons/refracted-token.svg)

### Brand Mark Geometry

The current brand mark is a refracted diamond with three internal horizontal
signal cuts. This geometry appears in both the desktop and web surfaces and
should be preserved in the mobile version.

Source references:

- [apps/desktop/src/brand.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/brand.ts)
- [apps/web/src/index.ts](/Users/hanyramadan/token%20traker/apps/web/src/index.ts#L133)

### Screenshot Capture Note

Live screen screenshots were not embedded in this document because the local
desktop server launch required elevated permission and that launch was not
approved during this session. To keep the prompt honest, this doc uses repo
assets and source-grounded screen mapping instead of invented screenshots.

If screenshots are added later, capture these exact routes from the local
desktop app:

- `http://localhost:3100/`
- `http://localhost:3100/analytics`
- `http://localhost:3100/menubar`
- `http://localhost:3200/leaderboard`

## Current Screen Map

Use this section as a non-negotiable mimic checklist. Replit should map these
desktop/web surfaces into React Native components with the same product meaning
and reading order.

### Overview Surface

Current route:

- desktop: `/`

Current source references:

- [apps/desktop/src/index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L995)
- [apps/desktop/src/styles.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/styles.ts#L1)

Current section order:

1. Overview header and subtitle
2. Operational hero band
3. KPI deck
4. Trend Activity panel
5. Provider Integrity panel
6. Cluster Topology panel
7. Investigation Log panel
8. Active Surface Truth panel
9. Context Health panel
10. Filter state pills and filter controls
11. Provider Summaries table
12. Recent Sessions table

Important desktop builders to mirror:

- `buildOverviewHero(...)`
- `buildOverviewKpiDeck(...)`
- `buildOverviewTrendActivity(...)`
- `buildOverviewProviderIntegrity(...)`
- `buildOverviewCadenceSection(...)`
- `buildOverviewLiveFeed(...)`
- `buildActiveSurfaceTruthSection(...)`
- `buildOverviewContextHealthSection(...)`

Translation rule for Expo:

- convert desktop multi-column grids into stacked mobile sections
- keep the same section order
- keep the same labels and metric groupings
- keep the same distinction between hero, comparative panels, session feed,
  truth-state panel, and context-health panel

### Analytics Surface

Current route:

- desktop: `/analytics`

Current source references:

- [apps/desktop/src/index.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/index.ts#L1507)

Current section order:

1. Analytics header and subtitle
2. Analytics hero
3. Trend Activity panel set
4. Value Density Mapping
5. Provider Efficiency Matrix
6. Activity Cadence
7. Asset Volatility
8. Outcome Composition
9. Model Pressure
10. Distribution
11. Activity Heatmap
12. Success Analysis
13. Context Pressure
14. Active Surface Truth
15. Model Breakdown table
16. Daily Activity table

Important desktop builders to mirror:

- `buildAnalyticsHero(...)`
- `buildAnalyticsTrendPanels(...)`
- `buildAnalyticsValueMatrix(...)`
- `buildAnalyticsComposition(...)`
- `buildAnalyticsSuccessSection(...)`
- `buildAnalyticsContextSection(...)`
- `buildActiveSurfaceTruthSection(...)`

Translation rule for Expo:

- preserve comparison-first reading
- preserve the distinction between trend, comparison, composition, pressure,
  truth, and distribution
- keep charts visually equivalent even if the implementation changes
- use tap-safe summaries rather than hover-based explanation

### Menubar Surface

Current route:

- desktop: `/menubar`

Current source references:

- [apps/desktop/src/menubar.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/menubar.ts)
- [apps/desktop/src/styles.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/styles.ts#L1653)

Current section order in detailed mode:

1. Compact header with health dot and brand lockup
2. Hero with spend, sessions, tokens, mini-bars, effectiveness, and success cue
3. Spend by Provider
4. Outcomes
5. Providers
6. Recent
7. Leaderboard preview
8. Quick actions

Important builders to mirror:

- `buildMenubarHtml(...)`
- `buildMenubarMicroBars(...)`
- `buildWindowContextSignalHtml(...)`
- `buildActiveSurfaceResolutionHtml(...)`

Translation rule for Expo:

- this can become a compact summary card or top-level mobile summary block
- preserve glanceability
- preserve micro-bars and tiny status cues
- preserve the compact leaderboard preview idea

### Leaderboard / Team Surface

Current route:

- web: `/leaderboard`

Current source references:

- [apps/web/src/index.ts](/Users/hanyramadan/token%20traker/apps/web/src/index.ts)

Current surface behavior to preserve:

- ranked member rows
- strong row hover/focus treatment translated into mobile press states
- member detail drawer behavior translated into modal, sheet, or nested screen
- honest signed-out, disconnected, and unavailable states
- same identity hierarchy and rank emphasis

## Component Mapping Guidance

Replit should explicitly map the current product structure into mobile
components instead of inventing a fresh structure.

Recommended component mapping:

- `BrandLockup`
- `HealthDot`
- `OperationalHero`
- `KpiDeck`
- `TrendActivityCard`
- `ProviderIntegrityCard`
- `ClusterTopologyCard`
- `InvestigationLogCard`
- `ActiveSurfaceTruthCard`
- `ContextHealthCard`
- `FilterPills`
- `ProviderSummaryList`
- `RecentSessionList`
- `AnalyticsHero`
- `ValueDensityMatrix`
- `ProviderEfficiencyMatrix`
- `ActivityCadenceCard`
- `AssetVolatilityCard`
- `OutcomeCompositionCard`
- `ModelPressureCard`
- `DistributionCard`
- `ActivityHeatmapCard`
- `SuccessAnalysisCard`
- `ContextPressureCard`
- `LeaderboardRankList`
- `MemberDetailSheet`
- `MenubarSummaryCard`

## Chart And Visual Mimic Rules

Replit should not replace the current visual vocabulary with generic mobile
charts. Use the same visual storytelling patterns:

- mini bars for compact activity cues
- layered trend charts for momentum and change
- provider integrity lane bars
- bubble / matrix style comparison for value density
- topology / grid views for cadence and state clustering
- segmented composition bars for outcomes
- ranked list bars for provider and model comparisons
- explicit truth-state cards for active surface resolution

Mobile adaptation rules:

- preserve the same chart role even if dimensions change
- preserve the same category colors and semantic meaning
- preserve labels near the visual, not hidden behind gestures
- keep unknown, fallback, and degraded data visually distinct from healthy

## Source-Grounded Style Cues

Use the current visual system as the baseline. Do not replace it with generic
Expo defaults.

Source references:

- [apps/desktop/src/styles.ts](/Users/hanyramadan/token%20traker/apps/desktop/src/styles.ts#L1)
- [apps/web/src/index.ts](/Users/hanyramadan/token%20traker/apps/web/src/index.ts#L40)

Key cues to preserve:

- deep ink background with subtle radial highlight
- luminous mint accent over dark navy surfaces
- compact uppercase labels
- premium technical wordmark treatment
- mono treatment for dense metrics and data rows
- strong panel borders and elevated card surfaces
- honest warning and critical contrast

## Prompt

```md
Build a React Native mobile app with Expo called "Token Tracker Mobile".

This app is a mobile companion to an existing product called Token Tracker.
It must feel like the same product, not a redesign and not a reinterpretation.

Primary goal:
- reproduce the current Token Tracker app on mobile
- preserve the same component structure as closely as possible
- preserve the same information hierarchy and page-level structure
- preserve the same charts, visuals, states, and brand language
- adapt the layout for phone screens without changing the product meaning

Important product constraint:
- this is display-only for now
- do not add tracking, usage measurement, token monitoring logic, ingestion logic, telemetry, or admin workflows inside the mobile app
- later, this app will connect to the same backend as the main product
- for now, use hard-coded mock data shaped like the current app’s real data

Screens:
1. Overview
2. Analytics
3. Leaderboard / Team

Required fidelity:
- keep the same product identity and content model
- keep the same section order and same analytical intent
- keep the same semantic states:
  - healthy
  - mixed
  - warning
  - critical
  - fallback
  - degraded
  - unknown
  - unresolved
- keep the same visual honesty around fallback and degraded states
- keep the same metric vocabulary and comparison logic
- do not invent new cards, new metrics, or mobile-only product concepts
- do not reduce the app into a generic mobile dashboard template
- do not redesign the product into a trendy fintech or crypto tracker app

Tech requirements:
- use Expo
- use React Native
- use TypeScript
- use Expo Router or a similarly clean navigation setup
- create reusable components
- keep a clean modular structure
- separate screens, UI components, mock data, theme tokens, and future API/data access layers
- no any types
- include loading, empty, error, fallback, and disconnected states

Architecture requirements:
- organize the app into clear areas such as:
  - app/
  - src/components/
  - src/screens/
  - src/data/mock/
  - src/theme/
  - src/lib/
- create a dedicated theme/tokens layer for:
  - palette
  - spacing
  - typography
  - radii
  - elevation
  - semantic states
- create a dedicated data adapter layer so hard-coded data can later be swapped with backend APIs
- do not couple mock data directly into presentation components

Visual system to preserve:
- background: #0b1326
- panel: #171f33
- panel strong: #131b2e
- text primary: #dae2fd
- text secondary: #bac9cc
- text muted: #849396
- border: #2d3449
- border strong: #3b494c
- accent: #a3ffd9
- accent strong: #36ffc4
- accent soft: rgba(163, 255, 217, 0.12)
- critical: #b01522
- critical soft: rgba(176, 21, 34, 0.14)
- success soft: rgba(54, 255, 196, 0.12)

Typography direction to preserve:
- headings and display should feel like Space Grotesk
- body and interface should feel like Manrope
- numeric and dense data views should feel like Geist Mono or JetBrains Mono where appropriate
- preserve the product’s premium technical tone
- preserve compact uppercase labels and strong metric hierarchy

Brand direction to preserve:
- keep the Token Tracker identity
- preserve the refracted / diamond-like mark with horizontal internal line structure
- keep the product feeling technical, compact, premium, and analytical
- avoid mascot branding
- avoid generic coins, dollar signs, shields, or crypto clichés
- avoid purple/cyan AI styling clichés

Overview screen requirements:
- preserve the current dashboard orientation role
- preserve current summary structure and metric groupings
- preserve provider summaries and status cues
- preserve the relationship between high-level KPIs and supporting detail
- preserve honesty around missing, estimated, fallback, and mixed states
- adapt the layout into a mobile-friendly vertical structure without losing the same sections

Analytics screen requirements:
- preserve the graph-rich analytical nature of the current app
- preserve comparison-first reading
- preserve trend sections, provider/model comparison, success-related metrics, context/pressure signals, truth-state cues, and composition views
- use a mobile-friendly chart library, but make the charts feel visually equivalent to the current product
- do not rely on hover for comprehension
- use tap-safe labels, legends, summaries, or annotations as needed

Leaderboard / Team screen requirements:
- preserve the current leaderboard/team information structure
- preserve ranking emphasis, row hierarchy, and member identity treatment
- preserve disconnected, unavailable, empty, and signed-out states
- if member detail expansion exists in the current app pattern, adapt it cleanly for mobile using a sheet, modal, or nested route

Component structure requirement:
- mirror the current product’s structure and naming as much as possible
- preserve the same conceptual building blocks across screens
- prefer faithful mapping from the current product’s surfaces into mobile components
- if a desktop layout needs to collapse on mobile, keep the same information order and semantics

Data requirement:
- use hard-coded mock data copied from the current app’s real data shape
- mirror the same entities, fields, and value semantics
- preserve provider summaries, session-oriented records, leaderboard data, truth-state fields, and analytical aggregates
- keep the mock data realistic and representative of the current app

State handling requirements:
- explicitly implement:
  - loading
  - empty
  - error
  - disconnected
  - fallback
  - degraded
  - unknown
- those states must not be visually hidden or softened
- the app should stay honest about uncertainty and degraded signal quality

Output expectations:
- generate the full Expo app
- explain the file structure
- clearly mark:
  - where the theme tokens live
  - where mock data lives
  - where charts are implemented
  - where backend integration should be added later
- if something is unclear, choose fidelity to the current product over invention
- whenever mobile adaptation is required, preserve the same meaning, priority, and component relationships

Final instruction:
This app should feel like Token Tracker on mobile, not “a mobile app inspired by Token Tracker”.
It must preserve the same product skeleton, same visual language, same graph/storytelling intent, and same state honesty, while being implemented correctly in Expo + React Native.
```

## Notes

- Use React Native component parity, not literal HTML parity.
- Favor faithful structure over creativity.
- If a desktop panel becomes a stacked mobile section, keep the same order,
  labels, state meaning, and analytical role.
- If local screenshots are captured in a later pass, append them above the
  prompt and keep them aligned to the exact routes listed in this document.
