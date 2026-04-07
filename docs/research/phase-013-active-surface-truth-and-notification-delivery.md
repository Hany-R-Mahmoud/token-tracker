# Phase 013 Research: Active-Surface Truth And Notification Delivery

**Created**: 2026-04-06  
**Purpose**: define a better architecture than the current Phase 012 fallback
for active-window-aware context signaling and low-noise notification delivery.

## Why A Second Research Run Was Needed

Phase 012 established the right product intent but the current implementation
shape still conflates three very different things:

1. **latest session** in local analytics
2. **active external provider window**
3. **active chat/session inside that window**

Those are not interchangeable.

The latest session fallback is useful as a safety net, but it is not honest to
present it as active-window truth. The follow-on phase therefore needs to focus
on **active-surface truth**, not just another round of UI polish.

## Current Repo Reality

What already exists:

- shared session context auditing in
  `/Users/hanyramadan/token traker/packages/core/src/domain/context-audit.ts`
- threshold policy and matcher scaffolding in the new Phase 012 domain files
- a menubar surface that can now render a window-context chip

What still does not exist:

- real foreground external window detection
- real open-window registry for inactive provider windows
- browser-tab truth for browser-hosted providers
- truth-tiered fallback semantics
- native notification delivery with platform-aware gating

## Second-Pass Research Questions

1. What is a more truthful active-window architecture than "latest session"?
2. How do similar OSS systems separate active app/window truth from browser URL
   truth?
3. What platform caveats must be built into the design from the start?
4. How should alerts be delivered so they stay useful and non-spammy?

## Findings

### 1. `x-win` is more useful than a single active-window probe because it supports both active and open windows

Source:

