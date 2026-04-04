# Feature Specification: Rich Menubar Insights And Command Center

**Feature Branch**: `007-rich-menubar-insights-and-command-center`  
**Created**: 2026-04-04  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Current menubar implementation in `apps/desktop/src/index.ts` and `apps/desktop-tauri/src-tauri/src/lib.rs`, internal benchmark notes in `docs/reference-products.md`, and public product surface from `https://github.com/soulduse/ai-token-monitor`.

## Goal

Replace the current shallow menubar experience with a rich, native-feeling
command center that makes Token Tracker useful even before the user opens the
full dashboard.

The current implementation is functionally present but strategically too thin:

- the tray/menu bar shell exposes only `Open Dashboard` and `Quit`
- the menubar popover is mostly a compact status list plus one dashboard link
- the closed-state menu bar surface does not expose total spend beside the icon
- the popover shows consumption, but not enough about outcome, effectiveness,
  or what the consumption produced

Phase 007 should close that gap without copying AI Token Monitor blindly. The
result must fit Token Tracker's own strengths:

- local-first data
- honest metric semantics
- stronger outcome/efficiency framing
- existing Overview, Analytics, and Team Leaderboard surfaces

## Scope

- closed-state tray/menu bar presentation
- open-state menubar popover redesign
- richer menubar information architecture and quick navigation
- compact visuals for cost, efficiency, outcome, provider mix, and trend
- team / leaderboard preview states where data exists
- native shell behavior needed to support a richer popover
- copy and docs updates needed to keep the product honest

## Non-Goals

- no new provider expansion in this phase
- no new team-auth architecture unless strictly needed for safe deep-linking
- no raw prompt, transcript, or session-content exposure in the menubar
- no speculative quota claims for providers without validated source data
- no full dashboard rewrite disguised as a menubar task

## Product Direction

The menubar should behave like a real product surface, not a launcher.

When closed:

- the menu bar item should show the app icon plus a compact total consumption
  display, preferably the active period cost in currency form
- if dynamic text beside the icon is constrained by platform/runtime behavior,
  OpenCode must implement the strongest verified fallback and document the exact
  limitation honestly

When opened:

- the popover should open a dense but readable dropdown surface
- the top of the surface should communicate both spend and effectiveness
- the surface should answer:
  - how much was consumed
  - which providers/models drove it
  - whether the spend appears efficient or wasteful
  - what the recent outcomes look like
  - whether team/leaderboard context changes the interpretation
  - where to go next for deeper inspection

## Requirements

- The tray/menu bar closed state must show total spend beside the icon, or a
  documented native fallback that is visually equivalent enough to preserve
  glanceability.
- The popover must no longer rely on a single `Open Dashboard` CTA as its main
  value proposition.
- The popover must expose direct navigation affordances for:
  - Overview
  - Analytics
  - Team / Leaderboard surface
  - Settings or preferences when relevant
- The popover must include visual treatment for consumption, not just text rows.
- The popover must include at least one visual that communicates effectiveness
  or outcome quality, not just raw usage.
- The popover must distinguish clearly between:
  - cost / token volume
  - efficiency / waste / outcome interpretation
  - quota-backed reset information
  - heuristic-only signals
- The menubar must surface the most important total even when collapsed:
  default to total cost for the active period.
- The popover must support both no-data and partial-data states without feeling
  broken or empty.
- Team / leaderboard content in the menubar must be aggregated, privacy-safe,
  and auth-aware.
- The resulting UX must feel closer to the information density of AI Token
  Monitor while preserving Token Tracker's stronger analysis framing.

## Menubar Information Architecture

OpenCode should implement a rich popover organized around these sections:

1. **Hero summary**
   - total cost for active period
   - total sessions and/or total tokens
   - a compact trend or delta cue
   - a clear effectiveness summary such as efficient / mixed / waste-heavy

