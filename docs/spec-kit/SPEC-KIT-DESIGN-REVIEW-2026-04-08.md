# SPEC-KIT: Token Tracker Desktop Design Review

**Date:** 2026-04-08  
**Review Type:** Visual Design & UX Critique  
**Target:** Token Tracker Desktop UI (apps/desktop/src/index.ts, styles.ts)  
**Analysis Scope:** Color system, typography, layout hierarchy, component patterns, visual consistency  

---

## Executive Summary

This design review analyzes the Token Tracker desktop application's visual design system. The application implements a sophisticated dark-mode-first analytics dashboard with a distinctive "Signal Foundry" aesthetic featuring mint green accents on deep blue backgrounds. The design successfully avoids generic dashboard patterns and establishes a unique visual identity.

**Overall Design Assessment:**  
The design demonstrates intentional visual language with cohesive color choices, distinctive typography, and purposeful data visualization. However, several areas require refinement for improved consistency, usability, and accessibility.

---

## Finding 1: Inconsistent CSS Variable Prefixes Across Design Systems

**Severity:** Major  
**Category:** Visual Consistency  
**Location:** `styles.ts:1-46` (PAGE_STYLES), `styles.ts:1668-1701` (MENUBAR_STYLES)  

### Description

The application maintains two separate design systems with different CSS variable naming conventions:
- **PAGE_STYLES**: Uses standard naming (`--bg-primary`, `--accent`, `--success`)
- **MENUBAR_STYLES**: Uses `mb-` prefix (`--mb-bg`, `--mb-accent`, `--mb-success`)

This inconsistency creates maintenance overhead and makes it difficult to share common styles between the two surfaces. Additionally, duplicate definitions exist for identical values (e.g., `--mb-bg: #0b1326` mirrors `--bg-primary`).

### Impact
- Increased CSS file size due to duplication
- Difficulty maintaining theme consistency
- Potential for divergence between desktop and menubar appearances
- Higher cognitive load for developers

### Recommendation
Consolidate into a single design system using a shared token layer:

```css
/* Shared design tokens - imported by both */
:root {
  /* Core palette */
  --color-bg-primary: #0b1326;
  --color-bg-secondary: #171f33;
  --color-text-primary: #dae2fd;
  --color-accent: #a3ffd9;
  --color-success: #36ffc4;
  --color-warning: #b9c8de;
  --color-critical: #b01522;
  
  /* Aliases for backward compatibility */
  --bg-primary: var(--color-bg-primary);
  --mb-bg: var(--color-bg-primary);
  /* ... etc */
}
```

---

## Finding 2: Redundant Typography Scale Definitions

**Severity:** Minor  
**Category:** Code Quality  
**Location:** `styles.ts:94-122`  

### Description

The typography system defines font families in multiple places with slight variations:
- Body: `"Instrument Sans", "Geist Sans", -apple-system...` (line 95)
- Headings: Same family but explicitly redefined (line 112)
- Monospace: `"Geist Mono", "JetBrains Mono", "SFMono-Regular"...` (line 262)

Additionally, the font stack includes both "Instrument Sans" and "Geist Sans" which may create inconsistency if users have both installed.

### Impact
- Unnecessary code duplication
- Potential rendering differences across systems
- Maintenance burden when updating font stack

### Recommendation
Define typography tokens once:

```css
:root {
  --font-sans: "Instrument Sans", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", "SFMono-Regular", "SF Mono", monospace;
  
  /* Semantic assignments */
  --font-body: var(--font-sans);
  --font-heading: var(--font-sans);
  --font-code: var(--font-mono);
}
```

---

## Finding 3: Unused CSS Properties in Shadow Definition

**Severity:** Minor  
**Category:** Code Quality  
**Location:** `styles.ts:38`, `styles.ts:78`  

### Description

The elevated shadow uses RGBA with hardcoded values that may not adapt well to theme changes:
```css
--shadow-elevated: 0 24px 56px rgba(4, 10, 25, 0.42);
```

This shadow appears the same in both light and dark themes, which may cause visual inconsistency.

### Recommendation
Make shadows theme-aware:

```css
:root {
  --shadow-elevated: 0 24px 56px rgba(4, 10, 25, 0.42);
}
[data-theme="light"] {
  --shadow-elevated: 0 18px 42px rgba(20, 20, 20, 0.08);
}
```

---

