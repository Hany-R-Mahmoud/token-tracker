# Feature Specification: Monitoring And Glanceable UX

**Feature Branch**: `003-monitoring-and-glanceable-ux`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "Formalize the next roadmap phase so OpenCode can execute the UI/UX-heavy monitoring work end to end without drifting."

## Product Goal

Turn Token Tracker from a strong local dashboard into a stronger ambient monitor
for the providers we already support.

This phase is intentionally not about chasing more providers. It is about making
Codex and OpenCode feel better monitored day to day through:

- glanceable menu bar status
- clearer reset-window UX
- richer analytics visuals
- better filter interaction polish
- explicit monitoring-oriented settings and refresh behavior

The product must remain local-first, honest, and shared-core-driven.

## Strategic Position

Compared with AI Token Monitor and CodexBar, Token Tracker is already stronger
as a local analysis workbench, CLI, and comparison tool. The biggest remaining
gap is not foundation; it is monitor UX.

This phase closes the highest-value visible product gaps without:

- fabricating Cursor or Claude support
- introducing cloud sync
- widening the provider matrix
- rewriting the current architecture

## Reference Learnings

### CodexBar-Inspired Requirements

- menu bar glanceability is a product feature, not polish
- reset windows should feel first-class, not buried metadata
- compact surfaces should answer "am I healthy?" quickly
- status presentation matters as much as raw totals

### AI Token Monitor-Inspired Requirements

- visual trends and time windows improve trust
- dashboards should be readable at a glance, not only inspectable
- monitoring products benefit from stronger visual hierarchy and summaries

### Token Tracker-Specific Constraints

- current shared-core, desktop shell, and Tauri wrapper stay in place
- existing filters and overview behaviors must be preserved, not regressed
- no speculative provider claims are allowed
- privacy-safe local export rules remain unchanged

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Glanceable Menu Bar Monitoring (Priority: P1)

A user can open the menu bar view and immediately understand current usage
health, current window position, and where attention is needed.

**Why this priority**: This is the clearest product gap versus CodexBar. We
already have a menu bar shell; it needs to become a better monitor.

**Independent Test**: Launch the native wrapper, open the menu bar window, and
verify the compact surface communicates current totals, per-provider state, and
reset-related context without requiring navigation into the dashboard.

**Acceptance Scenarios**:

1. **Given** local data exists, **When** the user opens `/menubar`, **Then**
   the view shows clear top-level status, compact provider breakdowns, and
   reset-related context in a dense but readable layout.
2. **Given** the product is running in the Tauri wrapper, **When** the user
   opens the menu bar surface repeatedly, **Then** the view remains stable,
   readable, and fast.

---

### User Story 2 - Reset Window And Monitoring Clarity (Priority: P1)

A user can understand reset timing and usage-window context without mentally
parsing raw timestamps or vague labels.

**Why this priority**: Reset visibility exists today but is not yet a strong
product feature.

**Independent Test**: Inspect overview and menu bar surfaces with imported data
and verify reset-window signals are explicit, consistent, and readable.

**Acceptance Scenarios**:

1. **Given** a provider includes reset metadata, **When** the user views the
   overview or menu bar, **Then** the product shows human-readable reset
   context rather than raw internal fields alone.
2. **Given** reset data is missing or weak, **When** the product renders the
   provider state, **Then** it remains honest instead of implying false
   precision.

---

### User Story 3 - Richer Analytics Surfaces (Priority: P2)

A user can inspect trends and distribution visually instead of relying only on
tables.

**Why this priority**: Token Tracker already has useful analytics data, but the
presentation still trails AI Token Monitor.

**Independent Test**: Open `/analytics` and verify at least one trend-oriented
and one distribution-oriented visual summary exists and remains legible with
real local data.

**Acceptance Scenarios**:

1. **Given** imported local data, **When** the user opens `/analytics`, **Then**
   they can visually understand provider/model/time trends faster than by
   reading tables alone.
2. **Given** sparse local data, **When** analytics views render, **Then** the
   empty or low-volume states remain clear and graceful.

---

### User Story 4 - Filter And Interaction Polish (Priority: P2)

A user can refine the overview quickly without confusion, hidden state, or
awkward interactions.

**Why this priority**: Filtering exists and is useful, but interaction polish
will matter more as the monitoring surfaces get denser.

**Independent Test**: Apply provider, model, search, and pagination controls on
the overview and verify the state is understandable, stable, and resettable.

**Acceptance Scenarios**:

