# Codex to OpenCode — Phase 005 Initial Prompt

**Date:** 2026-04-03
**Phase:** 005 — Team Leaderboard

## Prompt

```
Work in /Users/hanyramadan/token traker.

Task: Implement Phase 005 (Team Leaderboard) from the spec kit.

Read these files:
- specs/005-team-leaderboard/spec.md
- specs/005-team-leaderboard/plan.md
- specs/005-team-leaderboard/tasks.md

Implement:
1. Leaderboard database and types
2. Session ingestion from local session store into leaderboard DB
3. GitHub OAuth identity layer
4. Leaderboard web interface
5. Privacy-safe aggregated metrics only

Do not:
- Add cloud sync
- Add external provider APIs
- Expose raw git diffs, raw test logs, or private local evidence
```

## Context

Phase 005 adds a team leaderboard feature to Token Tracker, allowing users to compare their AI coding tool usage with teammates while maintaining privacy and local-first principles.
