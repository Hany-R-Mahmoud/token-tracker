# Feature Specification: Active-Surface Truth And Notification Delivery

**Feature Branch**: `013-active-surface-truth-and-notification-delivery`  
**Created**: 2026-04-06  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: `/Users/hanyramadan/token traker/docs/research/phase-013-active-surface-truth-and-notification-delivery.md`,
the existing Phase 012 spec and code, current Tauri shell in
`/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`,
desktop server wiring in
`/Users/hanyramadan/token traker/apps/desktop/src/index.ts`,
and menubar rendering in
`/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`.

## Goal

Replace the current "latest session fallback" approximation with a **truthful
active-surface system** that:

- detects the current external provider window when capability allows
- maintains separate state for multiple provider windows
- distinguishes active-window truth from aggregate/latest-session fallback
- gates desktop notifications by truth tier and platform capability
- delivers context warnings at `75%`, `85%`, and `90%` without mislabeling the
  target or spamming the user

## Why This Phase Exists

Phase 012 got the threshold vocabulary, state shapes, and initial menubar
rendering in place, but its current runtime fallback still uses aggregate/latest
session data rather than true active-window resolution.

That is not a small bug. It is a different system boundary.

Phase 013 exists to build the missing active-surface and delivery
infrastructure honestly.

## Scope

- native active-window watcher for external provider windows
- open-window registry for provider windows that remain open but unfocused
- truth-tiered active-surface resolver
- optional browser URL enrichment lane where supported
- optional browser extension/native-messaging lane for browser-hosted providers
- provider-local activity correlation against Token Tracker session data
- capability matrix for platform/runtime support
- per-window registry state, spans, and notification checkpoints
- platform-aware notification delivery gating
- truthful fallback copy and UI states
- validation and docs for Codex and OpenCode first

## Non-Goals

- no speculative claim of full Cursor or Claude active-window support
- no OCR or screenshot inference
- no mandatory browser extension dependency for the whole phase
- no attempt to force browser-hosted providers through title heuristics alone
- no fake active-window semantics when only latest-session fallback is known
- no platform parity promises beyond validated capability

## Product Rules

- The product must never present latest-session fallback as active-window truth.
- Different open provider windows must retain distinct local state.
- Chat-specific notifications require stronger truth than provider-global
  summary state.
- Threshold semantics stay:
  - `<75%` green
  - `75–84.9%` warning 75
  - `85–89.9%` warning 85
  - `>=90%` warning 90
- Desktop notification delivery must be capability-aware and gated.
- Degraded and unavailable states are first-class product states, not hidden
  implementation details.

## Core User Questions

1. Is Token Tracker showing the context for the actual provider window I am
   using right now?
2. If not, does it clearly tell me that it is showing fallback/latest-session
   information instead?
3. Can it track multiple provider windows separately?
4. Will it notify only when it has enough truth to target a real window/chat?
5. Can I inspect why the app believed a certain window was active?

## Architecture Decision

### Canonical system shape

Implement five layers:

1. **ActiveWindowWatcher**
   - polls foreground external window at short cadence
2. **OpenWindowRegistry**
   - periodically snapshots open windows and maintains known provider windows
3. **BrowserContextEnricher**
   - optionally adds browser URL/domain truth when supported
   - may use native URL recovery or an opt-in extension/native-messaging lane
4. **ProviderActivityCorrelator**
   - maps window evidence to provider-local sessions and candidate chats
5. **ActiveSurfaceResolver**
   - emits final resolution tier, target identity, and reason string

Then layer:

6. **NotificationDeliveryGate**
   - decides whether a threshold transition becomes:
     - ambient-only
     - in-app/banner emphasis
     - desktop notification

### Why this shape

- separates OS capability from product truth
- supports inactive open windows, not just the current one
- creates a path for browser-based providers later
- supports honest degradation on macOS permission gaps and Linux/Wayland

## Required Model Additions

### Capability matrix

```ts
type CapabilityState = 'available' | 'degraded' | 'unavailable';

interface ActiveSurfaceCapabilities {
  activeWindowDetection: CapabilityState;
  openWindowRegistry: CapabilityState;
  browserUrlEnrichment: CapabilityState;
  browserNativeMessaging: CapabilityState;
  desktopNotifications: CapabilityState;
  attentionRequest: CapabilityState;
}
```

### Resolution tier

```ts
type ResolutionTier =
  | 'tier_0_none'
  | 'tier_1_latest_session'
  | 'tier_2_provider_window'
  | 'tier_3_provider_window_plus_candidate_session'
  | 'tier_4_provider_window_plus_browser_or_explicit_session_truth';
```

### Window registry entry

```ts
interface WindowRegistryEntry {
  key: ProviderWindowKey;
  title: string | null;
  appName: string | null;
  processPath: string | null;
  lastSeenAt: string;
  isCurrentlyOpen: boolean;
  resolutionTier: ResolutionTier;
  providerSessionId: string | null;
  contextUsagePercent: number | null;
  thresholdBand: ContextThresholdBand;
  highestNotifiedBand: 'warning_75' | 'warning_85' | 'warning_90' | null;
}
```