- [x-win docs.rs source/API](https://docs.rs/x-win/latest/src/x_win/lib.rs.html)

What matters:

- `get_active_window()` returns the current foreground window
- `get_open_windows()` returns all currently open windows
- `get_browser_url(window_info)` can recover browser URL where supported
- Linux Wayland/GNOME support may require an extension install/enable flow
- macOS permission helpers are feature-gated

Implementation implication:

- do not design around only one `get_active_window()` loop
- maintain a **window registry** from periodic open-window snapshots plus an
  **active-window event stream** from active-window polling
- use URL recovery as a separate enrichment lane rather than bundling it into
  the base matcher

### 2. ActivityWatch’s architecture is a better reference than a single matcher function

Sources:

- [ActivityWatch aw-watcher-window](https://github.com/ActivityWatch/aw-watcher-window)
- [ActivityWatch aw-watcher-web](https://github.com/ActivityWatch/aw-watcher-web)
- [ActivityWatch thesis notes on window and URL classification](https://erik.bjareholt.com/thesis/thesis.pdf)

What matters:

- ActivityWatch uses separate watchers for:
  - active window/title
  - browser web activity / URL truth
- their classification pipeline combines window titles and URLs instead of
  pretending one signal source is always enough
- the thesis explicitly describes labeling based on regular expressions over
  titles and URLs
- the macOS watcher notes that accessibility is needed for window titles

Implementation implication:

- Token Tracker should adopt a **watcher stack**:
  - native active-window watcher
  - native open-window watcher
  - optional browser URL watcher/enrichment layer
  - provider-local recency correlation layer
- this is better than forcing one `findMatchingProvider(snapshot)` function to
  carry every responsibility

### 3. `get-windows` confirms the value and limits of browser URL enrichment

Source:

- [sindresorhus/get-windows](https://github.com/sindresorhus/get-windows)

What matters:

- exposes active and open windows, process owner, bounds, and URL where
  available
- browser URL support is platform-limited
- Wayland is explicitly unsupported

Implementation implication:

- browser URL truth should be modeled as **optional enrichment**, not a required
  dependency
- Linux/Wayland should explicitly degrade instead of pretending parity

### 4. Browser extension plus native messaging is the truthful long-term path for browser-hosted providers

Sources:

- [Chrome tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Chrome native messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)
- [MDN tabs API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs)
- [MDN native messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)
- [MDN native manifests](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests)

What matters:

- browser extensions can identify the actual active tab/document more truthfully
  than title parsing
- native messaging provides a stable desktop bridge
- host registration and installer work are part of this design, especially on
  Windows

Implementation implication:

- browser-hosted providers should not be forced through more title heuristics
- Phase 013 should define an optional browser-truth lane that can send:
  - browser
  - profile
  - window id
  - tab id
  - URL
  - title
- this should remain opt-in and capability-gated

### 5. Tauri notification delivery is viable, but must be gated by platform reality

Source:

- [Tauri Notifications plugin](https://v2.tauri.app/plugin/notification/)

What matters:

- Tauri supports desktop notifications
- on Windows, notifications only work for installed apps
- cross-platform APIs are intentionally narrower than each OS’s full native
  notification stack
- the plugin also exposes notification lifecycle commands for active/pending
  notification management

Implementation implication:

- delivery policy must distinguish between:
  - **ambient cues** that always work inside the app
  - **desktop notifications** that depend on packaging/platform capability
- in development or unsupported delivery conditions, the app should degrade to
  tray/banner attention instead of claiming a desktop notification fired
- if delivery/runtime supports it, stale notifications for the same
  `ProviderWindowKey` should be replaced or removed instead of stacking
  indefinitely

### 6. Tauri-owned focus is useful, but it does not solve external provider truth

Sources:

- [Tauri window API](https://v2.tauri.app/reference/javascript/api/namespacewindow/)
- [Tauri issue #6472](https://github.com/tauri-apps/tauri/issues/6472)

What matters:

- Tauri focus APIs are for app-owned windows
- they are still useful for deciding whether Token Tracker itself is foregrounded
- they do not replace an OS-window watcher for Codex/OpenCode/Cursor/etc.

Implementation implication:

- split focus into:
  - `token_tracker_focus`
  - `external_active_surface`
- notification decisions should use both

### 7. macOS and Linux permission/capability constraints are first-class product behavior, not just technical details

Sources:

- [x-win docs.rs source/API](https://docs.rs/x-win/latest/src/x_win/lib.rs.html)
- [ActivityWatch aw-watcher-window](https://github.com/ActivityWatch/aw-watcher-window)

What matters:

- macOS title/browser metadata may require Accessibility and/or Screen Recording
  style permissions depending on the mechanism used
- Linux GNOME/Wayland may require extension installation to recover working
  window data

Implementation implication:

- capability detection must be surfaced in-product
- "unknown" and "degraded" need to be first-class states

## Better Architecture

### Recommendation A: Replace single-shot matching with a layered truth pipeline

Recommended pipeline:

1. **ActiveWindowWatcher**
   - samples foreground external window at short cadence
2. **OpenWindowRegistry**
   - periodically snapshots open windows and maintains known provider windows
3. **BrowserContextEnricher**
   - optionally recovers active tab URL or browser-domain truth when supported
   - may use native URL recovery or browser extension/native messaging depending
     on platform and provider
4. **ProviderActivityCorrelator**
   - matches the active/open window data against recent provider-local session
     activity from Token Tracker’s own store
5. **ActiveSurfaceResolver**
   - emits a final resolution with a truth tier and reason string

This is stronger than relying on the latest imported session or on title
heuristics alone.

### Recommendation B: Introduce explicit truth tiers

Recommended truth tiers:

- `tier_0_none`
  - no usable external-window truth
- `tier_1_latest_session`
  - local analytics fallback only, never presented as active-window truth
- `tier_2_provider_window`
  - active provider app/window known, session unknown
- `tier_3_provider_window_plus_candidate_session`
  - likely session candidate from recency/title evidence
- `tier_4_provider_window_plus_browser_or_explicit_session_truth`
  - strongest correlation available

Product rule:

- only tiers `2+` may claim active-window semantics
- only tiers `3+` should be eligible for chat-specific threshold notifications

### Recommendation C: Maintain a window-state registry, not just a current signal

Recommended runtime model:

```ts
interface WindowRegistryEntry {
  key: ProviderWindowKey;
  title: string | null;
  appName: string | null;
  processPath: string | null;
  lastSeenAt: string;
  isCurrentlyOpen: boolean;
  latestResolutionTier:
    | 'tier_0_none'
    | 'tier_1_latest_session'
    | 'tier_2_provider_window'
    | 'tier_3_provider_window_plus_candidate_session'
    | 'tier_4_provider_window_plus_browser_or_explicit_session_truth';
  latestContextUsagePercent: number | null;
  latestThresholdBand: ContextThresholdBand;
  highestNotifiedBand: 'warning_75' | 'warning_85' | 'warning_90' | null;
}
```

Why:

- lets Token Tracker preserve distinct state for multiple provider windows
- makes window switching instant and truthful
- allows stale-window cleanup and dedupe without global confusion

### Recommendation D: Separate delivery gating from threshold logic

Threshold logic decides **whether a band changed**.

Delivery gating decides **how to surface it** based on:

- resolution tier
- whether Token Tracker is focused
- whether the target provider window is active
- whether desktop notification capability is available on this platform/build
- cooldown state

Recommended behavior:

- `75%`
  - ambient cue always
  - desktop notification only at higher truth tiers and when backgrounded
- `85%`
  - ambient cue + standard notification if supported and backgrounded
- `90%`
  - ambient cue + strongest supported standard delivery
  - still avoid fake "critical OS feature" usage unless implemented natively

### Recommendation E: Move from raw polling UI updates to change events plus spans

ActivityWatch’s watcher model suggests a better pattern:

- sample often enough to detect changes
- emit state only when the active window meaningfully changes
- merge repeated identical samples into spans

Recommended result:

```ts
interface ActiveSurfaceSpan {
  key: ProviderWindowKey | null;
  startedAt: string;
  endedAt: string | null;
  resolutionTier: string;
  reason: string;
}
```

Why:

- reduces noisy recomputation
- gives debugging evidence for why the app believed a window was active
- makes later analytics and bug reports far easier

## Recommendations For Token Tracker

### 1. Stop calling aggregate fallback "active window"

If the system is showing latest-session fallback, the copy must say something
like:

- "Latest session context"
- "No active provider window detected"
- "Active-window matching unavailable on this platform"

It should never imply the current window was actually resolved.

### 2. Build Codex/OpenCode on native window truth first, browser truth second

Codex and OpenCode should first ship with:

- native app/process detection
- open-window registry
- session candidate correlation via titles, recency, and local session IDs

Browser URL enrichment should be optional and layered in later for browser-based
providers or browser-hosted variants.

### 2a. Add an optional browser-truth lane instead of multiplying title heuristics

For browser-hosted providers, Phase 013 should define a contract such as:

```ts
interface BrowserActivitySnapshot {
  browser: string;
  profile: string | null;
  windowId: string;
  tabId: string;
  url: string | null;
  title: string | null;
  detectedAt: string;
}
```

This gives Token Tracker a clean future path for browser truth without making it
mandatory for Codex/OpenCode native app flows.

### 3. Add a capability matrix and expose it in-product

Recommended capabilities:

- `active_window_detection`
- `open_window_registry`
- `browser_url_enrichment`
- `desktop_notifications`
- `attention_request`

Each capability should be:

- `available`
- `degraded`
- `unavailable`

### 4. Gate notifications by truth tier

Recommended rule:

- tier 0 or 1:
  - no chat-specific desktop notification
- tier 2:
  - provider-scoped ambient cue only
- tier 3 or 4:
  - eligible for threshold-crossing notification

This prevents the product from notifying against weak or fabricated targets.

### 5. Persist per-window checkpoints and spans locally

Do not make threshold state global.

Persist:

- per-window highest notified band
- last notified at
- last seen resolution tier
- recent active-surface spans

This enables honest multi-window behavior and debuggable reconciliation.

## Risks

- x-win integration may surface additional permission or packaging caveats
- macOS title/URL truth may be incomplete without permissions
- Linux Wayland behavior may remain degraded even with extension help
- browser URL enrichment adds a second capability lane that must remain optional
- Windows desktop notifications still depend on installed-app behavior

## Best Follow-On Phase Shape

This should be a **new follow-on phase**, not a retroactive edit to Phase 012.

Why:

- the remaining work is not just "finish the wiring"
- it introduces new infrastructure:
  - active/open window watchers
  - truth tiers
  - capability matrix
  - delivery gating
  - debugging spans

That is phase-sized work with its own architecture, tests, and rollout rules.

## Recommended Follow-On Phase Name

**Phase 013: Active-Surface Truth And Notification Delivery**

That name is more honest than calling it "Phase 012 completion", because it
adds the system that Phase 012 wanted but did not fully implement.
