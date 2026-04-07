# Feature Specification: Window-Scoped Context Notifications

**Feature Branch**: `012-window-scoped-context-notifications`  
**Created**: 2026-04-06  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: `/Users/hanyramadan/token traker/docs/research/phase-012-window-scoped-context-notifications-research.md`,
current desktop menubar shell in
`/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`,
current menubar rendering in
`/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`,
current context-audit model in
`/Users/hanyramadan/token traker/packages/core/src/domain/context-audit.ts`,
and the existing phase/spec conventions in this repo.

## Goal

Add **window-scoped context notifications** to the menubar and desktop apps so
Token Tracker can continuously show how much context the **currently matched
provider chat window** is using, and escalate with threshold-based alerts at
`75%`, `85%`, and `90%`.

The experience must be scoped to the active provider window and, where possible,
to the specific active chat window inside that provider, so different Codex or
OpenCode windows can surface different context states.

## Scope

- provider-window identity and matching model
- active external window detection and normalization
- continuous context-usage meter for the currently matched active window
- threshold-crossing alerts at `75%`, `85%`, and `90%`
- per-window dedupe and cooldown logic
- menubar/tray and desktop-shell wiring for current active window state
- focus-aware escalation behavior for foreground vs background target windows
- Codex and OpenCode matcher implementation in this phase
- future-safe matcher contract for Claude and Cursor
- docs and handoff artifacts required for OpenCode execution

## Non-Goals

- no speculative provider ingestion expansion
- no attempt to fully solve Cursor or Claude window matching without validated
  local evidence
- no OCR or screenshot-based chat detection
- no cloud notification service
- no noisy repeated OS notifications on every poll tick
- no global provider-wide alert model pretending to be chat-specific
- no promise of full Linux/Wayland foreground-window parity unless validated

## Product Rules

- The primary signal must be **continuous** and **ambient**.
- Native desktop notifications must be **threshold-crossing events**, not a live
  stream.
- The system must be honest about confidence when it cannot confidently map an
  active provider window to a specific session.
- Different provider windows may show different context state at the same time.
- Color semantics must stay stable:
  - green below warning threshold
  - yellow/orange warning at `75%` and `85%`
  - red critical at `90%`
- If the current active window cannot be matched confidently, the UI must fall
  back gracefully instead of fabricating per-chat certainty.

## Why This Phase Exists

Phase 010 added session context audit, but it is retrospective and product-level.

What is still missing is a live, ambient, **window-aware** signal that helps the
user notice context pressure while they are actively working inside Codex,
OpenCode, and future providers.

The user request is more specific than "show context health somewhere":

- keep a continuous indicator visible
- escalate at `75%`, `85%`, and `90%`
- scope notifications to the current provider window
- support multiple windows with distinct states

Phase 012 closes that gap.

## Core User Questions

1. How much context is the chat window I am using right now consuming?
2. Has this specific window crossed a warning threshold?
3. If I switch from one Codex/OpenCode window to another, does the signal follow
   the new active window correctly?
4. If the app cannot map the window confidently, does it say so honestly?
5. Can I trust that alerts are meaningful and not duplicated spam?

## Architecture Decision

### Canonical phase recommendation

Implement a new **window-scoped signal layer** in the desktop shell:

1. **ActiveWindowResolver**
   - determines the current foreground external window
   - normalizes provider/process/title metadata
   - should prefer a Rust-native OS-window path such as `x-win` if OpenCode
     validates it cleanly in this repo
2. **ProviderWindowMatcher**
   - converts foreground window evidence into provider-scoped and, when
     possible, session-scoped identity
3. **ContextNotificationPolicy**
   - computes threshold band, dedupe, cooldown, and delivery behavior
4. **AmbientContextSurface**
   - shows a continuous meter/badge in menubar/tray and desktop surfaces
5. **NotificationDeliveryAdapter**
   - sends native OS notifications or requests window attention when policy says
     escalation is warranted

### Why this path

- it keeps active-window inference separate from alert policy
- it makes provider-specific matching pluggable
- it avoids hard-coding Tauri focus quirks directly into product logic
- it supports future provider additions without rewriting the policy layer

## Required Model Additions

### Window identity

```ts
type ProviderId = 'codex' | 'opencode' | 'claude' | 'cursor';

interface ProviderWindowKey {
  provider: ProviderId;
  externalWindowId: string;
}
```

### Active window evidence

```ts
interface ExternalWindowSnapshot {
  externalWindowId: string;
  title: string | null;
  appName: string | null;
  processId: number | null;
  processPath: string | null;
  bounds: { x: number; y: number; width: number; height: number } | null;
  detectedAt: string;
}
```

### Match result

```ts
interface ActiveContextMatch {
  key: ProviderWindowKey | null;
  providerSessionId: string | null;
  provider: ProviderId | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  reason: string;
}
```

### Window-scoped signal

```ts
type ContextThresholdBand =
  | 'normal'
  | 'warning_75'
  | 'warning_85'
  | 'warning_90'
  | 'unknown';

interface WindowContextSignal {
  key: ProviderWindowKey;
  providerSessionId: string | null;
  contextUsagePercent: number | null;
  thresholdBand: ContextThresholdBand;
  color: 'green' | 'yellow' | 'red' | 'neutral';
  lastCrossedAt: string | null;
  resolutionConfidence: 'high' | 'medium' | 'low' | 'none';
}
```

