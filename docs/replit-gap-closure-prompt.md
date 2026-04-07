# Replit Gap Closure Prompt

Last updated: 2026-04-07

## Purpose

Use this prompt for the next Replit pass after the status report.

The goal is not to rebuild the apps.
The goal is to close the most important functional, parity, and architectural
gaps in the current web and mobile outputs.

## Assessment Summary

Based on the report in
[token-tracker-status-report.md](/Users/hanyramadan/Downloads/token-tracker-status-report.md),
the current state is best described as:

- strong visual/product shell
- partial functional parity
- mock-driven MVP shell
- not yet a trustworthy production-ready build

### What is already good

- the web dashboard exists and covers all major surface areas
- the mobile app exists and already has a stronger analytics set in some areas
- both apps share the same brand identity
- mock data is isolated rather than embedded directly into UI
- both apps are typed and appear structurally clean

### Biggest current gaps

1. Time filters are mostly presentational only
2. Session detail behavior is incomplete on both apps
3. Web analytics still trails mobile on Asset Volatility and Success Analysis
4. Web health/state semantics are weaker than mobile
5. Real API integration is absent
6. Shared contracts between apps are duplicated rather than centralized
7. Auth exists structurally on web, but appears mocked rather than real
8. No automated tests exist yet

## Recommended Priority

The highest-value next pass should focus on:

1. wiring the time filters
2. completing session detail flows
3. closing the analytics parity gap on web
4. normalizing health/state semantics across web and mobile
5. introducing a shared contract layer
6. preparing both apps to consume the API server cleanly

## Prompt

```md
You have already built the Token Tracker web dashboard and mobile app.

Do not restart from scratch.
Do not redesign the product.
Do not replace the current structure with a new template.

Your task now is to enhance the current implementation and close the most
important functional and parity gaps.

The current apps already have a strong shell.
What is missing now is correctness, parity, shared architecture, and wiring.

Work from the current implementation and improve it directly.

## Main Objective

Turn the current web and mobile builds from a mostly mock-driven product shell
into a significantly more complete and internally consistent MVP.

## Highest Priority Tasks

### 1. Wire Time Filters For Real

Both apps already expose time filter controls, but they are mostly
presentational.

Implement real data slicing based on selected period.

Requirements:
- selected period must affect KPIs
- selected period must affect charts
- selected period must affect tables/lists where appropriate
- selected period must affect summary distributions
- selected period must affect both Overview and Analytics where relevant
- preserve URL/share state on web
- preserve screen state cleanly on mobile

Do not fake this by only changing labels.

### 2. Complete Session Detail Flows

Web:
- fill the session detail side panel with real detail content from the existing
  mock/session data model
- include meaningful fields such as:
  - session id
  - timestamp
  - provider
  - model
  - token counts
  - cost
  - latency
  - success / outcome state
  - surface truth
  - context health
  - any explanation or factor breakdown already supported by the data shape

Mobile:
- add tap-through session detail behavior from the Overview session feed
- use a bottom sheet, modal, or detail screen that matches the mobile design
- preserve the same information hierarchy as web where appropriate

### 3. Close Web Analytics Parity Gaps

Web is missing analytics sections that mobile already includes.

Add to web:
- Asset Volatility
- Success Analysis

Requirements:
- these must match the same product language already used in mobile
- preserve the web dashboard visual system
- do not add them as generic foreign-looking widgets
- integrate them naturally into the Analytics page structure

### 4. Normalize Health / State Semantics Across Apps

Right now mobile has a richer state system than web.

Extend web so it supports the same broader semantic state vocabulary where
appropriate:
- healthy
- mixed
- warning
- critical
- fallback
- degraded
- unknown
- unresolved
- loading
- empty
- disconnected
- error

Requirements:
- implement these in the theme/token layer
- use them consistently in chips, dots, banners, and empty/error states
- preserve honesty around degraded and uncertain states

### 5. Introduce A Shared Contract Layer

Right now both apps use similar mock data shapes but no shared library.

Create a shared package or shared module layer for:
- core types
- shared health/state enums
- shared mock-data contracts
- shared metric structures
- shared API response contracts

Do not over-engineer this, but stop duplicating the source of truth.

### 6. Prepare Real API Consumption

The API server artifact exists, but neither app consumes it yet.

Implement a clean API integration foundation:
- create a shared API client contract layer
- create adapters so both apps can consume live data later
- keep mock data fallback for local development
- structure data loading so replacing mocks with API calls is straightforward

You do not need to fully implement production backend logic if the server is
still stubbed, but the frontend architecture must stop assuming hardcoded data
forever.

### 7. Strengthen Auth Structure On Web

Web already has mocked auth/role structure.

Improve it so the architecture is credible:
- protected routes should remain
- single-admin mode is acceptable for now
- auth/session boundaries should be explicit
- role structure should remain future-ready for RBAC
- settings/admin should behave as protected areas

If true backend auth is still unavailable, make the structure realistic and
clearly separable from mock mode.

### 8. Add A First Test Layer

There are currently no tests.

Add a realistic first layer of tests.

Focus on high-value coverage:
- utility logic for period slicing
- shared contract/type-level assumptions where testable
- key component/state rendering for:
  - state chips
  - composition bars
  - filter-driven data changes
  - protected route behavior on web

Do not try to build a huge test suite in one pass.
Start with meaningful coverage.

## Constraints

- preserve the current Token Tracker design system
- preserve the current cross-surface harmony
- do not replace the visual system
- do not switch stacks
- do not remove working sections
- do not simplify the product into a generic dashboard
- do not introduce fake functionality and present it as real

## Implementation Expectations

- work from the current codebase, not a new scaffold
- keep feature-based structure where possible
- preserve clean TypeScript
- no any types
- no inline hardcoded mock constants inside screen components
- prefer shared abstractions only where they reduce duplication meaningfully

## Deliverables

After implementing the improvements, provide:

1. A concise list of completed changes
2. A clear list of anything still mocked vs now functionally wired
3. A file/folder summary for:
   - shared contracts
   - filter logic
   - session detail logic
   - new analytics sections
   - API client/adapters
   - tests
4. A short parity update:
   - what is now equal between web and mobile
   - what still differs

## Final Instruction

Treat this pass as a gap-closure and architecture-hardening pass.

Do not chase new features before fixing the current integrity gaps.
The correct outcome is a more trustworthy, more consistent, and more
implementation-ready Token Tracker across both apps.
```

## Suggested Attachments

- [docs/replit-web-admin-dashboard-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-web-admin-dashboard-prompt.md)
- [docs/replit-expo-mobile-app-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-expo-mobile-app-prompt.md)
- [docs/replit-web-admin-evaluation-checklist.md](/Users/hanyramadan/token%20traker/docs/replit-web-admin-evaluation-checklist.md)
- [docs/replit-followup-questions.md](/Users/hanyramadan/token%20traker/docs/replit-followup-questions.md)
- this file
