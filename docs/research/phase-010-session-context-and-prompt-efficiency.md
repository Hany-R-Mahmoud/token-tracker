# Phase 010 Research: Session Context Audit And Prompt Efficiency

**Created**: 2026-04-05  
**Purpose**: research cornerstone for Phase 010. This file defines what we are
trying to borrow from OpenCode's session context review UI, what similar
open-source products already do well, and how Token Tracker should translate
those ideas without breaking the local-first/operator-focused product shape.

## Product Question

How should Token Tracker inspect and explain **session-level context
consumption**, so users can see:

- what consumed context and tokens
- how the session was composed
- whether the context mix looks healthy or wasteful
- where the user should act next

This phase is not "just more charts." It is about making heavy sessions
explainable.

## The Screenshot: What It Actually Shows

Source image reviewed:

- `/Users/hanyramadan/Desktop/Screenshot 2026-04-05 at 3.53.58 PM.png`

The screenshot is a session review surface from OpenCode. It is effective
because it answers three questions in a single compact flow:

1. **What session is this?**
   - provider
   - model
   - creation time
   - last activity
2. **How much context did it consume?**
   - context limit
   - total tokens
   - input/output/reasoning tokens
   - cache tokens
   - message counts
   - cost
3. **What made up that context?**
   - a visually dominant context breakdown bar
   - percentages for user, assistant, tool calls, and other
   - a raw message list for traceability

## Why The Screenshot Works

### 1. It is session-first, not dashboard-first

The page is not trying to summarize the whole product. It is helping the user
investigate one expensive or suspicious session in detail.

### 2. The main graph is simple, but high-signal

The "Context Breakdown" chart is only a stacked horizontal bar, but it is
effective because:

- it is immediately legible
- it compares composition, not just totals
- it makes tool-call dominance obvious
- it supports explanation without requiring a full analytics dashboard

### 3. It pairs aggregate and raw evidence

The bar answers "what dominated?" while the raw message list answers "what
exactly happened?" This combination is important for trust.

### 4. The visual hierarchy is disciplined

- metadata in two clean columns
- one primary visual
- one evidence table
- dark background with strong contrast
- low ornament, high density

## What We Can Borrow From OpenCode

OpenCode sources reviewed:

