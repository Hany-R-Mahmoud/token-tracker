# TTM-17 Research Findings: React/Next Best Practices Evaluation

## Task Overview
Evaluate how Token Tracker should interpret React and Next.js best practices given its largest problem areas are raw Node/TypeScript HTTP surfaces, not an existing React/Next app.

---

## Current Stack Analysis

### Verified Files Examined
| File | Lines | Type | Key Observations |
|------|-------|------|-----------------|
| `apps/desktop/src/index.ts` | ~1300+ | Raw HTTP server | Native `node:http`, manual routing, template literals for HTML |
| `apps/web/src/index.ts` | ~1200+ | Raw HTTP server | Native `node:http`, OAuth flows, session handling |
| `apps/desktop/src/styles.ts` | ~2100+ | CSS template string | Large CSS-in-JS via template literals |

### Architecture Pattern
- **No framework** - Raw Node.js `createServer()` using `node:http`
- **Manual routing** - `parseUrlPath()` with string matching (not Express/Fastify)
- **Inline templates** - HTML/CSS built as template strings/functions
- **Service layer** - `@ttm/core` database service abstraction

---

## What Translates Well vs What Doesn't

### Practices That DO Translate
| Practice | Application to TTM | Notes |
|----------|-------------------|-------|
| Component composition | Yes - extract view functions | `buildXHtml()` patterns already doing this |
| Single Responsibility | Yes - split monolithic files | Desktop index.ts handles 10+ surfaces |
| TypeScript interfaces | Yes - already strict | Core types well-typed |
| Error boundaries | Yes - `sendError()` pattern exists | Add centralized handling |
| Security headers | Yes - `SECURITY_HEADERS` constant | Already implemented |
| Rate limiting | Yes - exists in Map store | Could move to middleware |
| Accessibility (a11y) | Partial - skip links, ARIA in nav | Add to all interactive elements |

### Practices That DON'T Apply Directly
| Practice | Why | Recommendation |
|----------|-----|-------------|
| React Server Components | Not React - no virtual DOM | Skip RSC patterns |
| Next.js routing file conventions | Custom routing exists | Keep manual routing or migrate to minimal router |
| `use client` directives | Not applicable | N/A |
| Next.js middleware | Has native Node.js equivalent | Keep current approach |
| App Router layout nesting | No routing framework | N/A |

### Practices to ADAPT
| Practice | Adaptation |
|----------|------------|
| Server-side data fetching | Current `TtmReadService` pattern is already server-focused |
| Layouts & templates | Already using `buildXHtml()` function composition |
| Streaming/suspense | Not React - consider async generators if needed |
| Server Actions | Keep API-style handlers, no "actions" concept needed |

---

## Problem Areas & Recommended Architecture

### Priority Issues (from code inspection)
1. **~3000+ lines in single files** - Desktop/web index.ts exceed reasonable scope
2. **Inline CSS** - 2100-line `styles.ts` template literal
3. **Manual routing** - String matching prone to edge cases
4. **Scattered state** - Rate limit, notification maps in module scope
5. **No testing surface** - Pure functions but no unit test organization

### Incremental Target Architecture

**Avoid**: Complete framework rewrite (React/Next)
**Pursue**: Modularization within current stack

#### Phase 1: Internal Boundaries
```
apps/desktop/src/
├── index.ts           # Entry point only + HTTP server bootstrap
├── router.ts         # Centralized route matching (not framework)
├── routes/
│   ├── overview.ts   # Route handler + view builder
│   ├── analytics.ts
│   └── runtime.ts
├── views/
│   ├── overview-hero.ts
��   ├── trend-mesh.ts
│   └── ...
├── middleware/
│   ├── rate-limit.ts
│   └── security-headers.ts
└── state/
    └── notification-store.ts
```

#### Phase 2: Extract CSS
```
apps/desktop/src/
├── styles/
│   ├── tokens.css.ts      # CSS custom properties only
│   ├── reset.css.ts      # Normalize
│   └── components.css.ts # Component classes
```

#### Phase 3: Shared Core
```
packages/
├── core/
│   ├── http/               # NEW: minimal HTTP utilities
│   │   ├── router.ts       # Pattern-based routing
│   │   └── middleware.ts # Standard middleware interface
│   ├── ui/               # NEW: shared view primitives
│   │   ├── html.ts       # escapeHtml, buildX helpers
│   │   └── css.ts      # Shared styling utilities
│   └── types/
│       └── http.ts       # Request/Response, Route types
```

---

## Key Guidance Summary

| Category | Do | Don't |
|----------|----|-------|
| Framework | Stay on native Node.js | Don't add React for desktop/web |
| Routing | Centralize, not framework | Don't adopt Next.js file-based routing |
| Components | Extract view functions | Don't create React components |
| State | Module-level is fine | Don't add Redux/Zustand |
| Types | Keep TypeScript | N/A |
| CSS | Move to .css files | Don't add CSS-in-JS libs |
| Testing | Add unit tests | Don't skip due to "not React" |

---

## Uncertainty Tracking

| Item | Confidence | Notes |
|------|------------|-------|
| Current routing approach is manual | High - seen in code |
| CSS is inline template literals | High - verified 2100+ lines |
| No React intended | Medium - task assumes "not React app" |
| Architecture problems are monolith | High - line counts verified |
| Recommended approach is modularization | High - standard refactor |
| Avoid React recommendation | Medium - but aligns with task premise |

---

## Recommendation

**Target**: Incrementally modularize within existing native Node.js stack, adding minimal HTTP utilities (router, middleware interface). Do NOT attempt a React/Next rewrite - the architecture problems are about monolithic files and inline templates, not about lacking a virtual DOM.

The team should aim for:
1. File-based module boundaries (routes/, views/, middleware/)
2. CSS extraction to proper stylesheets
3. Centralized router (not framework - just cleaner than string matching)
4. Shared `@ttm/ui` utilities for common HTML patterns

This aligns with the task goal: "practical guidance...without a blind framework rewrite."