### Notification state

```ts
interface NotificationCheckpoint {
  key: ProviderWindowKey;
  highestNotifiedBand: 'warning_75' | 'warning_85' | 'warning_90' | null;
  lastNotifiedAt: string | null;
}
```

## Signal Rules

### Continuous signal

- The product must continuously expose current context usage for the active
  matched provider window.
- The continuous signal must update independently of native notifications.
- The continuous signal may be:
  - tray tooltip and tray title derivative
  - menubar hero/meter
  - desktop window banner or header treatment

### Threshold semantics

- below `75%`: green
- `>= 75%` and `< 85%`: `warning_75`
- `>= 85%` and `< 90%`: `warning_85`
- `>= 90%`: `warning_90`
- unknown or unresolved usage: neutral/unknown

### Notification semantics

- alert only when a window crosses into a higher threshold band
- do not repeat the same threshold alert for the same window while it remains in
  the same band
- allow re-alert only after usage falls below that threshold and crosses again
- apply cooldown protection to avoid duplicate notifications caused by polling
  jitter or rapid focus churn
- when the target provider window is foregrounded and confidence is strong,
  prefer in-app/banner emphasis before firing an OS notification
- when the target provider window is backgrounded, OS notification and supported
  attention cues are appropriate

### Confidence rules

- `high`: explicit provider + stable window identity + strong session evidence
- `medium`: explicit provider + likely session mapping
- `low`: provider known but session mapping weak
- `none`: no trustworthy provider-window mapping

When confidence is `low` or `none`:

- do not pretend the alert is definitely chat-specific
- label the state honestly
- prefer ambient fallback over aggressive notification

## Surface Requirements

### Menubar / tray

Required:

- continuous compact meter or band for the **currently matched active window**
- threshold color state in the compact shell
- tooltip or popover copy that names the provider and confidence state
- visible fallback state when no external provider window is matched

Rules:

- keep the tray signal glanceable
- do not dump dense evidence into the tray itself
- if the active matched window changes, the tray/menubar signal must change with
  it

### Desktop popover / desktop app window

Required:

- active-window context card or banner
- provider name, context usage percent, threshold label, confidence label
- last threshold-crossed timestamp when relevant
- unresolved/mismatch fallback state

### Native notification

Required:

- threshold notifications at `75%`, `85%`, and `90%`
- provider-specific copy
- if session identity is known, include chat/session cue without leaking prompt
  text
- if the provider window is not active anymore when the notification fires, the
  notification still points to the provider/window identity it belongs to

Recommended:

- optionally request user attention for Token Tracker's own window when the app
  is open and the policy chooses in-app escalation instead of OS toast
- use platform-specific attention features only as additive cues, not as the
  source of truth for per-window state

## Provider-Matching Requirements

### Codex

Phase 012 must attempt:

- app/process identification for Codex
- title/session heuristics strong enough to distinguish multiple Codex windows
  when local evidence exists

### OpenCode

Phase 012 must attempt:

- app/process identification for OpenCode
- title/session heuristics strong enough to distinguish multiple OpenCode
  windows when local evidence exists

### Claude and Cursor

Phase 012 must define matcher interfaces and stubs, but implementation should
remain future-facing unless OpenCode validates real local evidence during the
phase.

## Engineering Rules

- keep raw active-window detection behind a service boundary
- keep provider matchers pluggable and testable
- keep notification policy pure and deterministic where possible
- avoid `any`
- never store or surface raw prompt/transcript text in notifications
- prefer explicit confidence and fallback states over silent guessing

## Validation Requirements

OpenCode must prove:

1. threshold detection works for `75%`, `85%`, and `90%`
2. repeated polling above the same threshold does not spam notifications
3. switching active windows updates the ambient signal
4. two different windows for the same provider can hold different signal states
5. unresolved or low-confidence mapping produces honest fallback behavior
6. Codex and OpenCode matchers work on real or fixture-backed window evidence

## Mandatory Agents

- `agent-pilot`
- `agent-orchestrator`
- `agent-architect`
- `agent-implementer`
- `agent-reviewer`
- `agent-tester`
- `agent-docs`
- `agent-debugging`

## OpenCode Execution Contract

OpenCode must execute this as an architecture-sensitive desktop-shell phase.

Required execution shape:

1. start with `agent-pilot`
2. use `agent-orchestrator` to decompose workstreams and file ownership
3. use `agent-architect` before implementation for window identity, matcher
   contracts, and notification policy boundaries
4. implement in bounded slices
5. run `agent-reviewer` and `agent-tester` before closure
6. reconcile docs and handoff artifacts with `agent-docs`

## Acceptance Standard

Phase 012 is complete only when:

- Token Tracker continuously shows context usage for the currently matched active
  provider window
- threshold alerts fire at `75%`, `85%`, and `90%`
- alerts are deduped per window and do not spam while usage stays in-band
- active-window switching updates the displayed signal correctly
- Codex and OpenCode are supported as real provider-window matchers
- low-confidence or unresolved matches are represented honestly
- docs and handoff artifacts accurately describe the behavior and current limits
