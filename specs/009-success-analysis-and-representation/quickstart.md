# Quickstart: Phase 009 Revisit — Visual Analytics, Dashboard Redesign, And Brand System

**Last revised**: 2026-04-07
**Status**: Spec reset complete, implementation not started

## Read First

- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/spec.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/plan.md`
- `/Users/hanyramadan/token traker/specs/009-success-analysis-and-representation/tasks.md`
- `/Users/hanyramadan/token traker/specs/008-visual-system-and-brand-refresh/spec.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/styles.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/docs/reference-products.md`

## Current Reality

The repo already contains:

- success analysis
- context audit
- active-surface truth
- notification gating
- menubar intelligence

But the visual expression is still mostly:

- stat cards
- simple bars
- tables
- generic palette and typography

This phase exists to fix that mismatch.

## Validation Commands For Spec Maintenance

- `npm run build`
- `npm run typecheck`
- manual review of Overview, Analytics, Menubar, and icon surfaces

## Acceptance Checklist

| Requirement | Current State | Target |
|---|---|---|
| Overview feels like a monitoring cockpit instead of a plain report | `PARTIAL` | hero, KPI deck, comparison panels, and next-step cues |
| Analytics supports richer comparison and story flow | `PARTIAL` | trend, composition, value, pressure, and narrative sections |
| Existing truth layers are represented visually, not just textually | `PARTIAL` | success, context, active-surface, and fallback states are visually integrated |
| Numbers include trend or comparison context | `PARTIAL` | KPI cards use deltas, sparklines, or rank context |
| Chart vocabulary is modern and repeatable | `PARTIAL` | small set of consistent charts across screens |
| Menubar feels visually aligned with dashboard | `PARTIAL` | shared tokens, icon language, and micro-visuals |
| Product has a defined logo and app/tray icon direction | `FAIL` | logo, app icon, tray icon, and favicon direction chosen |
| Product has a coherent palette and typography system | `FAIL` | named token system for both themes |
| Stitch/Gemini prompts are ready for design generation | `PASS` | `stitch-prompts.md` and `gemini-prompts.md` now exist in the Phase 009 spec folder |
| Phase 009 docs match the actual redesign objective | `PASS` | spec kit rewritten around the revisit |

## Manual Checks Before Implementation

1. Open Overview and identify whether the first screen answers “what changed” in under five seconds.
2. Open Analytics and identify whether it supports easy provider/model/time comparison without reading tables first.
3. Check whether fallback or degraded states are visually distinguishable from strong-truth states.
4. Check whether the product can be recognized by brand, icon, or palette alone. Today the answer is no.

## What We Need From Stitch Or Gemini

1. A design-system board:
   - palette
   - typography
   - card grammar
   - chart colors
   - state treatments
2. Overview concepts:
   - at least 2 different directions
3. Analytics concepts:
   - chart-rich and comparison-first
4. Menubar alignment concepts:
   - compact but branded
5. Logo and icon exploration board

## Honest Limitation

This quickstart now reflects planning truth, not fake implementation completion.
The analytical data exists. The visual redesign still needs to be designed,
selected, and implemented.
