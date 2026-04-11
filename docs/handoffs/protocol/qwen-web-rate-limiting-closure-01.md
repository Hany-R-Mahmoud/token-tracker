# Qwen Code — Web Rate Limiting Closure 01

Run a focused implementation pass to close the missing web-side rate limiting.

Read first:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-WEB-RATE-LIMITING-CLOSURE-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-SECURITY-DEBT-CLOSURE-REPORT-2026-04-10.md`
- `/Users/hanyramadan/token traker/docs/security-status-2026-04-05-current.md`
- `/Users/hanyramadan/token traker/docs/security-audit-2026-04-05.md`
- `/Users/hanyramadan/token traker/apps/desktop/src/index.ts`
- `/Users/hanyramadan/token traker/apps/web/src/index.ts`

Mission:

Implement web-side rate limiting so M3 can be closed honestly.

Do not re-audit the whole security program.
Do not broaden scope beyond the missing web implementation and the minimum docs
needed to match reality.

Rules:

1. Use the desktop app as the reference pattern, but adapt cleanly to the web
   server.
2. Keep the implementation bounded and low-risk.
3. Return HTTP `429` when the limit is exceeded.
4. Update the security docs only after the code is in place and verified.
5. Do not claim M3 is fixed unless code, docs, and validation all line up.

Required output:

Write a Markdown report to:

- `/Users/hanyramadan/token traker/docs/spec-kit/SPEC-KIT-QWEN-WEB-RATE-LIMITING-CLOSURE-REPORT-2026-04-10.md`

The report must include:

1. Summary
2. Files Changed
3. Implementation Details
4. Validation Commands And Results
5. Updated Security Status
6. What Remains Open
7. Explicit completion statement

Completion rule:

End with one of:

- `Web rate limiting closure is complete.`
- `Web rate limiting closure remains partial because ...`
