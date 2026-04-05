# Codex to OpenCode — Phase 001 Initial Prompt

**Date:** 2026-04-03
**Phase:** 001 — Local MVP Foundation

## Prompt

```
Work in /Users/hanyramadan/token traker.

Task: Implement Phase 001 (Local MVP) from the spec kit.

Read these files:
- specs/001-local-mvp/spec.md
- specs/001-local-mvp/plan.md
- specs/001-local-mvp/tasks.md

Implement:
1. Local SQLite storage for session data
2. Codex and OpenCode adapters for session ingestion
3. Basic CLI commands (doctor, import, summary, sessions, analyze)
4. Desktop HTTP server with overview page
5. Session detail view
6. Basic analytics with provider summaries

Do not:
- Add cloud sync
- Add external provider APIs
- Add adapter-level scoring policy
- Expose raw git diffs or private evidence
```

## Context

Phase 001 establishes the foundation of Token Tracker as a local-first product with SQLite storage, provider adapters, and basic CLI/desktop surfaces. This is the MVP that proves the core concept.