1. **Given** the user mixes provider, model, search, and pagination controls,
   **When** they refine the overview, **Then** the active state remains clear
   and the results remain predictable.
2. **Given** the current filters produce zero results, **When** the page
   renders, **Then** the empty state explains the condition and provides a
   usable reset path.

---

### User Story 5 - Monitoring Settings And Refresh Model (Priority: P3)

A user can control lightweight monitoring behavior without changing the product
into a cloud app or background daemon maze.

**Why this priority**: The product is already daily-drivable; now it needs a
small amount of intentional operational control.

**Independent Test**: Verify the app exposes and respects a modest set of local
monitoring preferences such as refresh cadence or default time window, while
remaining safe and local-first.

**Acceptance Scenarios**:

1. **Given** a user adjusts supported monitoring preferences, **When** the
   product refreshes or reopens, **Then** those settings are applied
   consistently.
2. **Given** no preferences were configured, **When** the product runs, **Then**
   sensible local defaults are used.

## Edge Cases

- What happens when there is too little data to draw meaningful trends?
- What happens when reset metadata exists for some providers but not others?
- What happens when a user combines multiple filters and the page count becomes
  invalid?
- What happens when the monitoring refresh mechanism cannot complete on time?
- What happens when compact menu bar content becomes too dense for its window?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST preserve the current shared core as the source of
  truth for desktop, menu bar, and analytics surfaces.
- **FR-002**: System MUST improve the menu bar view into a more glanceable
  monitoring surface without replacing the current Tauri wrapper architecture.
- **FR-003**: System MUST elevate reset-window information into a clearer,
  more human-readable monitoring signal where data exists.
- **FR-004**: System MUST improve analytics presentation with visual summaries
  built from existing local analytics data.
- **FR-005**: System MUST preserve and polish current overview filtering rather
  than removing or destabilizing it.
- **FR-006**: System MUST keep all monitoring behavior local-first by default.
- **FR-007**: System MUST not claim Cursor support, Claude support, or any new
  provider support as part of this phase.
- **FR-008**: System MUST preserve privacy-safe export behavior and MUST not
  introduce raw prompt or transcript persistence.
- **FR-009**: System MUST provide graceful empty, loading, and error states for
  new monitoring-oriented UI paths.
- **FR-010**: System MUST keep documentation and roadmap status honest and
  synchronized with shipped behavior.

### Delivery Guardrails

- **DG-001**: OpenCode MUST follow the existing architecture and MUST NOT
  replace the server-rendered desktop shell with a new frontend stack.
- **DG-002**: OpenCode MUST use the following skills in order:
  `agent-orchestrator`, `agent-impeccable`, `agent-implementer`,
  `agent-tester`, `agent-reviewer`.
- **DG-003**: OpenCode MUST treat `agent-impeccable` as mandatory for UI/UX
  direction, layout, compact-surface hierarchy, and visual polish.
- **DG-004**: OpenCode MUST treat `agent-orchestrator` as mandatory for slice
  planning and execution order before code edits begin.
- **DG-005**: OpenCode MUST treat `agent-implementer` as mandatory for actual
  code changes after the slice plan is locked.
- **DG-006**: OpenCode MUST keep slices small enough that each slice can be
  validated with concrete route/build checks before moving on.
- **DG-007**: OpenCode MUST update docs only after implementation is validated,
  not before.
- **DG-008**: OpenCode MUST avoid speculative work on cloud sync, Cursor, or
  Claude during this phase.

### Key Entities *(include if feature involves data)*

- **MonitoringStatusCard**: Compact UI representation of provider usage state,
  trend signal, and reset context.
- **ResetWindowSnapshot**: Read-model shape describing provider reset timing
  and confidence for UI consumption.
- **AnalyticsVisualSeries**: Visualization-oriented aggregation derived from the
  existing analytics read models.
- **MonitoringPreferences**: Local-only preferences controlling lightweight
  monitoring behavior such as refresh cadence or default time window.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The menu bar surface can communicate useful monitoring state
  without requiring navigation to the full dashboard for the common case.
- **SC-002**: Reset-window information is easier to understand on overview and
  menu bar surfaces than in the current shipped product.
- **SC-003**: The analytics surface includes at least two visual summaries
  beyond plain tables.
- **SC-004**: Existing overview filtering remains intact and becomes easier to
  understand when multiple controls are active.
- **SC-005**: The phase lands without introducing false provider claims,
  privacy regressions, or architecture churn.
