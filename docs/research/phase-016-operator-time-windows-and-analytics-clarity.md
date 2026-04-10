# Phase 016 Research: Operator Time Windows And Analytics Clarity

Last updated: 2026-04-09

## Purpose

Ground the next dashboard and menubar phase in confirmed repo behavior, not
just user frustration or visual taste.

The user-reported problems were:

- the menu bar amount always looks cumulative instead of useful for daily spend
- the desktop notification/context-size warning is not visible or discoverable
- timeframe chips do not match the expected `1hr / 1 day / 7 days / 1 month / all`
  behavior
- overview and analytics charts look acceptable but do not help explain what the
  data means
- efficiency and consumption visuals are not decision-helpful enough

This note confirms what is actually happening in the current codebase and what
must change to make the next phase truthful.

## Confirmed Findings

### 1. Menubar and tray spend are currently all-time totals

Evidence:

- `apps/desktop/src/menubar.ts`
  - `buildMenubarHtml()` computes hero spend by summing
    `snapshot.providerSummaries`
- `apps/desktop-tauri/src-tauri/src/lib.rs`
  - `poll_spend_and_update_tray()` calls `/api/summary`
  - tray title is updated by summing `providerSummaries[].totalCostUsd`
- `apps/desktop/src/index.ts`
  - `/api/summary` returns `readService.getSummarySnapshot()`
- `packages/core/src/db/read-service.ts`
  - `getSummarySnapshot()` uses all sessions, not a scoped time window

Implication:

- the current tray/menubar amount is truthful as an all-time total, but it is
  not useful for daily monitoring
- the product does not currently expose an explicit "daily spend" concept to the
  tray or menubar hero
- if the product changes this behavior, it must also label the scope clearly so
  users never confuse `today` with `all time`

### 2. The current timeframe system is both incomplete and internally inconsistent

Evidence:

- `apps/desktop/src/index.ts`
  - `buildOperationalTimeChips()` renders:
    - overview: `[1, 7, 30, 90]`
    - analytics: `[7, 14, 30, 90]`
  - labels are `1H` or `XD`
  - overview `1H` links to `/` with no `days` parameter
  - overview active-state logic treats `activeDays === 30` as active for `1H`
  - `parseUrlPath()` explicitly ignores `days`
  - overview handler never applies a time window to summary cards or session
    list queries
  - analytics handler accepts only `[7, 14, 30, 90]`
  - export accepts only `[7, 14, 30, 90]`
- `packages/core/src/db/read-service.ts`
  - analytics APIs are `getAnalyticsSnapshot(days = 30)`
- `packages/core/src/db/database.ts`
  - windowed queries are day-based only (`date('now', ?)`), not hourly and not
    open-ended/all-time

Implication:

- the current controls do not match the requested product model
- overview and analytics do not share one canonical period system
- `1hr`, `1 day`, `7 days`, `1 month`, and `all` cannot be implemented cleanly
  as a UI-only change; the data layer needs a real time-window abstraction

### 3. The notification system exists, but discoverability is weak and partial

Evidence:

- `apps/desktop/src/index.ts`
  - `/api/notification-check` computes a `DesktopNotificationPayload`
  - `shouldNotify` is only true when the gate resolves to
    `desktop_notification`
  - when the gate resolves to `ambient_only` or `in_app_banner`, there is no
    corresponding visible UI surface in the desktop HTML
- `apps/desktop-tauri/src-tauri/src/lib.rs`
  - `poll_notification_and_deliver()` only shows a native notification when
    `payload.shouldNotify` is true
  - otherwise it only logs when the gate closed for a desktop notification
- `apps/desktop/src/menubar.ts`
  - context cue is shown only in minimal mode, and only when high/critical
    counts exist

Implication:

- the user experience is "notification or nothing"
- suppressed, downgraded, or ambient-only context warnings are not inspectable
- a user can reasonably conclude the feature does not exist, even though the
  pipeline is partially implemented

