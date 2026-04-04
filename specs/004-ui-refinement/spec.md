# UI Refinement Spec — Token Tracker

## Overview
Refine the three main surfaces (Overview, Analytics, Menubar) for clarity, consistency, and polish without changing architecture.

## Changes by Surface

### 1. Global Navigation (all surfaces)
- Add a compact top nav bar with links: Overview | Analytics | Menubar
- Consistent across all pages
- Dark background with white text for contrast

### 2. Overview Page
- Wrap stats in subtle card containers with light borders
- Add hover state to table rows
- Clean up reset column: remove emoji, use consistent text format
- Remove filter pills (redundant with form)
- Improve pagination styling with current page highlight
- Add subtle zebra striping to tables

### 3. Analytics Page
- Fix floating-point bar widths (round to integers)
- Add subtle section dividers between visual sections
- Add hover tooltips to distribution bars
- Improve table readability with hover states
- Add time window selector (7d / 14d / 30d)

### 4. Menubar
- Add labels to health dots (e.g., "Warning" tooltip)
- Clean up provider row layout — separate reset bar from text
- Improve recent session readability
- Add subtle hover states to provider rows

### 5. Color System
- Define consistent palette:
  - Primary: #2563eb (blue)
  - Success: #16a34a (green)
  - Warning: #f59e0b (amber)
  - Critical: #ef4444 (red)
  - Neutral: #6b7280 (gray)
  - Surface: #f9fafb (light gray)
  - Border: #e5e7eb (lighter gray)

## Execution Order
1. Global nav + color system (foundation)
2. Overview polish
3. Analytics polish
4. Menubar polish
5. Final verification
