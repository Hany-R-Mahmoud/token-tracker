# Feature Specification: Operator Time Windows And Analytics Clarity

**Feature Branch**: `016-operator-time-windows-and-analytics-clarity`  
**Created**: 2026-04-09  
**Status**: Draft  
**Primary Execution Owners**: `agent-orchestrator` for framing, `agent-impeccable` for UI/product translation, `agent-implementer` for code changes, `agent-reviewer` and `agent-tester` for closure, OpenCode for execution  
**Input**:
- `/Users/hanyramadan/token traker/docs/research/phase-016-operator-time-windows-and-analytics-clarity.md`
- `/Users/hanyramadan/token traker/docs/research/phase-009-visual-analytics-revisit.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-UI-AUDIT-2026-04-08.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/menubar.ts`
- `/Users/hanyramadan/token traker/apps/desktop/src/styles.ts`
- `/Users/hanyramadan/token traker/apps/desktop-tauri/src-tauri/src/lib.rs`
- `/Users/hanyramadan/token traker/packages/core/src/db/read-service.ts`
- `/Users/hanyramadan/token traker/packages/core/src/db/database.ts`

## Goal

Make Token Tracker's desktop overview, analytics, tray, and menubar behave like
a truthful operator console:

- period controls must work and mean what they say
- menubar spend must support daily monitoring instead of only lifetime totals
- context-size warnings must be visible and inspectable, not hidden behind an
  OS-notification-only path
- charts must explain themselves and help the user decide what matters next
- efficiency and consumption visuals must become comparative and interpretable

## Why This Phase Exists

The current product has enough raw data, but not enough product truth in how it
is framed.

Recent testing exposed five distinct failures:

1. tray and menubar spend read as all-time totals when the user needs daily
   consumption awareness
2. context warnings exist in code but are not discoverable in the app
3. timeframe controls do not match the expected periods and are not wired
   coherently
4. charts are visually acceptable but not educational or decision-helpful
5. efficiency and spend visuals are present without a strong "what changed /
   what is good / what is wasteful" reading model

This is not a cosmetic phase. It is a product-semantics and operator-UX phase.

## Problem Statement

Today the product fails a basic trust test:

- the user clicks a period control and cannot tell whether it changed anything
- the tray amount is always cumulative even though day-level monitoring is the
  real need
- desktop warning logic exists, but the user cannot find evidence of it inside
  the product
- overview and analytics use several synthetic labels and decorative charts that
  look active but do not clearly explain value, waste, or direction

The next version must feel more helpful without becoming less honest.

## Scope

- canonical time-window contract for desktop overview, analytics, export, and
  menubar/tray summaries
- support for `1hr`, `1 day`, `7 days`, `1 month`, and `all`
- daily-spend or selected-period spend for tray and menubar primary glance
- explicit scope labeling so totals are never ambiguous
- visible notification state for context threshold warnings
- hover/focus/help text and explanatory summaries for key charts
- redesign of overview and analytics information hierarchy where needed to make
  efficiency, spend, waste, and trend comparisons clear
- accessible chart interpretation and non-hover-only information delivery
- execution/handoff/reporting expectations for the implementation phase

## Non-Goals

- no new provider ingestion work
- no mobile app work
- no speculative telemetry sources that do not exist in the local data model
- no decorative redesign that hides uncertainty or invents fake metrics
- no silent change of active-surface truth semantics introduced in earlier
  phases

## Product Rules

- Period controls must be shared, truthful, and visibly active.
- `1hr`, `1 day`, `7 days`, `1 month`, and `all` must map to real query
  behavior, not aliases or styling-only states.
- Primary tray and menubar spend must be scoped to the user's operational
  question, not just historical accumulation.
- If all-time totals remain available, they must be labeled as all-time.
- No chart may depend on hover alone to communicate its main message.
- Visual ambition is allowed, but labels must stay grounded in actual product
  data.
- If a notification is suppressed, downgraded, or only shown ambiently, the app
  must expose enough state that the user can understand what happened.

## Core User Questions

1. How much did I spend today?
2. How does that compare with the last day, week, month, or all time?
3. Which providers and sessions were efficient versus wasteful?
4. What changed in the selected period?
5. Did Token Tracker detect a context warning, and if so where can I see it?
6. What does this chart actually mean, and what should I do with it?

## Architecture Decisions

### 1. Introduce a canonical desktop period model

Replace ad hoc `days` handling with a shared period abstraction used across:

- overview
- analytics
- export
- menubar
- tray title / tooltip

Recommended shape:

```ts
type DesktopPeriodId = '1h' | '1d' | '7d' | '1m' | 'all';

interface DesktopPeriod {
  id: DesktopPeriodId;
  label: string;
  kind: 'relative_hours' | 'relative_days' | 'all_time';
  amount: number | null;
}
```

This phase should decide whether the transport/query param is:

- `period=1h`
- `period=1d`
- `period=7d`
- `period=1m`
- `period=all`

Do not keep using mismatched `days` logic if it prevents hourly or all-time
truth.

### 2. Move period filtering into the read-service / database contract

Current analytics queries are day-based only. The phase should add a real window
query layer that can support:

- rolling hour
- rolling day
- rolling 7 days
- rolling month
- all-time

This can be implemented either as:

- a new shared query abstraction in `packages/core/src/db/*`
- or explicit period-aware methods replacing the current numeric-day API

