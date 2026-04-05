# Quickstart: Success Analysis And Representation

**Last validated**: 2026-04-05  
**Status**: Phase 009 is complete. All acceptance tests pass.

## Required checks

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | Sessions carry completion state, verification state, confidence, and success-signal outputs | ✅ PASS | `packages/core/src/domain/session.ts:10-41`, `analysis/success.ts` |
| 2 | Adapters remain free of product scoring policy | ✅ PASS | `adapters/codex.ts`, `adapters/opencode.ts` return only `CanonicalSessionSeed` |
| 3 | Missing verification evidence lowers confidence and does not imply failure | ✅ PASS | `analysis/success.ts:computeConfidence()` — missing evidence reduces score |
| 4 | Contradiction evidence lowers confidence and success appropriately | ✅ PASS | `analysis/success.ts:computeConfidence()` — contradiction penalty applied |
| 5 | Existing fields (`outcome`, `efficiencyScore`, `wasteScore`) still populate | ✅ PASS | `analysis/heuristics.ts:enrichSession()` — backward-compatible |
| 6 | CLI output includes verification state, confidence, and signal-aware success framing | ✅ PASS | `packages/cli/src/output.ts:formatSessionDetailLines()` |
| 7 | Overview renders outcome-aware success framing, not cost-only framing | ✅ PASS | `apps/desktop/src/index.ts:buildOverviewSuccessCard()` |
| 8 | Analytics renders a success funnel, verification-state breakdown, and at least one rework or value-density view | ✅ PASS | `apps/desktop/src/index.ts:buildAnalyticsSuccessSection()` — includes funnel, score-by-provider, rework-by-provider, value-density-by-provider |
| 9 | Menubar renders a compact success cue without losing glanceability | ✅ PASS | `apps/desktop/src/menubar.ts` — success label + confidence badge |
| 10 | Leaderboard only uses aggregated, privacy-safe success-aware metrics | ✅ PASS | `packages/core/src/leaderboard/types.ts:TTM_PRIVACY_POLICY` |
| 11 | No surface leaks raw git details, raw test traces, or other sensitive local evidence | ✅ PASS | Privacy policy explicitly forbids; ingestion copies only aggregated scores |
| 12 | Docs do not overclaim "verified" or "success truth" where the evidence is only probable | ✅ PASS | `docs/specs/v1-metric-definitions.md` — display rules require confidence |

## Implementation acceptance tests

All 12 tests pass. Source file: `packages/core/src/analysis/success.test.ts`  
Runnable command (after `npm run build`):

```bash
node --test packages/core/dist/analysis/success.test.js
```

| Test | Status |
|---|---|
| Verified success + low rework | ✅ PASS |
| Probable success + missing verification | ✅ PASS |
| Contradicted / revert-like outcome | ✅ PASS |
| Abandoned session | ✅ PASS |
| High-cost low-progress session | ✅ PASS |
| No repo present | ✅ PASS |
| Repo present but no diff | ✅ PASS |
| Repo diff detected | ✅ PASS |
| Verification evidence detected (tests pass) | ✅ PASS |
| Verification evidence detected (tests fail) | ✅ PASS |
| Verification evidence detected (build succeeds) | ✅ PASS |
| Contradictory evidence lowers confidence | ✅ PASS |

## Known limitations (honest)

1. **Level 2 git evidence** is metadata-driven only — it reads `gitDiffLines`, `gitFilesChanged`, and `hasGitChanges` from provider metadata. It does NOT run `git diff` or scan the filesystem. Providers must populate these fields for git evidence to appear.

2. **Level 3 verification evidence** is metadata-driven only — it reads `verificationPassed`, `verificationFailed`, `testResults`, and `buildSucceeded` from provider metadata. It does NOT run tests, builds, or lint commands. Providers must populate these fields for verification evidence to appear.

3. **No E2E tests** exist for the desktop HTML surfaces. The unit tests cover the analysis logic; visual verification of the HTML output requires manual testing.