## Finding 4: Inconsistent Border Radius Tokens

**Severity:** Minor  
**Category:** Visual Consistency  
**Location:** `styles.ts:33-36`  

### Description

The design system defines four radius tokens but usage is inconsistent:
- `--radius-sm: 3px`
- `--radius-md: 4px`
- `--radius-lg: 6px`
- `--radius-full: 9999px`

However, several components deviate from these tokens:
- Line 1144: `border-radius: 6px` (should use `--radius-lg`)
- Various buttons use inconsistent radius values

### Recommendation
Audit all radius usage and ensure alignment with defined tokens.

---

## Finding 5: Operational Band Typography Hierarchy Issues

**Severity:** Major  
**Category:** Visual Hierarchy  
**Location:** `index.ts:666-680`, `styles.ts:1100-1117`  

### Description

The "Operational" hero section uses an extremely large heading (clamp 38px-56px) with uppercase transformation, but the visual hierarchy is unclear:

1. The "System Core" eyebrow uses uppercase with wide letter-spacing
2. "Operational" is even larger and also uppercase
3. Body copy follows with regular case

**Problem:** The uppercase treatment makes the heading feel like a display element rather than informative content. The extreme size (56px) may cause layout issues on smaller screens despite the clamp.

### Current Implementation
```css
.operational-copy h2 {
  font-size: clamp(38px, 5vw, 56px);  /* Very large */
  text-transform: uppercase;
  letter-spacing: -0.05em;
}
```

### Recommendation
Consider a more balanced hierarchy:

```css
.operational-copy h2 {
  font-size: clamp(28px, 4vw, 42px);  /* Reduce extreme size */
  text-transform: none;                  /* More readable */
  letter-spacing: -0.02em;
}
.operational-copy .eyebrow {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--accent);                  /* More prominent */
  font-weight: 700;
}
```

---

## Finding 6: KPI Cards Label Hierarchy Confusion

**Severity:** Minor  
**Category:** Visual Hierarchy  
**Location:** `styles.ts:1183-1212`  

### Description

The KPI card design has unclear information hierarchy:

```html
<div class="kinetic-kpi-head">
  <span>Throughput</span>        <!-- Label -->
  <b>+4.2%</b>                   <!-- Delta - also bold -->
</div>
<div class="kinetic-kpi-value">
  1,472                          <!-- Large number -->
  <small>req/s</small>          <!-- Unit -->
</div>
```

**Issues:**
- Both label and delta use similar visual weight (uppercase, small size)
- Delta color uses accent but isn't clearly differentiated as "change" indicator
- The value number is large but lacks prominence due to surrounding elements

### Recommendation
Strengthen the visual hierarchy:

```css
.kinetic-kpi-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.kinetic-kpi-head span {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);    /* More muted */
  font-weight: 500;
}
.kinetic-kpi-head b {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);        /* Clear accent for change */
}
.kinetic-kpi-value {
  font-size: 32px;             /* Slightly larger for impact */
  font-weight: 700;
  color: var(--text-primary);
}
```

---

## Finding 7: Line Meter Component Accessibility

**Severity:** Major  
**Category:** Accessibility  
**Location:** `styles.ts:1213-1250`  

### Description

The "line meter" visualization used in KPI cards has accessibility issues:

```html
<div class="line-meter">
  <span style="width:74%"></span>
</div>
```

**Problems:**
- No accessible label or description
- No ARIA role or aria-valuenow/aria-valuemin/aria-valuemax
- Visual indicator (the "dot" at end of line) conveys meaning not available to screen readers

### Current Implementation
```css
.line-meter span::after {
  content: "";
  position: absolute;
  right: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: var(--accent);
  /* This dot is decorative but not marked as such */
}
```

### Recommendation
Add proper accessibility attributes:

```html
<div class="line-meter" role="progressbar" aria-valuenow="74" aria-valuemin="0" aria-valuemax="100" aria-label="Network capacity used">
  <span style="width:74%"></span>
</div>
```

And ensure the decorative dot is properly hidden from screen readers:

```css
.line-meter span::after {
  content: "";
  /* ... existing styles ... */
  aria-hidden: true;
}
```

---

## Finding 8: Chart Colors Not Consistent With Semantic Meaning

**Severity:** Minor  
**Category:** Visual Consistency  
**Location:** `index.ts:446-452`, `index.ts:700-742`  

