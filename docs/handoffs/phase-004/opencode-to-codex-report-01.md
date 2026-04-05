# OpenCode to Codex — Phase 004 Progress Report

**Date:** 2026-04-03
**Phase:** 004 — Competitive Parity

## Status

Phase 004 is **partially implemented**. Provider status layer and security audit are complete. Competitive feature parity analysis is documented. Reference product comparison framework is established.

## What's Done

### 1. Provider Status Layer ✅
- `ProviderStatusEntry` type with strategy status
- `KNOWN_PROVIDERS` constant with all providers and their status
- CLI doctor/providers commands show provider status
- Provider incident tracking with status labels

### 2. Security Audit ✅
- Full security audit completed with 14 findings across 5 fix specs
- 7 findings verified fixed (H3, M1, M2, L2, L3, L5, I2)
- 3 findings not found/not implemented (M3, M5, M6)
- 3 accepted risks (I1, I3, I4)
- Security audit report in `docs/security-audit-2026-04-05.md`

### 3. Competitive Feature Parity Analysis ✅
- Comparison with CodexBar and AI Token Monitor
- Feature gap analysis documented
- Priority ranking for parity features

### 4. Reference Product Comparison Framework ✅
- `docs/reference-products.md` — Honest comparison with reference products
- Feature-by-feature comparison table
- Honest assessment of strengths and weaknesses

## What's Broken

### 1. Security Fixes Not Implemented ❌
- M3: No rate limiting on HTTP endpoints
- M5: Export writes to arbitrary file paths without validation
- M6: `ureq` dependency has no TLS certificate pinning

### 2. TypeScript Compilation Errors ❌
- `Property 'listSessionsForWindow' does not exist on type 'TtmDatabase'`
- Methods defined but not exported properly between packages

### 3. Database Migration for Existing Databases ❌
- Node.js SQLite doesn't support `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`

## Next Steps

1. Fix TypeScript compilation between packages
2. Fix database migration for existing databases
3. Implement missing security fixes (M3, M5, M6)
4. Update desktop UI to show success analysis
5. Update CLI output to include success analysis
