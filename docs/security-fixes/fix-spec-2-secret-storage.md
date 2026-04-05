# Fix Spec 2: Secret Storage

**Findings:** H1
**Priority:** High

## H1: GitHub OAuth access tokens stored in plaintext in SQLite

**Files:** `apps/web/src/db.ts:96` (schema), `apps/web/src/db.ts:105` (insert)

**Issue:** GitHub OAuth access tokens are stored in plaintext in the `github_users` table. Any process or user with read access to the SQLite file (`~/.ttm/leaderboard.sqlite`) can extract valid GitHub OAuth access tokens.

**Exploit scenario:** Backup tools, file sync services, or other local processes with read access to the `.ttm/` directory can extract valid GitHub tokens. These tokens grant `read:user,user:email` scope and can be used to impersonate the user on GitHub API until they expire.

**Remediation options:**
1. **Encrypt tokens at rest** using OS keychain (macOS Keychain, Windows DPAPI, Linux libsecret)
2. **Restrict file permissions** to `0600` on the database file (simpler, defense-in-depth)
3. **Store only short-lived session tokens** and re-exchange OAuth code when needed

**Recommended:** Option 2 (file permissions) as immediate fix, Option 1 (encryption) as follow-up.

## Implementation Plan

1. Add `chmod 0o600` to database file creation in `apps/web/src/db.ts`
2. Add `.ttm/` to `.gitignore` (already present, verify)
3. Add warning log if database file permissions are too permissive
