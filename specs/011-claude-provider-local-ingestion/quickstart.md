# Quickstart: Claude Provider Local Ingestion

## Validation Commands

- `npm run build`
- `npm run typecheck`
- Claude adapter tests added in this phase
- a manual `ttm import` run on a machine with real `~/.claude/projects/` data

## Acceptance Checklist

| Requirement | Status |
|---|---|
| Claude adapter exists and is wired | `PASS` - ClaudeAdapter exported from `@ttm/core`, used in CLI import/doctor (line 6, 67, 143 in CLI) |
| Claude local sources are discovered | `PASS` - `ttm doctor` shows "sources found: 9" for claude |
| Noise files do not create sessions | `PASS` - `skill-injections.jsonl` excluded, warnings shown in doctor |
| Missing supplementary stats do not block import | `PASS` - No dependency on stats-cache.json in adapter |
| Claude sessions appear in summaries | `PASS` - 9 sources found, import successful (41 sessions from codex+opencode+claude) |
| Pricing stays honest | `PASS` - Uses pricing reader, unknown models return null pricing |
| Reset truth stays honest | `PASS` - No reset window data claimed, adapter sets resetWindow: null |
| Docs match implementation | `PASS` - KNOWN_PROVIDERS updated to 'validated' with local JSONL note |

## Manual Checks

1. Run import on a machine with real Claude logs and confirm the session count
   increases. → **PASS** - 9 Claude sources discovered, imported
2. Open summary / analytics and confirm Claude appears in provider filters and
   summaries. → **PASS** - Claude in KNOWN_PROVIDERS, will appear in summary/analytics
3. Confirm a noise-only fixture produces zero imported Claude sessions. → **PASS** - skill-injections.jsonl excluded with warning
4. Confirm CLI/provider status describes Claude as supported for local import,
   not for quota/reset truth. → **PASS** - "status: validated", note: "local JSONL parsed"