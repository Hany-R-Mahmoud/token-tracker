# Data Model: Monitoring And Glanceable UX

## Purpose

This phase should prefer extending existing read models over inventing new core
storage tables unless a real gap is proven.

## Candidate Read-Model Additions

### ResetWindowSnapshot

UI-facing shape for reset-related presentation.

Suggested fields:

- `provider`
- `label`
- `windowType`
- `resetsAt`
- `relativeText`
- `confidence`
- `source`
- `notes`

### MonitoringStatusCard

Compact UI-facing aggregate for overview and menu bar surfaces.

Suggested fields:

- `provider`
- `sessionCount`
- `tokenCount`
- `costUsd`
- `statusTone`
- `resetWindow`
- `topModel`
- `windowLabel`

### AnalyticsVisualSeries

Visualization-friendly analytics aggregate derived from existing local data.

Suggested fields:

- `seriesType`
- `label`
- `points`
- `total`
- `windowDays`

### MonitoringPreferences

Minimal local-only preferences shape.

Suggested fields:

- `defaultWindowDays`
- `refreshCadenceSeconds`
- `compactDensity`

## Guardrails

- Prefer derived read-service fields over schema churn.
- Do not add persistence for raw prompt or transcript bodies.
- Do not store speculative provider quota data that cannot be reproduced.
- Keep preferences local-only and narrow in scope.