### 4. Several analytics hero metrics are synthetic placeholders instead of product-truth metrics

Evidence:

- `apps/desktop/src/index.ts`
  - `buildAnalyticsHero()` renders:
    - `Live Performance Index`
    - `TPS`
    - `Network Load`
    - `GB/s`
    - `Error Latency`
  - those values are derived from local formulas over session counts and cost,
    not from real transport or runtime telemetry
- overview sections also use monitoring-flavored wording such as:
  - `Operational`
  - `Throughput`
  - `P99 Latency`
  - `Network Load`
  - `Anomalies`
  - `Cluster Topology`

Implication:

- the visuals are energetic, but some labels overclaim the underlying data
- the next phase should move from "fake observability aesthetics" to
  interpretable AI-usage decision support
- the best next version should keep visual ambition while grounding labels in
  actual product truth: spend, session quality, context pressure, efficiency,
  waste, trend, and comparisons

### 5. Charts emphasize shape more than explanation

Evidence:

- multiple visual builders return decorative SVG or CSS layouts without nearby
  interpretation:
  - `buildTrendMesh()`
  - `buildTopologyGrid()`
  - `buildAnalyticsValueMatrix()`
  - `buildAnalyticsComposition()`
- some hover information exists only through `title=""` attributes
  (`heatmap-cell`, matrix points), which is weak for accessibility and weak for
  at-a-glance understanding
- `buildTrendMesh()` and `buildStepChartSvg()` mark charts `aria-hidden="true"`

Implication:

- the current charts are readable mainly to the person who built them
- users need:
  - visible legend and axis intent
  - comparison framing
  - explicit "why this matters" summaries
  - keyboard/screen-reader-available equivalents
  - hover or focus details that expose actual values and period context

### 6. Efficiency and consumption are present, but not yet decision-oriented

Evidence:

- efficiency appears in provider rows, hero badges, and tables
- success and value-density data exist in the model/provider summaries
- current composition across overview and analytics still leans on:
  - bars
  - table dumps
  - decorative system-monitor framing

Implication:

- the product already has the right raw signals for "efficiency vs spend",
  "waste vs value", and "what changed this period"
- the missing layer is comparative storytelling, not raw data collection

## Product Conclusions

### Conclusion 1: Time-window truth needs to become a shared product contract

The product should define one canonical period model used by:

- overview
- analytics
- export
- menubar
- tray title / tooltip
- any notification summaries tied to period expectations

### Conclusion 2: Menubar should become a scoped operator glance, not an all-time total by default

The next phase should decide and label:

- primary tray metric: `today spend` or `current period spend`
- secondary context: all-time total available in tooltip, popover, or details
- reset semantics: local-day reset for spend scope, not quota-reset confusion

### Conclusion 3: Context notifications need a visible degradation path

The product should surface:

- delivered desktop notifications
- downgraded ambient/in-app notifications
- last threshold crossing / last warning state
- why a warning was suppressed or downgraded

### Conclusion 4: Visual ambition should stay, but fake telemetry language should go

The Phase 009 revisit was directionally right about visual ambition. The next
step should keep the premium/high-signal feel while replacing placeholder
observability metaphors with truthful AI-usage language.

### Conclusion 5: Every major chart should answer one clear question

Examples:

- What changed in spend and efficiency across the selected period?
- Which providers cost more than the value they return?
- Where is context pressure clustering?
- Which sessions were expensive and ineffective?
- How does today compare to the prior period?

## Recommended Phase Shape

One integrated phase is appropriate if it is split into explicit workstreams:

1. shared period/window contract
2. menubar + tray spend scope redesign
3. notification visibility and inspectability
4. overview clarity pass
5. analytics chart and explanation pass
6. handoff/reporting contract for implementation

This should not be framed as "just polish". The current issues combine product
truth, data semantics, and interaction clarity.
