# Data Model: Local-First MVP Completion

## CanonicalSession

Represents a normalized AI session independent of provider.

Key attributes:
- provider
- providerSessionId
- projectPath
- model / modelFamily
- token usage
- cost usage
- outcome and confidence
- task category and confidence
- efficiency / waste / anomaly signals
- explanation factors

## ProviderCheckpoint

Tracks incremental import position for each provider source.

Key attributes:
- provider
- sourceId
- cursorType
- cursorValue
- updatedAt

## ProviderHealth

Represents the current availability state for each provider.

Key attributes:
- provider
- status
- sourcesFound
- issues
- lastSuccessfulImportAt

## DesktopOverviewSnapshot

Derived read model for the desktop shell.

Key attributes:
- total stored sessions
- provider summaries
- recent session list
- selected session detail
