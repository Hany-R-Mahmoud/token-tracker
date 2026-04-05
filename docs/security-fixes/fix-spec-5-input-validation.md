# Fix Spec 5: Input Validation & Defense-in-Depth

**Findings:** M5, L1, L5
**Priority:** Medium

## M5: Export writes to arbitrary file paths

**File:** `packages/cli/src/index.ts:239`

**Issue:** `ttm export [output-path]` accepts any path. Could overwrite arbitrary files if wrapped in a script with unsanitized input.

**Remediation:** Validate output path doesn't escape current working directory. Warn before overwriting existing files outside `.ttm/`.

## L1: Database path from env var without validation

**Files:** `packages/core/src/db/database.ts:688`, `apps/web/src/db.ts:494`

**Issue:** Malicious `TTM_DB_PATH` could point to attacker-controlled SQLite database.

**Remediation:** Validate path is within expected directory (`~/.ttm/` or `$HOME/.ttm/`).

## L5: `escapeHtml` does not escape single quotes or backticks

**Files:** `apps/desktop/src/helpers.ts:3-8`, `apps/web/src/index.ts:98-99`

**Issue:** If any value is placed inside single-quoted attribute or backtick template, XSS is possible.

**Remediation:** Add `.replace(/'/g, '&#x27;')` and `.replace(/`/g, '&#x60;')` to `escapeHtml`.

## Implementation Plan

1. Strengthen `escapeHtml` in both desktop and web apps
2. Add path validation for `TTM_DB_PATH` and `TTM_LEADERBOARD_DB_PATH`
3. Add export path validation in CLI
4. Add file overwrite warning for exports outside `.ttm/`
