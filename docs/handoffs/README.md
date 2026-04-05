# Handoff Archive

This folder contains all prompts, reports, and follow-up corrections exchanged between Codex and OpenCode during the productization and security phases.

## Structure

```
docs/handoffs/
  README.md                    ← This file
  protocol/                    ← Shared compact execution/reporting baselines
  phase-007/                   ← Phase 007 handoff materials
  phase-008/                   ← Phase 008 handoff materials
  phase-009/                   ← Phase 009 handoff materials
  phase-010/                   ← Phase 010 handoff materials
```

## Naming Convention

All files follow this pattern:

```
{sender}-to-{recipient}-{type}-{sequence}.md
```

| Component | Values |
|---|---|
| sender | `codex` or `opencode` |
| recipient | `opencode` or `codex` |
| type | `prompt`, `report`, `followup`, `correction`, `final-report` |
| sequence | `01`, `02`, `03`, etc. |

### Examples

- `codex-to-opencode-prompt-01.md` — Initial prompt from Codex to OpenCode
- `opencode-to-codex-report-01.md` — Progress report from OpenCode back to Codex
- `codex-to-opencode-correction-01.md` — Follow-up correction prompt
- `opencode-to-codex-final-report.md` — Final completion report

## Per-Phase Organization

Each phase/spec has its own subfolder. All handoff materials for that phase go in its folder.

## Shared Protocol Files

This archive also contains shared protocol files under `docs/handoffs/protocol/`
for prompt compaction:

- `compact-execution-baseline.md`
- `compact-reporting-baseline.md`
- `prompt-compaction-rules.md`

Future prompts should reference these files instead of repeating large stable
instruction blocks inline.

### When to Add Files

1. **After sending a prompt**: Save the prompt as `codex-to-opencode-prompt-NN.md`
2. **After receiving a report**: Save the report as `opencode-to-codex-report-NN.md`
3. **After sending a correction**: Save as `codex-to-opencode-correction-NN.md`
4. **After final completion**: Save as `opencode-to-codex-final-report.md`

### Who Is Responsible

- **Codex** saves prompts and correction prompts
- **OpenCode** saves progress reports and final reports
- **Both** must update this archive as part of the workflow, not as optional cleanup

## Current Phases

| Phase | Spec | Folder | Status |
|---|---|---|---|
| Phase 007 | Rich Menubar Insights and Command Center | `phase-007/` | Archived |
| Phase 008 | Visual System and Brand Refresh | `phase-008/` | Prompt/spec archived |
| Phase 009 | Success Analysis and Representation | `phase-009/` | Archived |
| Phase 010 | Session Context Audit and Compact Handoffs | `phase-010/` | Prompt/spec created |
