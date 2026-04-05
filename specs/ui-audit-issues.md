# UI Audit Spec — Token Tracker Desktop

## Issues Found

### Critical (UI-breaking or confusing)

1. **Table column width overflow** — Long session titles, provider names, and model names cause column shifting and break table layout. Need explicit column widths with `table-layout: fixed` and `text-overflow: ellipsis`.

2. **Copy button broken on overview** — The copy button on the overview page references `.analytics-group` which doesn't exist on that page. It silently fails.

### High (usability issues)

3. **No loading states** — No visual feedback during data fetches, page transitions, or async operations. Users don't know if something is happening.

4. **External link indicators missing** — Menubar "Leaderboard" and "Settings" buttons link to the web app (port 3200) but look identical to internal links. No `target="_blank"` visual indicator.

5. **Filter form accessibility** — Labels use nested `<label>` pattern which works visually but lacks proper `for`/`id` associations for screen readers.

### Medium (polish/consistency)

6. **Inconsistent empty states** — Some use `<p class="empty">`, some use `<tr><td colspan="X" class="empty">`. Should be unified.

7. **Dark mode hardcoded colors** — Several colors are hardcoded instead of using CSS variables, causing dark mode inconsistencies.

8. **No focus indicators** — Interactive elements (filter pills, clear links, buttons) lack visible focus rings for keyboard navigation.

9. **Button visual hierarchy** — Download SVG and Copy text buttons look identical. Should distinguish primary vs secondary actions.

10. **Menubar team preview** — Shows "Leaderboard not connected" but doesn't explain why or how to connect.

### Low (nice-to-have)

11. **No responsive breakpoints** — Tables and layouts don't adapt for smaller viewports.

12. **Refresh indicator placement** — The refresh indicator in the nav bar is hard to see and doesn't have a clear purpose indicator.

## Fix Plan

1. Add `table-layout: fixed` with explicit column widths + ellipsis for text overflow
2. Fix copy button to work on overview page (copy provider summaries + session data)
3. Add loading skeleton/placeholder states for async content
4. Add external link icon and `rel="noopener"` to web app links
5. Add proper `for`/`id` associations to filter form labels
6. Unify empty state styling across all surfaces
7. Replace hardcoded colors with CSS variable references
8. Add `:focus-visible` styles for keyboard navigation
9. Distinguish primary (Download SVG) vs secondary (Copy text) button styles
10. Add explanatory text to menubar team preview
11. Add basic responsive table wrapper for small screens
12. Improve refresh indicator with icon and tooltip
