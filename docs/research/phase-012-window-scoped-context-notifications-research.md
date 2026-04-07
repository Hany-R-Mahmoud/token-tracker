# Phase 012 Research: Window-Scoped Context Notifications

**Created**: 2026-04-06  
**Purpose**: ground Phase 012 architecture in current open-source and official
desktop-app patterns for threshold notifications, tray/menubar signaling, and
active-window-to-context wiring.

## Repo Reality First

Current local state in Token Tracker:

- `packages/core/src/domain/context-audit.ts` already derives
  `contextUsagePercent` and `contextPressureState`
- `apps/desktop/src/menubar.ts` already renders compact context cues, but only
  as aggregate summary state
- `apps/desktop-tauri/src-tauri/src/lib.rs` owns tray shell behavior, window
  creation, focus, and tray polling
- current architecture has no concept of:
  - provider app window identity
  - active external window resolution
  - per-chat or per-window notification state
  - threshold crossing dedupe / cooldown

That means Phase 012 should extend the desktop/Tauri shell and add a new
window-scoped state layer. It should not try to squeeze this into the current
aggregate summary model.

## Research Questions

1. How do comparable desktop apps deliver attention without spamming users?
2. How do tray/menubar apps keep a persistent ambient signal visible?
3. How do desktop apps bind actions or notifications to the currently focused
   window?
4. What is the safest implementation path for a Tauri-based app?

## Source Findings

### 1. Tauri supports native notifications, but they are best used as sparse threshold events

Source:

- [Tauri Notifications plugin](https://v2.tauri.app/plugin/notification/)

What matters:

- Tauri v2 provides a native notification plugin with permission handling
- notifications support actions and foreground behavior
- notifications are meant for discrete events, not high-frequency continuous UI
- docs explicitly position them as OS-level notifications for installed apps

Implication for Token Tracker:

- use native notifications only for threshold transitions such as `75%`, `85%`,
  and `90%`
- do not fire a new desktop notification on every polling tick while a session
  remains above threshold
- pair native notifications with a persistent in-app meter/badge that can update
  continuously

### 2. Tauri window APIs support focus-aware behavior and explicit attention requests

Sources:

- [Tauri window API](https://v2.tauri.app/reference/javascript/api/namespacewindow/)
- [Tauri issue #6472: focused window API request](https://github.com/tauri-apps/tauri/issues/6472)
- [Tauri issue #9755: focused event bug on Windows](https://github.com/tauri-apps/tauri/issues/9755)
- [Tauri issue/PR #12014 closing the Windows focus-event gap](https://github.com/tauri-apps/tauri/issues/12014)

What matters:

- Tauri windows are label-addressable and event-driven
- the API includes window attention semantics via `UserAttentionType`
- Tauri explicitly had to add focused-window support comparable to Electron's
  `BrowserWindow.getFocusedWindow()`
- focus events on Windows had known issues and fixes across 2024-2025

Implication for Token Tracker:

- use Tauri focus events for Token Tracker's own windows
- keep the active-window resolver isolated behind a service boundary because
  focus handling has platform quirks
- avoid baking business logic directly into raw focus events; normalize into a
  debounced `ActiveSurfaceState`

### 3. Electron's mature model confirms the right separation: focused-window routing plus sparse notifications

Sources:

- [Electron Notifications tutorial](https://electronjs.org/docs/latest/tutorial/notifications)
- [Electron BrowserWindow API](https://electronjs.org/docs/latest/api/browser-window)

What matters:

- Electron treats desktop notifications as a separate concern from window state
- `BrowserWindow` exposes `focus`, `blur`, `getFocusedWindow`, and related
  attention APIs
- the mature pattern is: track focus centrally, then decide whether to raise a
  notification or update only in-window state

Implication for Token Tracker:

- keep notification policy separate from window resolution
- define:
  - `ActiveWindowResolver`
  - `ContextNotificationPolicy`
  - `NotificationDeliveryAdapter`

### 4. Cross-platform active-window detection exists, but must be treated as best-effort infrastructure

Sources:

- [x-win](https://docs.rs/crate/x-win/latest)
- [sindresorhus/get-windows](https://github.com/sindresorhus/get-windows)
- [dimusic/active-win-pos-rs](https://github.com/dimusic/active-win-pos-rs)

What matters:

- `x-win` exposes active window and open window metadata with richer process and
  window details, making it a stronger Rust-native fit for a Tauri shell
- `get-windows` provides active window and open window metadata including title,
  owner, bounds, process path, and sometimes URL
- `active-win-pos-rs` provides active window title, process id, process path,
  app name, and bounds in Rust
- both sources call out platform limitations, especially Linux/Wayland and macOS
  permissions

Implication for Token Tracker:

- for Tauri-native implementation, `x-win` is the strongest first candidate
  because the desktop shell is already Rust-backed and provider matching likely
  needs richer process/window metadata than title alone
- `active-win-pos-rs` remains a good fallback if OpenCode wants lower-complexity
  active-window detection with a smaller surface area
- matching should use a provider-specific matcher pipeline:
  - app/process identity
  - window title heuristics
  - optional URL/browser-tab metadata when available
- active-window detection must be best-effort and confidence-scored, not treated
  as guaranteed truth

### 5. Menubar/tray apps keep a persistent ambient signal separate from deeper detail

Sources:

- [AI Token Monitor](https://github.com/soulduse/ai-token-monitor)
- [CodexBar](https://github.com/steipete/CodexBar)
- [max-mapper/menubar](https://github.com/max-mapper/menubar)
- [jondot/tauri-tray-app](https://github.com/jondot/tauri-tray-app)

What matters:

- AI Token Monitor keeps tray cost visible continuously and hides the window when
  focus is lost
- CodexBar keeps session and weekly meters as first-class ambient signals in the
  menu bar, with incident/status overlays and refresh cadences
- `menubar` and tray-app templates reinforce the common shell pattern:
  tray state is persistent, popover state is richer, and blur/focus handling is
  central to UX quality

Implication for Token Tracker:

- Phase 012 should add a persistent ambient context meter in the tray/menubar
  shell
- the popover or dashboard can show richer per-window context state
- threshold alerts should feel like escalations on top of the meter, not the
  meter itself

## Recommended Architecture

### Recommendation A: Treat context alerts as window-scoped state, not provider-scoped state

Reason:

- one provider can have multiple chat windows
- a provider-wide alert becomes misleading once multiple sessions are open
- the user explicitly wants Codex window A and Codex window B to be able to show
  different states

Recommended identity:

```ts
interface ProviderWindowKey {
  provider: 'codex' | 'opencode' | 'claude' | 'cursor';
  externalWindowId: string;
}
```

Recommended derived state:

```ts
interface WindowContextSignal {
  key: ProviderWindowKey;
  providerSessionId: string | null;
  contextUsagePercent: number | null;
  thresholdState: 'normal' | 'warning_75' | 'warning_85' | 'warning_90' | 'unknown';
  color: 'green' | 'yellow' | 'red' | 'neutral';
  lastCrossedAt: string | null;
  resolutionConfidence: 'high' | 'medium' | 'low' | 'none';
}
```

### Recommendation B: Use a layered attention model

Layer 1: Continuous ambient signal

- tray/menubar badge, ring, or label updates continuously
- current active matched window is the primary thing shown

Layer 2: In-app contextual banner

- if the matched provider window is frontmost and Token Tracker is open, show an
  inline warning state instead of a new OS toast

Layer 3: Native OS notification

- only on threshold crossing
- rate-limited and deduped per `ProviderWindowKey`

This is better than firing repeated desktop notifications while the context
remains above threshold.

### Recommendation C: Resolve active context through confidence-based matching

Resolver order:

1. explicit provider app/process match
2. provider window title match
3. provider-local session identifier evidence when available
4. last-seen active session fallback for that provider

If confidence is weak:

- keep showing aggregate provider-level ambient state if helpful
- do not claim a chat-specific notification target
- mark the state as unresolved rather than guessing

## Notification Policy Recommendation

Recommended threshold behavior:

- `< 75%`: green ambient state, no alert
- `75% to < 85%`: yellow warning state, first caution-level alert on crossing
- `85% to < 90%`: stronger yellow-to-orange escalation, second alert on crossing
- `>= 90%`: red critical state, final alert on crossing

Recommended dedupe rules:

- emit at most one alert per threshold band per `ProviderWindowKey` until usage
  falls below that threshold and crosses it again
- add cooldown protection so polling jitter does not create duplicate alerts
- keep alert history local and ephemeral or short-lived

## Risks

- exact per-chat mapping may be weak for some providers until we validate their
  window-title/session-id patterns
- Linux and Wayland behavior may lag behind macOS and Windows
- raw active-window polling can be noisy without debounce and confidence gates
- using OS notifications for the active foreground chat can annoy users faster
  than it helps

## Research-Based Phase 012 Shape

Phase 012 should include:

1. a provider-window identity and matching layer
2. a normalized active-surface resolver
3. a continuous ambient context meter in tray/menubar and desktop surfaces
4. focus-aware escalation rules:
   - active window: in-app/banner emphasis first
   - background window: native notification and attention cues as needed
5. threshold-crossing notification delivery
6. provider-specific matcher contracts for Codex and OpenCode first
7. future-safe extension hooks for Claude and Cursor

Phase 012 should not include:

- broad provider ingestion work
- speculative OCR or accessibility scraping
- remote notification infrastructure
- a global provider-only alert model pretending to be window-specific
- full-parity Linux/Wayland promises without verified support

## Recommended Starting Order

1. define contracts and confidence model
2. implement active-window resolution service with mocked provider matchers
3. wire persistent meter and threshold state into the desktop shell
4. add native notification delivery with dedupe/cooldown
5. harden Codex and OpenCode matchers with fixtures and manual validation
6. leave Claude and Cursor as pluggable future matchers unless local evidence is
   validated during the phase