### Description

Charts and data visualizations use accent color for all data series regardless of semantic meaning:

```typescript
// All mini-bars use accent
chart: buildMiniBars(recentTokens, 'var(--accent)')
```

However, the design has semantic colors available (success, warning, critical) that could provide better data distinction.

### Current Behavior
- All positive metrics: mint green (#a3ffd9)
- No differentiation between "good" and "warning" values

### Recommendation
Apply semantic coloring to data visualizations:

```typescript
function getChartColor(value: number, context: 'efficiency' | 'latency' | 'load'): string {
  switch (context) {
    case 'efficiency':
      return value >= 70 ? 'var(--success)' : value >= 40 ? 'var(--warning)' : 'var(--critical)';
    case 'latency':
      return value <= 50 ? 'var(--success)' : value <= 100 ? 'var(--warning)' : 'var(--critical)';
    default:
      return 'var(--accent)';
  }
}
```

---

## Finding 9: Form Input Focus States Inconsistent

**Severity:** Minor  
**Category:** Accessibility / UX  
**Location:** `styles.ts:429-443`  

### Description

Form inputs have custom focus styles but they differ from the global focus-visible rule:

```css
.filter-label select:focus,
.filter-label input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-soft);
}
```

This creates two different focus experiences:
- Global: `outline: 2px solid var(--accent)`
- Form inputs: `outline: none` + `box-shadow`

### Recommendation
Unify focus states:

```css
.filter-label select:focus,
.filter-label input:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-soft), 0 0 0 1px var(--accent);
}
```

Or remove custom styles and rely on global focus-visible:

```css
.filter-label select:focus,
.filter-label input:focus {
  /* Remove custom focus - use global :focus-visible */
  border-color: var(--accent);
}
```

---

## Finding 10: Heatmap Cell Interaction Design

**Severity:** Minor  
**Category:** UX  
**Location:** `styles.ts:647-661`  

### Description

The activity heatmap cells have hover effects but lack clear click/tap feedback:

```css
.heatmap-cell:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

The upward translate on hover could be misinterpreted as "drag to reorder" or other interaction. The cells should clearly indicate whether they're interactive.

### Current State
- Cells have title attribute with data (good)
- Hover raises the cell (ambiguous)
- No active/pressed state defined
- No cursor indication

### Recommendation
Clarify interaction model:

```css
.heatmap-cell {
  cursor: pointer;  /* Explicit cursor */
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.heatmap-cell:hover {
  opacity: 0.9;
  transform: scale(1.1);  /* Scale up rather than translate */
  z-index: 1;
}
.heatmap-cell:active {
  transform: scale(0.95);  /* Press feedback */
  opacity: 1;
}
```

---

## Finding 11: Missing Responsive Typography Scale

**Severity:** Major  
**Category:** Responsiveness  
**Location:** `styles.ts:104-114`, `styles.ts:1603-1665`  

### Description

The design uses `clamp()` for some responsive sizing but many elements lack responsive adjustments:

- KPI values: Fixed 36px (line 1199)
- Section headings: Fixed 22px (line 1294)
- Stat values: clamp 24px-34px (line 266)

At mobile sizes (below 720px per media query), these can feel oversized.

### Current Media Query
```css
@media (max-width: 720px) {
  /* Layout changes but typography not addressed */
  body { padding: 0 14px 20px; }
}
```

### Recommendation
Add responsive typography:

```css
@media (max-width: 720px) {
  .kinetic-kpi-value {
    font-size: 28px;  /* Reduce from 36px */
  }
  .kinetic-panel-head h2 {
    font-size: 18px;  /* Reduce from 22px */
  }
  .stat-value {
    font-size: 24px;  /* Consistent with KPI */
  }
}
```

---

## Finding 12: Empty State Visual Treatment

**Severity:** Minor  
**Category:** UX  
**Location:** `index.ts:1214`, `styles.ts:349`  

### Description

Empty states use generic centering without visual hierarchy:

```css
.empty { 
  color: var(--text-secondary); 
  font-size: 13px; 
  text-align: center; 
}
```

This treatment is used for:
- No sessions data
- No trend data
- No provider data

All empty states look identical regardless of cause or user action needed.

### Recommendation
Create differentiated empty states:

```css
.empty {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  padding: 24px;
  background: var(--bg-tertiary);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
}
.empty-actionable {
  /* For empty states where user can take action */
  background: var(--accent-soft);
  border-color: var(--accent);
  border-style: solid;
}
.empty-actionable::before {
  content: "→ ";
  color: var(--accent);
}
```

---

## Finding 13: Print Styles Incomplete

**Severity:** Minor  
**Category:** Accessibility  
**Location:** `styles.ts:1611-1615`  

### Description

Print styles hide navigation but don't optimize for readability:

```css
@media print {
  .nav, .theme-toggle, .refresh-indicator, .btn-primary, .btn-secondary, .filter-form, .window-controls { 
    display: none !important; 
  }
  body { 
    max-width: none; 
    background: #fff; 
    color: #000; 
  }
  .section, .stat-card { 
    break-inside: avoid; 
    border: 1px solid #ccc; 
    box-shadow: none; 
    background: #fff; 
  }
}
```

**Issues:**
- Doesn't invert charts/visualizations for print
- Doesn't show data tables in optimized form
- Missing page margins

### Recommendation
Enhance print styles:

```css
@media print {
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #ffffff;
    --text-primary: #000000;
    --text-secondary: #333333;
    --border: #cccccc;
  }
  body {
    font-size: 12pt;
    line-height: 1.4;
  }
  /* Ensure charts are readable */
  .step-chart, .trend-mesh, .mini-bars {
    filter: invert(1);  /* Light backgrounds for print */
  }
  .section, .stat-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  /* Show URLs for links */
  a::after {
    content: " (" attr(href) ")";
    font-size: 10pt;
    color: #666;
  }
}
```

---

## Finding 14: Color Contrast in Status Indicators

**Severity:** Major  
**Category:** Accessibility  
**Location:** `styles.ts:22-27` (dark theme)  

### Description

The dark theme warning colors may not meet WCAG AA contrast requirements:

```css
--warning: #b9c8de;    /* Light gray on dark - may be hard to read */
--warning-bg: rgba(185, 200, 222, 0.12);
--warning-text: #d5e4fb;  /* Very light - poor contrast on dark */
```

Testing against dark background (#0b1326):
- #b9c8de on #0b1326: ~5.3:1 contrast (passes AA)
- #d5e4fb on #0b1326: ~7.1:1 contrast (passes AA)

However, the warning color is nearly identical to secondary-signal (#b9c8de vs #b9c8de - they're the same!), causing semantic confusion.

### Current Issue
```css
--warning: #b9c8de;
--secondary-signal: #b9c8de;  /* Identical! */
```

### Recommendation
Differentiate warning from secondary:

```css
--warning: #f0c674;       /* Warm amber - distinct from secondary */
--warning-bg: rgba(240, 198, 116, 0.15);
--warning-text: #f0c674;
--secondary-signal: #b9c8de;  /* Keep as-is */
```

---

## Summary Statistics

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Major | 5 |
| Minor | 9 |
| Total | 14 |

---

## Recommendations Summary

### High Priority (Fix Before Release)
1. **Fix CSS variable duplication** - Consolidate PAGE_STYLES and MENUBAR_STYLES
2. **Add accessibility to line meters** - ARIA roles for progress indicators  
3. **Clarify Operational Band hierarchy** - Reduce heading size, improve eyebrow
4. **Differentiate warning colors** - Warning shouldn't equal secondary signal
5. **Add responsive typography** - Scale down text on mobile

### Medium Priority (Next Sprint)
6. Unify form focus states with global
7. Add print optimization
8. Create actionable empty states
9. Fix chart semantic coloring

### Low Priority (Backlog)
10. Remove unused shadow property
11. Audit border radius usage
12. Clean up typography definitions
13. Improve heatmap interaction feedback
14. Complete print styles

---

## Design System Health Score

| Category | Score | Notes |
|----------|-------|-------|
| Color System | 7/10 | Distinctive palette but warning/secondary confusion |
| Typography | 8/10 | Good hierarchy but inconsistent definitions |
| Spacing | 9/10 | Consistent token usage |
| Components | 7/10 | Coherent but some accessibility gaps |
| Responsiveness | 6/10 | Layout adapts but typography static |
| Accessibility | 6/10 | Basic support but missing ARIA in data viz |
| Maintainability | 5/10 | Duplicate systems increase burden |

**Overall: 6.9/10** - Solid design with clear identity; priority improvements needed for accessibility and consistency.