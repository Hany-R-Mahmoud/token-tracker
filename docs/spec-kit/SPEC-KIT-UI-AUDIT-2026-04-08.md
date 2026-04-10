# SPEC-KIT: Token Tracker Desktop UI Audit

**Date:** 2026-04-08  
**Modes Applied:** audit, critique  
**Target:** Token Tracker Desktop (apps/desktop/src/index.ts, styles.ts)  
**Severity Classification:** Critical / Major / Minor / Suggestion  

---

## Executive Summary

The Token Tracker desktop UI serves as a dashboard for tracking AI agent token usage across multiple providers. The current implementation is a mature, functional server-rendered HTML application with comprehensive data visualization. However, the audit reveals several accessibility gaps, consistency issues, and opportunities for improvement in visual hierarchy and interaction quality.

**Overall Assessment:** Production-ready with technical debt in accessibility and minor UX refinements needed.

---

## Finding 1: Missing Skip Link Target Anchor

**Severity:** Major  
**Category:** Accessibility  
**Location:** `styles.ts:1581-1596` (CSS), multiple page templates  

**Description:** The skip link CSS exists but the corresponding `<a id="main-content">` anchor is present only on Overview and Analytics pages. Session detail pages and error states lack this anchor, breaking keyboard navigation for users relying on screen readers.

**Affected Pages:**
- Session detail page (`buildDetailHtml`)
- Error pages (`buildErrorHtml`, `buildEmptyHtml`, `buildNotFoundHtml`)
- Runtime diagnostics page (`buildRuntimeDiagnosticsHtml`)

**Fix Steps:**
1. Add `<a id="main-content" tabindex="-1"></a>` to all page templates after opening `<main>` tag
2. Ensure `tabindex="-1"` allows focus for skip link destination without being focusable normally

---

## Finding 2: Form Labels Missing Proper Association

**Severity:** Major  
**Category:** Accessibility  
**Location:** `index.ts:1156-1175` (filter form)  

**Description:** The filter form uses `<label>` elements wrapping `<select>` and `<input>` elements, which is semantically correct. However, the "Filter" submit button lacks proper labeling—users with assistive technology may not understand the button's purpose.

**Current:**
```html
<button type="submit">Filter</button>
```

**Fix Steps:**
1. Add `aria-label="Apply filters"` to the submit button
2. Consider adding `aria-describedby` to describe what happens when filters are applied

---

## Finding 3: Color Contrast in Light Theme Warning States

**Severity:** Major  
**Category:** Accessibility  
**Location:** `styles.ts:67-72` (light theme colors)  