2. **Consumption visuals**
   - compact spend chart, sparkline, stacked bars, or mini distribution
   - provider contribution view
   - model or period signal if it fits without clutter

3. **Effectiveness block**
   - outcome distribution
   - efficiency/waste summary
   - short "what this spend produced" framing
   - honest fallback when outcome confidence is weak

4. **Provider status block**
   - per-provider health
   - reset countdowns only where validated
   - heuristic labeling where quota truth is unavailable

5. **Recent notable activity**
   - recent sessions or recent highlights
   - emphasize what matters, not just chronology

6. **Team / leaderboard preview**
   - current standing, preview, or signed-out state
   - aggregated and privacy-safe only

7. **Quick actions**
   - open dashboard
   - open analytics
   - open leaderboard/team surface
   - refresh/reload if it genuinely improves the flow

## UX And Design Guardrails

- Prefer a rich dropdown layout over a plain list of rows.
- Use compact visuals intentionally; do not turn the popover into a tiny
  dashboard screenshot.
- The first screenful should answer both "how much did I spend?" and "was it
  worth it?"
- Outcome and efficiency language should be readable and supportive, not
  judgmental.
- Navigation should feel native and fast.
- Density should increase meaningfully without collapsing readability.
- If tabs or segmented controls are introduced, they must reduce clutter rather
  than hide key signals.
- If minimal mode remains, it should still preserve the new closed-state spend
  signal and at least one effectiveness cue.

## Technical Guardrails

- Reuse the shared local SQLite-backed read models instead of creating a new
  parallel data path for the menubar.
- Avoid introducing a frontend framework rewrite just for this phase unless the
  current server-rendered approach becomes a verified blocker.
- Keep native shell changes bounded to what is required for:
  - dynamic menu bar title / label
  - richer popover behavior
  - window focus / blur / close polish
  - deep-linking into existing surfaces
- Any new data transformation added for the menubar must remain honest about
  confidence and source truth.

## Privacy And Trust Guardrails

- Do not show raw prompts, transcripts, file paths, or private session content.
- Do not imply quota truth for OpenCode or any unsupported provider.
- Team / leaderboard preview must only use aggregated, already-approved fields.
- If auth state is missing, the menubar must show a clean signed-out or
  unavailable state instead of a broken card.

## OpenCode Execution Contract

This spec is intended to be executed by OpenCode and must not be treated as a
single-agent coding pass.

OpenCode should use the team of agents according to the task slice:

1. `agent-orchestrator` first, to confirm scope, file ownership, and execution
   order before edits
2. `agent-impeccable` for menubar IA, density, visual hierarchy, and compact
   chart treatment
3. `agent-implementer` for the owned code changes across desktop HTML/CSS and
   Tauri tray/native shell
4. `agent-debugging` for tray title limitations, popover focus/blur behavior,
   sizing, and native-shell issues
5. `agent-security` if team / leaderboard preview touches auth state, cookies,
   external links, or new data exposure decisions
6. `agent-tester` for evidence that the closed-state label, popover UX, and
   deep links work on real local data
7. `agent-reviewer` for correctness, regressions, copy honesty, and platform
   edge cases
8. `agent-docs` last, to reconcile README, roadmap, and menubar product
   descriptions

OpenCode should keep ownership disjoint where possible:

- desktop HTML/CSS/data shaping
- Tauri tray/native shell behavior
- docs reconciliation
- verification / review evidence

## Acceptable Completion

- the closed-state menu bar shows meaningful spend at a glance
- the open-state menubar acts like a rich command center rather than a launcher
- users can inspect cost, effectiveness, provider health, and team context from
  the menubar without immediately opening the dashboard
- the result remains honest about heuristic vs quota-backed data
- docs describe the new menubar accurately

## Recommended File Targets

OpenCode should inspect and likely touch:

- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/styles.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/helpers.ts`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/README.md`
- any nearby docs that still describe `/menubar` as a compact summary with only
  an `Open Dashboard`-centric flow