- repo: [anomalyco/opencode](https://github.com/anomalyco/opencode)
- likely implementation seam:
  - [session context usage component](https://github.com/anomalyco/opencode/blob/dev/packages/app/src/components/session-context-usage.tsx)
  - [session review page](https://github.com/anomalyco/opencode/blob/dev/packages/app/src/pages/session.tsx)
  - [status popover body](https://github.com/anomalyco/opencode/blob/dev/packages/app/src/components/status-popover-body.tsx)
  - [debug bar](https://github.com/anomalyco/opencode/blob/dev/packages/app/src/components/debug-bar.tsx)

Key reusable ideas:

- a **compact session context usage cue** that can live in a denser surface and
  open a deeper review view
- **session review tabs** instead of trying to overload the overview screen
- **stacked composition bars** for context makeup
- **raw event/message lineage** as an optional evidence panel
- **dense metadata cards** for session facts instead of oversized hero blocks

## What We Should Not Copy From OpenCode

- do not build a terminal-first developer debug clone
- do not make raw message IDs the primary product story
- do not let the session audit become visually disconnected from our existing
  overview / analytics / menubar system
- do not ship a context screen that ignores the Phase 009 success model

Token Tracker should adapt the pattern into a **context audit lens** rather than
an OpenCode-shaped review UI.

## Similar Open-Source / Open Resource Products

### OpenCode

- repo: [anomalyco/opencode](https://github.com/anomalyco/opencode)
- strongest relevance: session-level context inspection and raw-message review

Why it matters:

- closest match to the screenshot and user intent
- shows how context composition can be made operator-readable
- strongest reference for a "single session deep dive" surface

### Langfuse

- overview docs: [Langfuse Overview](https://langfuse.com/docs)
- product positioning: [Langfuse Pricing / Feature Matrix](https://langfuse.com/pricing)

Relevant product ideas:

- traces, sessions, timelines, users, and agent graphs are treated as distinct
  but connected views
- sessions are first-class for multi-turn and multi-step workflows
- observability is tied to evaluation, not just cost and latency

Useful takeaways for Token Tracker:

- session audit should connect to success analysis
- context inspection should not live alone; it should connect to quality /
  evaluation framing
- cost visibility is useful, but only when paired with trace understanding

### Helicone

- repo: [Helicone/helicone](https://github.com/Helicone/helicone)
- sessions docs: [Helicone Sessions](https://docs.helicone.ai/features/sessions)

Relevant product ideas:

- explicit session IDs
- hierarchical session paths
- multi-step workflow grouping
- tool-call and step lineage inside a session tree

Useful takeaways for Token Tracker:

- a session is often a path, not a flat blob
- we should support parent/child or step grouping when data allows it
- context audit becomes more useful when steps are grouped by purpose

### OpenLIT

- repo: [openlit/openlit](https://github.com/openlit/openlit)

Relevant product ideas:

- OpenTelemetry-native traces and metrics
- cost tracking and exception monitoring
- visualize and optimize after collection, not only at ingestion time

Useful takeaways for Token Tracker:

- context-heavy sessions should expose exceptions or retry/error pressure when
  available
- context audit should be able to connect cost to execution pressure

### Arize Phoenix

- repo: [Arize-ai/phoenix](https://github.com/Arize-ai/phoenix)
- docs: [Phoenix Overview](https://arize.com/docs/phoenix)

Relevant product ideas:

- tracing plus evaluation as one workflow
- agent/runtime observability with step visibility
- open-source troubleshooting posture

Useful takeaways for Token Tracker:

- context audit should not be disconnected from evaluation and outcome
- session detail can become the bridge between cost and success truth

## Community Signals And Cautions

### Observability tools are useful, but can become expensive or noisy

Community threads repeatedly warn that trace tooling can become a cost sink if
it captures too much background activity:

- [PSA: Check your Langfuse traces](https://www.reddit.com/r/LocalLLaMA/comments/1rs2r2u/psa_check_your_langfuse_traces_their_sdk/)
- [Thoughts on Langfuse?](https://www.reddit.com/r/LocalLLaMA/comments/1i2ycgi/thoughts_on_langfuse/)
- [agent observability – what tools work?](https://www.reddit.com/r/LLMDevs/comments/1qwfrpx/agent_observability_what_tools_work/)

Implication for Token Tracker:

- we should be explicit about what we count
- we should separate session content from background/system noise
- we should show "other / overhead / tool-call" composition honestly
- we should avoid auto-collecting or persisting more raw detail than needed

### Trace grouping matters

The Helicone session path model is a strong signal that workflows are often
hierarchical rather than flat. For coding agents and review sessions, this maps
well to:

- request
- repair
- verification
- follow-up

Implication for Token Tracker:

- when we cannot reconstruct a full hierarchy, we should still derive meaningful
  sub-buckets such as user, assistant, tool, verification, cache, and other

## Phase 010 Product Thesis

Token Tracker Phase 010 should add a new layer:

**Session Context Audit**

It should explain why a session became expensive or context-heavy, not just how
many tokens it used.

The right core questions are:

1. How close did this session get to its context ceiling?
2. What categories consumed the budget?
3. Did that composition look healthy, tool-heavy, retry-heavy, or noisy?
4. Was the spend aligned with useful progress from Phase 009?
5. What should the user do next?

## Proposed Metric And Visualization Stems

### Session-level facts

- context limit
- total tokens
- input/output/reasoning/cache tokens
- total cost
- last activity
- message counts
- session duration

### Composition metrics

- user token share
- assistant token share
- tool-call token share
- system/other token share
- cache-read / cache-write ratio
- verification token share when detectable

### Pressure / risk metrics

- context usage percent
- near-limit badge
- tool-call dominance badge
- retry/repair density
- message inflation
- overhead ratio

### Outcome bridge metrics

- success score from Phase 009
- verification state
- value density
- rework score
- "high spend + low value" warning

## Representation Guidance By Surface

### Session Detail

This is the main destination for Phase 010.

Required elements:

- facts panel
- primary stacked context breakdown bar
- sub-breakdown cards
- session pressure badges
- raw message/event list
- Phase 009 success bridge card

### Overview

Do not replicate the full detail screen.

Use:

- top context-heavy sessions
- near-limit sessions count
- tool-heavy session count
- context waste / pressure summary

### Analytics

Use:

- context composition by provider
- context usage distribution
- top sessions by context pressure
- cost vs context pressure
- success vs context pressure

### Menubar

Use only compact cues:

- near-limit count
- one context health chip
- optionally one worst-session badge

### CLI

Add:

- context breakdown lines in session detail output
- pressure warning lines
- no giant tables by default

## Design Direction

The screenshot is dark and dense, but Phase 010 should not lock us into that
exact look.

Design requirements:

- support light and dark mode
- preserve existing app structure
- avoid terminal-copy aesthetics unless that surface already uses them
- use one strong primary composition visual instead of many weak charts
- keep dense session detail readable on laptop widths

## Prompt Efficiency And Handoff Lessons

This project now has a repeated prompt inflation problem:

- long repeated execution rules
- long repeated reporting templates
- stale prompt copies drifting out of sync

Phase 010 should explicitly address that by promoting stable rules into shared
files and making prompts reference those files instead of repeating them.

### Stable content that should be file-backed

- baseline execution contract
- baseline reporting contract
- prompt compaction rules
- handoff archive naming rules

### Prompt content that should remain inline

- phase-specific mission
- current blockers
- current acceptance criteria
- current read-first file list

## Recommended Phase 010 Scope

Phase 010 should have two linked streams:

1. **Session Context Audit**
   - deep session inspection surface
   - context composition metrics
   - pressure cues
   - Phase 009 success bridge
2. **Compact Handoff Protocol**
   - reusable prompt baseline files
   - reusable reporting baseline files
   - explicit rule that future prompts should reference these files instead of
     re-sending repeated boilerplate

## Final Recommendation

Implement Phase 010 before the full Phase 008 visual refresh.

Reason:

- Phase 010 changes which analytics and detail surfaces deserve visual emphasis
- the visual system should reflect success and context health together
- designing first, then adding context audit later, would likely cause rework

Phase 010 should therefore define the **information architecture** that Phase
008 will later polish.