**Description:** Light theme `--warning` (#3c4a5d) on light backgrounds may not meet WCAG AA 4.5:1 contrast ratio for small text. The `--warning-text` (#233143) is used for badges and important indicators.

**Current Values:**
- `--warning-text`: #233143
- `--warning-bg`: rgba(60, 74, 93, 0.12)

**Fix Steps:**
1. Darken `--warning-text` to #1a2a3d for better contrast
2. Increase `--warning-bg` opacity to 0.18 for better visibility
3. Verify all warning badges pass contrast requirements

---

## Finding 4: Focus Visible Styles Inconsistent

**Severity:** Minor  
**Category:** UX / Accessibility  
**Location:** `styles.ts:488-497`  

**Description:** Focus-visible styles are defined for specific components but not consistently applied to all interactive elements (links in terminal feed, pagination links, heatmap cells).

**Fix Steps:**
1. Add global focus-visible rule:
```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```
2. Remove redundant per-component focus rules or ensure they match

---

## Finding 5: Missing ARIA Live Region for Dynamic Content

**Severity:** Minor  
**Category:** Accessibility  
**Location:** `index.ts:1229-1243` (refresh indicator)  

**Description:** The refresh indicator updates every 5 seconds but lacks `aria-live="polite"` region. Screen reader users won't be notified of refresh state changes.

**Current:**
```html
<span class="refresh-indicator" id="refresh-state" title="Auto-refresh: watching database" role="status" aria-live="polite"></span>
```

The element has `role="status"` and `aria-live="polite"` but the JavaScript updates `textContent` which may not trigger announcement properly.

**Fix Steps:**
1. Wrap refresh indicator in a dedicated live region container
2. Ensure text changes are meaningful (e.g., "Data refreshed 5 seconds ago" vs "Updated")

---

## Finding 6: Table Headers Not Properly Scoped

**Severity:** Minor  
**Category:** Accessibility  
**Location:** `index.ts:1189, 1207, 1701, 1712`  

**Description:** Some tables use `<th>` without `scope` attribute. While modern browsers handle implicit scope, explicit `scope="col"` improves reliability across assistive technology.

**Fix Steps:**
1. Add `scope="col"` to all `<th>` elements in tables

---

## Finding 7: Inline Styles Reduce Maintainability

**Severity:** Suggestion  
**Category:** Code Quality  
**Location:** Multiple locations in `index.ts`  

**Description:** Heavy use of inline styles (e.g., `style="margin-top:12px"`, `style="border-left:3px solid ${color}"`) makes the codebase harder to maintain and prevents theme customization.

**Affected Functions:**
- `buildRuntimeStatusCard` (line 193)
- `buildEmptyHtml` (lines 127-128)
- `buildOverviewSuccessCard` (line 1268)
- `buildOverviewContextHealthSection` (line 1289)
- Many others

**Fix Steps:**
1. Create utility classes in CSS:
```css
.border-left-success { border-left: 3px solid var(--success); }
.border-left-warning { border-left: 3px solid var(--warning); }
.margin-top-sm { margin-top: 12px; }
```
2. Replace inline styles with class names

---

## Finding 8: Missing High Contrast Mode Support

**Severity:** Minor  
**Category:** Accessibility  
**Location:** `styles.ts`  

**Description:** No explicit support for `prefers-contrast: more` media query. Users with visual impairments who need higher contrast don't have a dedicated mode.

**Fix Steps:**
1. Add high contrast overrides:
```css
@media (prefers-contrast: more) {
  :root {
    --border: #000;
    --text-secondary: #1a1a1a;
  }
}
```

---

## Finding 9: Font Loading Strategy Not Optimized

**Severity:** Suggestion  
**Category:** Performance  
**Location:** `styles.ts:95, 262`  

**Description:** Custom fonts ("Instrument Sans", "Geist Sans", "Space Grotesk") are referenced but font-display strategy is not specified. This may cause FOIT (Flash of Invisible Text) during font loading.

**Fix Steps:**
1. Add font-display: swap to @font-face declarations if self-hosted
2. If using Google Fonts, ensure swap parameter is included

---

## Finding 10: Interactive Elements Missing Pointer Feedback

**Severity:** Minor  
**Category:** UX  
**Location:** `styles.ts:647-661` (heatmap cells)  

**Description:** Heatmap cells have hover state but no active/pressed state for click feedback.

**Fix Steps:**
1. Add:
```css
.heatmap-cell:active {
  transform: scale(0.95);
}
```

---

## Finding 11: Dark Theme Only Shows Accent Gradient

**Severity:** Suggestion  
**Category:** Visual Design  
**Location:** `styles.ts:88-93`  

**Description:** The background radial gradient that creates visual interest is visible in both themes, but the light theme's gradient uses the same accent color which may be too subtle or inconsistent with light mode aesthetics.

**Fix Steps:**
1. Adjust light theme to use a more visible but subtle gradient:
```css
[data-theme="light"] {
  background:
    radial-gradient(circle at top right, rgba(0, 108, 80, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
    var(--bg-primary);
}
```

---

## Finding 12: Keyboard Navigation for Signal Window Chips

**Severity:** Minor  
**Category:** UX / Accessibility  
**Location:** `index.ts:495-514` (signal window chips)  

**Description:** Signal window chips are rendered as `<a>` tags which are keyboard-focusable, but there's no visible focus indicator specific to this component.

**Fix Steps:**
1. Ensure chips have distinct focus style:
```css
.signal-window-chip:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

## Finding 13: Session Detail Page Missing Section Heading Hierarchy

**Severity:** Minor  
**Category:** Accessibility / Structure  
**Location:** `index.ts:1750-1805` (detail page)  

**Description:** The detail page has multiple `<h3>` elements but no logical document outline with a preceding `<h2>`. Screen reader users may have difficulty navigating the section structure.

**Current:**
```html
<h3>Outcome Reasons</h3>
<h3>Waste Reasons</h3>
<h3>Score Factors</h3>
```

**Fix Steps:**
1. Add section wrapper with `<h2>` before the `<h3>` sections:
```html
<div class="section">
  <h2>Analysis Details</h2>
  <h3>Outcome Reasons</h3>
  ...
</div>
```

---

## Finding 14: No Reduced Motion Respect for Complex Animations

**Severity:** Minor  
**Category:** Accessibility  
**Location:** `styles.ts:1573-1580`  

**Description:** Reduced motion is respected but some animations may still cause issues (gradient transitions, SVG chart animations).

**Fix Steps:**
1. Expand reduced motion to include hover transitions:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .mini-bar, .heatmap-cell, .feed-row {
    transition: none;
  }
}
```

---

## Finding 15: Missing lang Attribute on Dynamic Content

**Severity:** Minor  
**Category:** Accessibility  
**Location:** `index.ts:111` (buildErrorHtml), `buildEmptyHtml`, etc.  

**Description:** While pages set `lang="en"` on `<html>`, dynamically inserted content that might include non-English text (provider names, error messages) doesn't specify language. This is acceptable for data from known sources but should be considered for user-generated content.

**Current:** `lang="en"` is set correctly.

**Note:** No action needed for current implementation; document for future if user content support is added.

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Major | 3 |
| Minor | 9 |
| Suggestions | 3 |
| **Total** | **15** |

---

## Recommendations Priority

### Phase 1 (Immediate - before next release)
1. Fix skip link anchor on all pages (Finding 1)
2. Add contrast to light theme warnings (Finding 3)
3. Add proper focus-visible styles globally (Finding 4)

### Phase 2 (Soon - next sprint)
4. Add ARIA live region improvements (Finding 5)
5. Add scope to table headers (Finding 6)
6. Add high contrast mode support (Finding 8)

### Phase 3 (Backlog)
7. Refactor inline styles to utility classes (Finding 7)
8. Optimize font loading (Finding 9)
9. Add interactive feedback states (Finding 10)
10. Adjust light theme gradient (Finding 11)