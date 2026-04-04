# Feature Specification: Local-First MVP Completion

**Feature Branch**: `001-local-mvp`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Complete the local-first MVP after initial Codex and OpenCode ingestion: add trusted pricing and CLI inspection, validate Cursor and Claude sources, implement the first desktop dashboard shell, and prepare menu bar integration."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trustworthy Local Analytics CLI (Priority: P1)

A developer can import local AI session data, inspect recent sessions, and view
cost and efficiency summaries from the terminal without opening a browser or
signing in.

**Why this priority**: This is the trust anchor for the product. If the CLI and
local analytics are not believable, every higher-level UI becomes noise.

**Independent Test**: Can be fully tested by importing local data and using CLI
commands to inspect summaries, provider health, and individual sessions from
the same SQLite store.

**Acceptance Scenarios**:

1. **Given** valid Codex and OpenCode local data sources, **When** the user runs
   `ttm import`, **Then** sessions are normalized into the local SQLite store
   without duplicate records.
2. **Given** imported sessions, **When** the user runs `ttm summary`,
   `ttm sessions`, and `ttm analyze <session-id>`, **Then** they see bounded,
   explainable analytics with cost totals where pricing is known.
3. **Given** an unavailable or unvalidated provider source, **When** the user
   runs `ttm doctor`, **Then** the CLI reports the provider honestly as missing
   or unsupported instead of fabricating data.

---

### User Story 2 - Expand Provider Coverage Safely (Priority: P2)

A developer can add one more real local provider source to the shared core
without destabilizing the existing Codex and OpenCode import paths.

**Why this priority**: Multi-provider coverage is part of the product promise,
but it must be built on validated local sources rather than assumptions.

**Independent Test**: Can be tested independently by validating the source,
importing that provider alone, and confirming its sessions appear correctly in
the shared SQLite database and CLI summaries.

**Acceptance Scenarios**:

1. **Given** a verified Cursor local source, **When** the user runs
   `ttm import`, **Then** Cursor sessions are imported into the shared store
   alongside existing providers.
2. **Given** Claude local sources are not sufficient on this machine, **When**
   the provider health check runs, **Then** Claude is reported as unavailable
   with a clear reason rather than treated as implemented.

---

### User Story 3 - Desktop Dashboard From Local Data (Priority: P3)

A developer can open a local desktop dashboard that reads the same SQLite store
as the CLI and shows summary, recent sessions, and provider comparisons without
any cloud dependency.

**Why this priority**: This is the first user-facing visual proof that the
shared core can drive a real product surface.

**Independent Test**: Can be tested independently by launching the desktop app
against a populated local SQLite database and verifying the overview and recent
session views render correctly.

**Acceptance Scenarios**:

1. **Given** imported local session data, **When** the user launches the
   desktop app, **Then** they see totals, provider summaries, and recent
   sessions from the shared local store.
2. **Given** a selected session, **When** the user opens the session detail
   view, **Then** they see cost, token usage, and explanation factors sourced
   from the same canonical session model as the CLI.

---

### User Story 4 - Menu Bar Quick Glance (Priority: P4)

A developer can keep the app in the menu bar and see a compact usage snapshot
plus a shortcut into the desktop dashboard.

**Why this priority**: The menu bar is valuable, but it should be layered on
after the shared core and desktop shell are already trustworthy.

**Independent Test**: Can be tested independently by launching the menu bar
surface, confirming it reads from local data, and opening the desktop window
from the menu bar action.

**Acceptance Scenarios**:

1. **Given** imported local sessions, **When** the menu bar app is running,
   **Then** it shows a compact summary and can open the desktop dashboard.
2. **Given** no imported data, **When** the menu bar app is running, **Then**
   it shows a safe empty state rather than crashing or showing fake metrics.

### Edge Cases

- What happens when a provider source exists but contains partially malformed
  records?
- How does the system behave when model pricing is unknown or provider costs are
  unavailable?
- What happens when the same import runs repeatedly against unchanged data?
- How does the desktop app behave when the local SQLite file does not exist yet?
- How does the system handle a provider that is installed but has no sessions?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use the shared local SQLite store as the source of
  truth for CLI and desktop surfaces.
- **FR-002**: System MUST import Codex and OpenCode sessions incrementally
  without creating duplicate session records.
- **FR-003**: System MUST expose CLI commands for provider health, import,
  summary, session listing, and single-session analysis.
- **FR-004**: System MUST compute session costs only when pricing is known from
  a trusted source or the provider stores cost directly.
- **FR-005**: System MUST represent missing or unsupported provider sources as
  unavailable rather than silently succeeding.
- **FR-006**: System MUST validate Cursor local storage shape before claiming
  Cursor importer support.
- **FR-007**: System MUST keep Claude marked as unavailable until a usable local
  session source is validated on this machine.
- **FR-008**: System MUST provide a desktop shell that reads local summaries and
  recent sessions from the shared store.
- **FR-009**: System MUST keep analytics explainable by exposing efficiency,
  waste, loop count, and related score factors for individual sessions.
- **FR-010**: System MUST avoid persisting full prompt text, code bodies, or
  long transcripts in the canonical local database.
- **FR-011**: System MUST provide safe empty and missing-data states in CLI and
  desktop surfaces.
- **FR-012**: System MUST keep the menu bar surface read-only against the local
  store in its first iteration.

### Key Entities *(include if feature involves data)*

- **CanonicalSession**: The normalized session record used across providers,
  CLI output, analysis, and UI rendering.
- **ProviderCheckpoint**: Incremental import cursor per provider source.
- **PricingSnapshot**: Trusted model pricing metadata used for cost
  calculation when provider-native cost is absent.
- **ProviderHealth**: Current availability and issue state for each provider.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can import local sessions and inspect summaries with
  `ttm import` and `ttm summary` in under 10 seconds on this machine.
- **SC-002**: Re-running `ttm import` against unchanged data does not increase
  stored session count.
- **SC-003**: Desktop overview renders local totals and recent sessions from the
  shared SQLite store without requiring any network access.
- **SC-004**: Unsupported or unvalidated providers are surfaced clearly in
  provider health output instead of appearing implemented.
