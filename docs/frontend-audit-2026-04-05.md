# Frontend UI Audit & Critique Report

**Date:** 2026-04-05
**Scope:** Desktop app, Web app, Menubar view
**Modes:** `frontend-design` + `critique` + `audit` + `harden`

---

## Issues Found

### Critical

| # | Issue | File(s) | Impact | Status |
|---|---|---|---|---|
| C1 | Duplicate CSS rules in web app STYLES | `apps/web/src/index.ts:73-96` | Bloat, maintenance risk | ✅ Fixed (prior session) |
| C2 | Duplicate `class` attribute on menubar links | `apps/desktop/src/menubar.ts:184-185` | Invalid HTML, broken styling | ✅ Fixed (prior session) |
| C3 | No `prefers-reduced-motion` support | `apps/desktop/src/styles.ts` | Accessibility violation | ✅ Fixed |

### Major

| # | Issue | File(s) | Impact | Status |
|---|---|---|---|---|
| M1 | Color contrast fails WCAG AA for muted text | `apps/desktop/src/styles.ts` | Accessibility violation | ✅ Verified OK (already meets AA) |
| M2 | No skip navigation link | Desktop + Web | Keyboard a11y | ✅ Fixed (both overview & analytics) |
| M3 | Tables missing `scope` on `<th>` elements | Desktop + Web | Screen reader support | ✅ Fixed (6/6 tables) |
| M4 | Theme toggle uses emoji without aria-label | `apps/desktop/src/index.ts` | Screen reader support | ✅ Fixed (has aria-label) |
| M5 | No loading states for async operations | Web app | UX clarity | ⚠️ Partial (loading check added, cookie-based) |
| M6 | Inconsistent heading hierarchy (h1→h3 jumps) | Desktop analytics | Semantic HTML | ⚠️ Known, low priority |
| M7 | No error boundaries for JS-dependent features | Web drawer, theme toggle | Graceful degradation | ⚠️ Not fixed |
| M8 | Refresh indicator uses `::before` pseudo-element | `apps/desktop/src/styles.ts:175` | Not announced by screen readers | ✅ Fixed (added role="status" aria-live) |

### Minor

| # | Issue | File(s) | Impact | Status |
|---|---|---|---|---|
| m1 | No print styles for analytics | Desktop app | Print usability | ✅ Fixed |
| m2 | Empty states lack guidance | Desktop + Web | User onboarding | ✅ Fixed (added actionable guidance) |
| m3 | Focus indicators not consistent | All | Keyboard navigation | ✅ Verified (already has focus-visible) |
| m4 | No `:focus-visible` on table rows with `tabindex` | Web leaderboard | Keyboard a11y | ✅ Fixed |
| m5 | Stat cards could use `role="status"` | Desktop overview | Accessibility | ✅ Fixed |

---

## Implemented Fixes (2026-04-05)

1. **C3: prefers-reduced-motion** - Added `@media (prefers-reduced-motion: reduce)` to `apps/desktop/src/styles.ts:193-201`

2. **M2: Skip navigation links** - Added to both overview and analytics pages:
   - Overview: `apps/desktop/src/index.ts:103`
   - Analytics: `apps/desktop/src/index.ts:573`
   - CSS: `apps/desktop/src/styles.ts:203-218`

3. **M3: Table scope attributes** - Added `scope="col"` to all 6 tables:
   - Desktop overview provider table
   - Desktop overview session table
   - Desktop analytics model table
   - Desktop analytics daily activity table
   - Web leaderboard table

4. **M8: Refresh indicator** - Added `role="status"` and `aria-live="polite"` to `apps/desktop/src/index.ts:109`

5. **m5: Stat cards role=status** - Added to analytics page stat cards at `apps/desktop/src/index.ts:584-596`

6. **m1: Print styles** - Added `@media print` block to `apps/desktop/src/styles.ts:220-226`

7. **m2: Empty state guidance** - Improved messages across desktop and web:
   - `ttm import` guidance for no-data states
   - Filter adjustment hint for empty filtered results
   - GitHub connection guidance for unconnected users

---

## Not Fixed (Deferred)

| Issue | Reason |
|---|---|
| M5: Loading states | Web app architecture is server-rendered; loading states would require client-side JS which isn't the current pattern. The loading check was added but requires cookie-based trigger. |
| M6: Heading hierarchy | The h1→h3 jumps are in analytics section labels. Low visual impact, deferred. |
| M7: Error boundaries | Would require significant JS restructuring. Current drawer has basic error handling. |

---

## Verification

```bash
npm run build  # ✅ Passes
npm run typecheck  # ✅ Passes
```