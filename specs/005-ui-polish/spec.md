# UI Polish Spec — Token Tracker

## Overview
Address audit findings to improve maintainability, clarity, and visual consistency across all surfaces.

## Issues & Fixes

### 1. Consolidate Inline Styles → CSS Classes
- **C2, C3**: Footer paragraphs on overview/analytics use inline styles
- **C4**: Detail page has 12+ inline style declarations
- **C5**: Analytics chart bars use inline wrappers (4 chart types)
- **H6**: Menubar reset info uses inline styles
- **Fix**: Add CSS classes for `.footer-note`, `.chart-row`, `.chart-label`, `.chart-bar`, `.chart-bar-cost`, `.chart-bar-model`, `.menubar-label`

### 2. Detail Page Readability
- **H4**: Tokens row crams 5 values on one line
- **H3**: Back-link has no visual separation from nav
- **Fix**: Break tokens into sub-grid, add margin to back-link

### 3. Menubar Consistency
- **H5**: Remove `⚠` emoji, use text indicator
- **M6**: Remove dead `buildMenubarResetStr` function
- **Fix**: Use CSS class for unpriced warning, delete dead code

### 4. Template Readability
- **M1**: Error/Empty/NotFound on single lines
- **Fix**: Multi-line templates

### 5. Type Safety
- **M3**: `listResult` uses inline type instead of `SessionListResult`
- **M4**: `listResult!` non-null assertion
- **Fix**: Import/use proper type, add guard

### 6. Minor Fixes
- **C1**: Ensure colspan consistency (daily table has 5 cols, should match)
- **H1**: Reset cell `—` ambiguous — use "none" or "—"
- **H2**: Remove redundant "Clear" link inside filter form
- **H7**: Distribution empty states misleading — remove or clarify

## Execution Order
1. CSS class consolidation (biggest win)
2. Detail page readability
3. Menubar cleanup
4. Template readability
5. Type safety
6. Minor fixes
7. Build + verify all routes
