# Replit Follow-Up Questions

Last updated: 2026-04-07

## Purpose

Use this file as the next follow-up prompt for Replit after its initial build
report for the web dashboard and mobile app.

The goal is to close the remaining product gaps, confirm architectural
decisions, and force clarity on what is implemented vs what is only present in
the UI.

## Context

Current Replit report summary:

- Web dashboard:
  - 6 pages complete with mock data
  - time filters are presentational only
  - session detail panel is empty
  - missing Asset Volatility and Success Analysis sections that exist on mobile
  - no real API connection
- Mobile app:
  - 3 screens complete
  - includes fuller analytics set than web
  - time filter not wired to data slicing
  - no session detail tap-through
- Cross-app:
  - same logo PNG
  - same mock data shapes, but no shared library
  - no automated tests
  - API server artifact exists, but nothing consumes it

## Follow-Up Prompt

```md
Review the current state of both the web dashboard and the mobile app against
the original Token Tracker parity goals.

Do not give a generic summary.
Answer the following questions explicitly and precisely.

## 1. Product Parity Audit

For each app separately, list:
- what is fully implemented
- what is visually present but not functionally wired
- what is missing compared to the current Token Tracker source app
- what exists in mobile but not web
- what exists in web but not mobile

Then give a parity verdict for:
- Overview
- Analytics
- Team / Leaderboard
- Sessions / session detail behavior
- Admin (web only)
- Settings

Use these labels only:
- `parity`
- `partial parity`
- `visual only`
- `missing`

## 2. Time Filter Reality Check

Explain exactly how the time filter works today in:
- web
- mobile

Answer:
- does it actually slice data, or is it UI-only?
- which components already receive timeframe state?
- which components ignore it?
- what code/files need to change to make it real?
- how much work is required to wire it correctly?

## 3. Session Detail Gap

Explain exactly what is missing for session detail behavior in both apps.

Answer separately for web and mobile:
- is the list view ready?
- is the detail data shape ready?
- is the navigation/sheet/drawer missing?
- is the detail panel blank because of UI, missing bindings, or missing data?
- what is the shortest correct path to complete this?

## 4. Analytics Parity Gap

The mobile app includes Asset Volatility and Success Analysis while web does
not.

Answer:
- why were these omitted from web?
- is the data already present for web?
- are these easy to add using the existing architecture?
- which files/components would need to be added or changed?
- what other analytics sections still differ between mobile and web?

## 5. API Integration Readiness

Assess the current API integration readiness honestly.

Answer:
- what API server artifact currently exists?
- what endpoints or contracts are already available?
- what shape does the frontend currently expect?
- what is missing to connect both apps to the real API?
- is there a shared client or adapter layer yet?
- what is the recommended integration plan for:
  1. web
  2. mobile
  3. shared data contract

## 6. Shared Library Question

Right now both apps use the same mock data shapes but no shared library.

Answer:
- should there be a shared package for:
  - types
  - design tokens
  - chart semantics
  - mock data contracts
  - API client contracts
- if yes, propose the exact package structure
- if no, explain why not

I want a concrete recommendation, not “it depends”.

## 7. Auth And Access Structure

For the web dashboard:
- what auth structure is already present?
- what is real vs placeholder?
- is the app actually protected?
- is single-admin mode implemented or only implied?
- how ready is the structure for future RBAC?

For mobile:
- is auth intentionally omitted for now, or structurally prepared?

## 8. Test Gap

There are no automated tests yet.

Give a prioritized first test plan:
- what should be tested first
- what can wait
- what belongs in unit tests
- what belongs in integration tests
- what belongs in UI/e2e tests

Keep the test plan realistic and staged.

## 9. Recommended Next 5 Tasks

Give the next 5 implementation tasks in priority order.

Each task must include:
- title
- why it matters
- affected app(s)
- estimated complexity: `small`, `medium`, or `large`
- whether it improves:
  - parity
  - architecture
  - usability
  - production readiness

## 10. Hard Truths

End with:
- the 3 biggest risks if we keep the apps as they are
- the 3 most valuable fixes to do next
- whether the apps are currently closer to:
  - prototype
  - MVP
  - production-ready shell

Be direct and specific.
Do not soften the answer.
```

## Why These Questions Matter

This follow-up is designed to force clarity on:

- fake vs real functionality
- parity gaps between mobile and web
- whether the API integration path is actually ready
- whether auth is real or only scaffolded
- whether the codebase is converging or fragmenting

## Suggested Attachment Set

When sending this follow-up to Replit, attach:

- [docs/replit-web-admin-dashboard-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-web-admin-dashboard-prompt.md)
- [docs/replit-web-admin-evaluation-checklist.md](/Users/hanyramadan/token%20traker/docs/replit-web-admin-evaluation-checklist.md)
- [docs/replit-expo-mobile-app-prompt.md](/Users/hanyramadan/token%20traker/docs/replit-expo-mobile-app-prompt.md)
- this file
