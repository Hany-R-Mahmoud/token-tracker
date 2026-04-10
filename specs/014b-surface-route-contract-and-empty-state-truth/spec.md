# Feature Specification: Surface Route Contract And Empty-State Truth

**Feature Branch**: `014b-surface-route-contract-and-empty-state-truth`  
**Created**: 2026-04-08  
**Status**: Draft  
**Primary Execution Owner**: OpenCode  
**Input**: Desktop route handling in `apps/desktop/src/index.ts`, menubar HTML in `apps/desktop/src/menubar.ts`, packaged-app feedback from 2026-04-08, and existing product specs for desktop productization and rich menubar behavior.

## Goal

Make each desktop surface tell the truth about its own state and stop leaking
debug/browser affordances into the installed product.

This phase exists because several current failures are not independent:

- `Analytics` appears broken and falls back to an Overview-style empty state
- the desktop app still exposes a `Menubar` navigation target that should not
  be part of the main installed dashboard IA
- route-level failures and empty states collapse into the wrong surface copy

The current route contract is too loose for a product with multiple surfaces.

## Problem Statement

The current desktop server handles:

- overview
- analytics
- menubar
- JSON APIs
- export endpoints

but the route fallback behavior does not preserve surface identity. When
analytics has no data, it renders the generic Overview-style empty page instead
of an analytics-specific empty/error state.

At the same time, the main dashboard navigation still exposes `Menubar`, which
is a shell-owned compact surface rather than a primary desktop page.

## Evidence

- `buildDesktopNav` renders `Overview`, `Analytics`, and `Menubar`
- `/analytics` returns `buildEmptyHtml()` when `sessionCount === 0`
- `buildEmptyHtml()` renders the Overview-style shell and generic `No data
  imported yet` copy
- the user reports that clicking Analytics "doesn't do anything and returns back
  to overview"
- the user explicitly does not want a menubar button in the desktop app

## Root-Cause Analysis

### Root cause 1: route-specific empty states are not modeled

The route handlers distinguish paths, but empty-state handling does not preserve
that distinction. Overview and analytics are treated as if they share the same
terminal empty state, which makes navigation feel broken even when the route did
change.

### Root cause 2: the desktop app and browser/debug surface share one nav model

The main navigation is generated once and reused broadly. That is convenient in
development, but it ignores the product boundary between:

- the primary installed dashboard experience
- the shell-owned menubar popover route
- debug/browser access to `/menubar`

### Root cause 3: product IA is coupled to internal route existence

Because `/menubar` exists as a route, it was exposed in desktop navigation.
That is an implementation-led IA decision rather than a product-led one.

## Scope

- route-specific empty and error states
- separation between installed-desktop IA and browser/debug IA
- analytics route contract
- dashboard navigation contract
- shell route visibility rules for `/menubar`

## Non-Goals

- no analytics redesign beyond route/empty-state truth
- no provider ingestion changes
- no tray interaction work except where linked to route ownership

## Product Rules

- Each route must preserve its own identity even in degraded or empty states.
- The installed desktop dashboard must not expose shell-internal routes as
  primary navigation affordances.
- Empty-state copy must explain whether the problem is:
  - no imported data
  - no data for this surface/filter/window
  - runtime/startup failure

## Functional Requirements

- **FR-001**: `/analytics` MUST render an analytics-specific empty state or
  analytics-specific failure state.
- **FR-002**: `/` MUST render an overview-specific empty state or
  overview-specific failure state.
- **FR-003**: installed desktop navigation MUST exclude `Menubar` as a primary
  destination.
- **FR-004**: the `/menubar` route MAY continue to exist for shell use and
  browser debugging, but its existence MUST NOT dictate installed-dashboard IA.
- **FR-005**: navigation state MUST remain correct when the target route lacks
  data.
- **FR-006**: empty-state copy MUST distinguish between missing imported data
  and route-specific no-data conditions.

## Validation Requirements

- clicking `Analytics` always results in analytics-specific UI, even when empty
- the installed dashboard has no `Menubar` nav item
- route transitions remain visible and intelligible under no-data, partial-data,
  and runtime-failure conditions

## Recommended File Targets

- `apps/desktop/src/index.ts`
- `apps/desktop/src/menubar.ts`
- any nav helpers or route-specific HTML builders introduced to clarify surface
  ownership

## Execution Plan

1. Split shared empty/error builders by surface responsibility.
2. Introduce a surface-aware nav contract with explicit installed-shell rules.
3. Keep `/menubar` available for shell rendering without advertising it in the
   desktop dashboard.
4. Add route-level tests or snapshot checks for Overview and Analytics empty
   paths.

## Success Criteria

- **SC-001**: `Analytics` no longer appears to "bounce back" to Overview under
  empty conditions.
- **SC-002**: The installed dashboard no longer advertises `Menubar` as a page.
- **SC-003**: A tester can tell which surface they are on even when the route
  has no usable data.
