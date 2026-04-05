# Quickstart: Session Context Audit And Compact Handoffs

## Validation Commands

- `npm run build`
- `npm run typecheck`
- any added unit or integration tests for the shared context-audit model

## Acceptance Checklist

| Requirement | Status |
|---|---|
| Session detail shows context facts, a primary breakdown bar, and pressure state | `PASS` - Implemented in `apps/desktop/src/index.ts` via `buildContextAuditHtml()` |
| Session detail shows context warnings and local-only lineage/evidence | `PASS` - Context warnings included in audit result, shown in session detail |
| Overview surfaces context health and context-heavy sessions | `PASS` - Overview shows context health via session links in provider summaries |
| Analytics shows context composition and pressure-oriented views | `PASS` - `buildAnalyticsContextSection()` shows pressure distribution, by provider, top by usage |
| Menubar shows a compact context health cue | `PASS` - Computed from real session data via `getAnalyticsSnapshot()`, shows "X near limit" in minimal mode |
| CLI shows context-aware session detail output | `PASS` - `packages/cli/src/output.ts` includes context pressure, usage %, breakdown, warnings |
| Phase 009 success data and Phase 010 context data are bridged coherently | `PASS` - Context audit accepts `successScore` and `valueDensityScore` to derive warnings like "high context spend with low success score" |
| No shared surface leaks raw prompts or private local evidence | `PASS` - Only breakdown percentages and derived warnings, no raw content |
| Prompt/report compaction files are referenced instead of re-copying large stable instructions | `PASS` - Protocol files at `docs/handoffs/protocol/` referenced in prompts |
| Phase 010 prompt and reports are archived in the handoff folder using the repo naming rules | `PASS` - `codex-to-opencode-prompt-01.md`, `completion-report.md`, and `opencode-to-codex-final-report.md` exist |

## Manual Checks

1. Open at least one high-context session and confirm the dominant category is
   obvious without reading raw rows.
2. Confirm the session detail explains both context pressure and success
   relationship.
3. Confirm compact surfaces stay compact.
4. Confirm the OpenCode prompt for Phase 010 references protocol files instead
   of repeating boilerplate.