But it must not remain a UI-only facade.

### 3. Separate operator-glance metrics from historical totals

The tray and menubar need a primary metric that helps the user monitor the
current period.

Recommended rule:

- primary tray title = selected-glance spend, defaulting to `today`
- tray tooltip / menubar secondary copy can also show all-time total
- the menubar hero must label the scope directly, for example:
  - `Today spend`
  - `7-day spend`
  - `All-time spend`

### 4. Create a visible notification-state lane

Desktop notifications should remain sparse, but the app needs an inspectable
record of context warning state.

Minimum product behavior:

- surface current threshold state in the menubar and/or overview
- show last threshold crossing and delivery result
- show whether the latest event was:
  - delivered as desktop notification
  - downgraded to in-app or ambient only
  - suppressed by gate/cooldown/truth tier

### 5. Replace synthetic observability language with truthful product language

The next version should stop implying network telemetry or runtime throughput
that the product does not actually measure.

Allowed examples:

- spend
- spend delta
- session count
- efficiency
- success or waste mix
- value density
- context pressure
- comparison to prior period
- provider/model share

Avoid labels such as:

- TPS
- GB/s
- P99 latency
- network load

unless the system truly measures them.

### 6. Give each major chart one explicit question and one explicit takeaway

Each major chart block should include:

- a plain-language title
- a one-line explanation of what is being compared
- either:
  - hover/focus detail values
  - or a visible table/summary equivalent
- a short takeaway sentence or key observation

## Functional Requirements

- **FR-001**: System MUST implement one canonical desktop period contract shared
  by overview, analytics, export, menubar, and tray summary behavior.
- **FR-002**: System MUST support `1hr`, `1 day`, `7 days`, `1 month`, and
  `all`.
- **FR-003**: Overview MUST respond to the selected period instead of remaining
  effectively all-time.
- **FR-004**: Analytics MUST respond to the selected period and keep the active
  selection visually obvious.
- **FR-005**: Tray title and menubar hero MUST use a scoped spend metric that
  supports daily monitoring.
- **FR-006**: Product MUST expose the spend scope directly in the tray tooltip,
  menubar hero, or both.
- **FR-007**: Context warning state MUST be visible somewhere inside the app
  even when no native OS notification was shown.
- **FR-008**: System MUST expose the latest notification outcome as one of:
  `desktop_notification`, `in_app_banner`, `ambient_only`, `suppressed`, or
  equivalent truthful wording.
- **FR-009**: Key charts MUST provide visible explanatory text and accessible
  value access beyond hover-only `title` attributes.
- **FR-010**: Overview MUST make "what changed", "what is risky", and "what to
  inspect next" easier to read than today.
- **FR-011**: Analytics MUST make efficiency-versus-consumption comparisons more
  informative than the current mostly decorative compositions.
- **FR-012**: Synthetic metric names that imply unavailable telemetry MUST be
  removed or replaced by truthful labels.
- **FR-013**: Export routes MUST honor the same period contract as the on-screen
  analytics surface.

## Validation Requirements

- clicking each period control changes both URL/state and returned data
- overview, analytics, export, and menubar agree on the selected period
- tray title defaults to a daily or explicitly scoped metric and no longer reads
  like an unlabeled lifetime total
- all-time totals remain available only when labeled as such
- a context threshold event can be inspected even if the native notification was
  not shown
- charts expose clear captions, values, and takeaways without requiring hover
- accessibility remains intact for keyboard and screen-reader users

## Recommended File Targets

- `packages/core/src/db/database.ts`
- `packages/core/src/db/read-service.ts`
- `packages/core/src/db/types.ts`
- `apps/desktop/src/index.ts`
- `apps/desktop/src/menubar.ts`
- `apps/desktop/src/styles.ts`
- `apps/desktop-tauri/src-tauri/src/lib.rs`
- optional shared helpers/types if period or notification display state is
  extracted

## Workstreams

### Workstream A: Period Contract And Data Truth

- define canonical period model
- update queries to support hour/day/week/month/all
- wire overview, analytics, and export to the same period source

### Workstream B: Menubar And Tray Spend Scope

- switch primary glance metric to scoped spend
- label spend scope explicitly
- preserve access to all-time context without ambiguity

### Workstream C: Context Warning Visibility

- surface latest threshold state
- expose delivery outcome / suppression reason
- make the feature discoverable even when OS notifications are not shown

### Workstream D: Overview And Analytics Clarity

- remove synthetic metric labels
- improve chart explanations, hover/focus details, and takeaways
- strengthen efficiency/consumption comparison visuals

### Workstream E: Handoff And Reporting

- implement using compact handoff/reporting protocol files
- archive prompt/report artifacts under `docs/handoffs/phase-016/`
- report each acceptance item as `PASS`, `PARTIAL`, or `FAIL` with evidence

## Success Criteria

- **SC-001**: A user can tell daily spend from all-time spend at a glance
  without guessing.
- **SC-002**: Period controls behave consistently across overview, analytics,
  export, and menubar/tray summaries.
- **SC-003**: The app exposes context warning state even when native desktop
  notification delivery does not occur.
- **SC-004**: Charts feel more informative because they explain comparison,
  value, and takeaway instead of only showing shape.
- **SC-005**: The product no longer uses synthetic observability labels for
  metrics it does not truly measure.
