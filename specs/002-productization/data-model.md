# Data Model: Productization And Source Parity

## New/Extended Entities

## ProviderSourceStrategy

- `provider`: string
- `kind`: `local_logs` | `local_db` | `browser_cookies` | `provider_api` | `hybrid`
- `status`: `validated` | `experimental` | `unavailable`
- `machineNotes`: string[]
- `evidencePath`: string | null

Purpose:

- records how a provider is sourced on the current machine
- separates "provider unsupported" from "provider strategy not yet validated"

## ComparisonSnapshot

- `id`: string
- `createdAt`: ISO timestamp
- `referenceApp`: `codexbar` | `ai-token-monitor` | `tokscale`
- `provider`: string
- `ourReading`: JSON object
- `referenceReading`: JSON object
- `status`: `match` | `near_match` | `mismatch` | `inconclusive`
- `notes`: string[]

Purpose:

- captures repeatable evidence when validating product output against reference
  tools

## AnalyticsSeries

- `dimension`: `provider` | `model` | `day` | `hour`
- `label`: string
- `sessionCount`: number
- `tokenTotal`: number
- `costTotalUsd`: number
- `averageEfficiency`: number | null

Purpose:

- powers trend and breakdown views without persisting raw transcript bodies

## ExportBundle

- `createdAt`: ISO timestamp
- `databasePath`: string
- `providerSummaries`: summary records
- `recentSessions`: bounded session records
- `analyticsSeries`: aggregate records
- `comparisonSnapshots`: optional comparison records

Purpose:

- enables local export for audits, personal review, and spreadsheet workflows

## Notes

- existing `CanonicalSession` remains the core source of truth
- this feature extends read models and comparison/export artifacts rather than
  replacing the canonical session schema