### Active surface span

```ts
interface ActiveSurfaceSpan {
  key: ProviderWindowKey | null;
  startedAt: string;
  endedAt: string | null;
  resolutionTier: ResolutionTier;
  reason: string;
}
```

### Final resolution

```ts
interface ActiveSurfaceResolution {
  key: ProviderWindowKey | null;
  provider: ProviderId | null;
  providerSessionId: string | null;
  resolutionTier: ResolutionTier;
  confidence: 'high' | 'medium' | 'low' | 'none';
  reason: string;
  source:
    | 'native_active_window'
    | 'open_window_registry'
    | 'browser_url'
    | 'provider_activity_correlation'
    | 'latest_session_fallback'
    | 'none';
}
```

## Truth Rules

### Tier semantics

- `tier_0_none`
  - no trustworthy target
- `tier_1_latest_session`
  - latest session fallback only
  - may be shown as fallback summary, never as active-window truth
- `tier_2_provider_window`
  - provider app/window known
  - session/chat still unknown
- `tier_3_provider_window_plus_candidate_session`
  - probable chat/session target
- `tier_4_provider_window_plus_browser_or_explicit_session_truth`
  - strongest available mapping

### UI rules by tier

- tiers 0 and 1:
  - show explicit degraded/fallback wording
- tier 2:
  - allow provider-scoped active-window cue
  - do not claim exact chat unless clearly labeled as unresolved
- tiers 3 and 4:
  - allow chat-aware labels and threshold-targeted alerting

## Watcher Requirements

### Active window watcher

Required:

- short cadence sampling for current foreground external window
- normalization into shared `ExternalWindowSnapshot`
- debounce to avoid rapid churn noise

### Open window registry

Required:

- periodic full snapshot of open windows where supported
- registry cleanup for stale/closed windows
- support for inactive-but-still-open provider windows

### Browser context enricher

Required:

- interface and capability state in this phase
- implementation only where OpenCode can validate it safely

Allowed:

- using native URL recovery where available
- defining an opt-in browser extension/native-messaging contract even if the
  full extension is not shipped in this phase
- postponing richer browser truth for unsupported platforms

## Provider Correlation Requirements

### Codex and OpenCode

Required:

- native app/process detection
- title/session heuristics
- recency correlation against local session activity
- multi-window distinction in the registry

### Claude and Cursor

Required:

- participate in the shared capability and matcher architecture
- remain explicitly partial or unavailable unless validated with real local
  evidence during the phase

## Notification Delivery Rules

### Delivery gating

Desktop notifications may fire only when:

- threshold band crossed upward
- target window has a real `ProviderWindowKey`
- resolution tier is high enough for the intended notification specificity
- platform capability says desktop notifications are available
- cooldown and dedupe rules allow delivery
- stale notifications for the same target can be replaced/removed when runtime
  support is available

### Suggested policy

- `75%`
  - ambient cue always
  - desktop notification only for strong truth tiers and backgrounded targets
- `85%`
  - ambient cue plus standard desktop notification when supported
- `90%`
  - ambient cue plus strongest supported standard delivery

### Explicit restriction

- latest-session fallback must not trigger a chat-specific desktop notification

## Surface Requirements

### Menubar / tray

Required:

- show active-window signal only when tier `2+`
- show explicit fallback text for tier `1`
- show explicit unavailable/degraded state for tier `0`
- preserve per-window state internally even though only one active target is
  foregrounded at a time

### Desktop app surface

Required:

- active-surface card showing:
  - provider
  - context usage
  - threshold band
  - resolution tier
  - reason/source
- capability status card or diagnostics row
- active-surface history/spans for debugging if feasible

## Platform Rules

### macOS

- handle permission-dependent title/URL truth honestly
- do not silently degrade into fake precision

### Windows

- treat desktop notifications as supported only when packaging/runtime allows it
- if not available, degrade to ambient/in-app cues
- treat browser native messaging as installer-sensitive because host
  registration is part of the platform contract

### Linux / Wayland

- explicitly support degraded mode
- if extension or compositor support is missing, do not pretend true
  active-window parity

## Validation Requirements

OpenCode must prove:

1. latest-session fallback is no longer mislabeled as active-window truth
2. active-window resolution tiers behave as documented
3. multiple open provider windows retain distinct registry state
4. Codex and OpenCode correlation works on real or fixture-backed data
5. threshold notifications are suppressed for weak/fallback truth tiers
6. platform capability states are surfaced honestly

## Mandatory Agents

- `agent-pilot`
- `agent-orchestrator`
- `agent-architect`
- `agent-implementer`
- `agent-reviewer`
- `agent-tester`
- `agent-docs`
- `agent-debugging`

## Acceptance Standard

Phase 013 is complete only when:

- active-window truth is backed by a real watcher/resolver path
- latest-session fallback is clearly labeled as fallback
- Codex and OpenCode can retain distinct multi-window state
- notification delivery is gated by truth tier and capability
- menubar and desktop surfaces reflect truthful active-surface semantics
- docs describe supported, degraded, and unavailable states accurately
