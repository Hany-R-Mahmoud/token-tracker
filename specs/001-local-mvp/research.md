# Research: Local-First MVP Completion

## Current Baseline

- shared TypeScript monorepo exists
- canonical session model exists
- SQLite-backed local store exists
- Codex importer works on real local data
- OpenCode importer works on real local data
- CLI supports `doctor`, `import`, `summary`, `sessions`, and `analyze`

## Key Decisions

### Decision: Treat this feature as continuation, not greenfield

**Reason**: The repo already contains working ingestion and storage. OpenCode
should execute against the current baseline rather than regenerate foundation
work.

### Decision: Validate Cursor before implementing Cursor

**Reason**: The expected local cache path was not present on this machine during
inspection. Claiming support before validating the source would violate the
constitution.

### Decision: Keep Claude unavailable until usable local sessions are proven

**Reason**: The local Claude footprint available on this machine appears to be
plugin skill-injection logs, not trustworthy session history.

### Decision: Build desktop before true menu bar work

**Reason**: The desktop shell provides a clearer verification surface for the
shared local database and analytics. Menu bar work should read from the same
desktop/core path afterward.

### Decision: Use bounded OpenCode execution rounds

**Reason**: Codex can author the spec and acceptance criteria, while OpenCode
can execute narrow task batches without taking architectural control.

## Cursor Local Source Investigation (T012)

**Date**: 2026-04-02  
**Status**: Not validated — no trustworthy session source found

### Paths Inspected

| Path | Exists | Contains Sessions |
|---|---|---|
| `~/Library/Application Support/Cursor/` | yes | no |
| `~/.cursor/` | yes | no |
| `~/.cursor/sessions/` | no | n/a |
| `~/Library/Application Support/Cursor/User/globalStorage/` | yes | no (KiloCode tasks only) |
| `~/Library/Application Support/Cursor/User/workspaceStorage/` | yes | no (VSCode state DBs only) |

### What Was Found

- `~/Library/Application Support/Cursor/` contains a standard VSCode-fork layout:
  `User/`, `globalStorage/`, `workspaceStorage/`, `logs/`, `Session Storage/`
  (browser-level, not app sessions).
- `~/.cursor/ide_state.json` holds only a `recentlyViewedFiles` array — useful
  for file tracking, not session analytics.
- `~/.cursor/` contains `plans/`, `projects/`, `extensions/`, `skills-cursor/`,
  and `snapshots/` — none of these contain structured session records with
  token usage, costs, or model metadata.
- `globalStorage/kilocode.kilo-code/tasks/` contains KiloCode extension task
  metadata and git checkpoints — these belong to a third-party extension, not
  Cursor's own session history.
- No `.jsonl` session files were found anywhere under the Cursor directories
  (unlike Codex which uses `~/.codex/sessions/*.jsonl`).
- No dedicated session database or structured session export format was
  identified.

### Conclusion

Cursor on this machine stores editor state, extension data, and recently viewed
files, but **no parseable session history with token usage, model information,
or cost data**. The data shape is fundamentally different from Codex's
structured `.jsonl` format.

**Decision**: Mark Cursor as `unavailable` in the CLI. Do not implement a
speculative adapter. Revisit if Cursor ships a documented local session export
format or if a reliable parsing path is discovered.

## Claude Local Source Investigation

**Status**: Not validated — previously determined unavailable

### What Was Found

- No Claude-specific session database or structured export was identified on
  this machine.
- The local Claude footprint consists of plugin skill-injection logs, not
  session history suitable for analytics.

**Decision**: Keep Claude marked as `unavailable` until a real usable local
source is validated.
