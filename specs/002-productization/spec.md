# Feature Specification: Productization And Source Parity

**Feature Branch**: `002-productization`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Fill the holes in the plan using the open-source references, prepare the remaining specs, and turn the current MVP into a real product that can be tested against AI Token Monitor and CodexBar."

## Product Goal

Turn the current local-first MVP into a real, testable product with:

- trustworthy provider coverage beyond Codex and OpenCode
- native macOS packaging and tray behavior
- richer visual analytics and exports
- a repeatable comparison harness against reference apps

This feature is not a greenfield rebuild. It extends the current shared core,
CLI, and desktop prototype into a product surface that can be compared in daily
use against the current open-source references.

## Reference Learnings

### CodexBar-Inspired Requirements

- Provider coverage can come from multiple source types, not only local logs
- Cursor support is likely feasible through browser session cookies / web usage
  endpoints instead of local session transcripts alone
- Native macOS menu bar presence matters for ambient monitoring
- Reset windows, provider status, and compact glanceability are product-critical

### AI Token Monitor-Inspired Requirements

- A local dashboard must make usage understandable at a glance
- Time-based breakdowns, provider summaries, and model summaries increase trust
- The product should remain useful without any sign-in requirement for the core
  local surfaces

### Tokscale-Inspired Requirements

- A provider adapter may need provider-specific caches and normalization helpers
- Cursor support may require a usage cache / import cache rather than direct
  session reconstruction
- Comparison and historical aggregation are product features, not just debug
  tools

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Source Parity With References (Priority: P1)

A developer can run this product and get provider readings for Codex, OpenCode,
and at least one additional meaningful provider path that closes the gap with
reference tools.

**Why this priority**: The biggest product hole is trust in provider coverage.
If CodexBar can show Cursor usage and this product cannot, the product feels
unfinished even if the local core is strong.

**Independent Test**: Enable the provider, import or refresh, and confirm the
provider appears in CLI and desktop with honest source metadata.

**Acceptance Scenarios**:

1. **Given** a machine with usable Cursor browser session state, **When** the
   user runs provider refresh/import, **Then** Cursor usage is surfaced with a
   documented source path and honest limits on what is known.
2. **Given** Claude remains unvalidated locally, **When** the product runs,
   **Then** Claude still appears as unavailable with a clear reason rather than
   being silently ignored.

---

### User Story 2 - Native Product Wrapper (Priority: P1)

A developer can launch a native macOS app and use the product as an actual
desktop/menu bar utility rather than a manually started local server.

**Why this priority**: The current HTTP shell proves the concept, but a real
product must feel installable and ambient.

**Independent Test**: Build and launch the native wrapper locally, verify the
   dashboard opens, the tray/menu bar entry appears, and the compact view opens
   from it.

**Acceptance Scenarios**:

1. **Given** the product is built, **When** the user launches it on macOS,
   **Then** they get a native app window for the dashboard without manually
   typing local URLs.
2. **Given** the app is running, **When** the user uses the menu bar entry,
   **Then** they can open the compact view and navigate into the full dashboard.

---

### User Story 3 - Comparative Trust Layer (Priority: P2)

A developer can compare this product's output against external reference apps
and record the differences in a repeatable way.

**Why this priority**: The product is now strong enough that correctness should
be tested against real competitors, not just internal assumptions.

**Independent Test**: Run a comparison workflow on the same machine and record
provider totals, reset windows, and notable discrepancies.

**Acceptance Scenarios**:

1. **Given** AI Token Monitor or CodexBar is installed and usable, **When** the
   user runs the comparison workflow, **Then** a local comparison artifact is
   produced describing matches, mismatches, and confidence.
2. **Given** a provider reading differs between this product and a reference
   app, **When** the comparison report is generated, **Then** the report shows
   the discrepancy instead of hiding it.

---

### User Story 4 - Product Analytics Layer (Priority: P2)

A developer can inspect trends, model/provider breakdowns, and export data for
deeper analysis from the same local-first store.

**Why this priority**: The current desktop proves the data model, but a real
product needs richer analytics to compete with purpose-built monitors.

**Independent Test**: Launch the product, inspect charts or aggregate views,
and export a local snapshot without requiring cloud sync.

**Acceptance Scenarios**:

1. **Given** imported local data, **When** the user opens analytics views,
   **Then** they can inspect provider, model, and time-based summaries.
2. **Given** imported local data, **When** the user exports, **Then** a local
   machine-readable file is produced without leaking raw transcripts.

## Edge Cases

- What happens when browser-cookie-based providers are enabled but cookies are
  missing, expired, or unreadable?
- What happens when native wrapper packaging succeeds but the local DB path is
  locked by another process?
- What happens when a provider exposes billing or resets but not transcript
  detail?
- How is comparison handled when reference apps use different rounding or cache
  policies?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST preserve the current shared core and treat it as the
  source of truth for CLI, desktop, native wrapper, and menu bar surfaces.
- **FR-002**: System MUST support a second source strategy for providers where
  appropriate, including browser-cookie or web-session sourcing when local log
  files are insufficient.
- **FR-003**: System MUST not claim Cursor support until the actual Cursor
  source strategy is verified on this machine.
- **FR-004**: System MUST preserve honest unavailable messaging for providers
  that remain unvalidated.
- **FR-005**: System MUST provide a native macOS wrapper for the existing
  dashboard and compact view.
- **FR-006**: System MUST provide a menu bar entry point that opens or hosts a
  compact summary view.
- **FR-007**: System MUST support local comparison artifacts against external
  reference apps installed on the same machine.
- **FR-008**: System MUST add richer analytics views without persisting full
  prompts, code bodies, or long transcripts.
- **FR-009**: System MUST support local export of normalized analytics data.
- **FR-010**: System MUST remain local-first by default; any external provider
  calls used for quota or billing lookups MUST be opt-in and documented.

### Key Entities *(include if feature involves data)*

- **ProviderSourceStrategy**: The concrete mechanism used to read a provider,
  such as local log parsing, local DB parsing, browser cookies, or provider API.
- **ComparisonSnapshot**: A local artifact recording product output versus a
  reference app at a moment in time.
- **AnalyticsSeries**: Aggregated local metrics for provider, model, or time
  windows.
- **ExportBundle**: A local serialized snapshot of summaries and session-level
  analytics that excludes raw transcripts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The product can be launched as a native macOS app without
  requiring the user to manually run a localhost URL.
- **SC-002**: At least one major source gap identified during the MVP phase is
  closed or truthfully re-scoped with a validated alternate source strategy.
- **SC-003**: The product can generate a comparison artifact against at least
  one installed reference app on this machine.
- **SC-004**: The product exposes at least one richer analytics surface beyond
  raw tables, such as trend, provider, or model breakdown views.
- **SC-005**: The product can export a local analytics bundle without storing
  raw prompt or transcript bodies.
