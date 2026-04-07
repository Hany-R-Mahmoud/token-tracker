# Plan: Claude Provider Local Ingestion

## Phase Path

1. Validate the exact Claude source shape on this machine and in the reference
   docs
2. Build a boring `ClaudeAdapter` that follows the existing provider contract
3. Wire Claude into CLI import / doctor / providers and the core package export
4. Verify Claude flows through current desktop summary / analytics behavior
5. Reconcile provider-status and parity docs so product language matches reality

## Workstreams

### Workstream A: Source Qualification

- confirm valid Claude session file patterns
- exclude noise-only files such as plugin skill-injection logs
- define the stable checkpoint strategy for per-file incremental imports

### Workstream B: Adapter Implementation

- implement discovery from `~/.claude/projects/**/*.jsonl`
- parse message/timestamp/model/token fields conservatively
- compute pricing through the shared pricing reader
- emit canonical seeds without leaking transcript text

### Workstream C: Product Wiring

- export `ClaudeAdapter` from `@ttm/core`
- include it in CLI doctor/import
- ensure provider status is updated from unavailable to validated
- verify no desktop/provider-summary code assumes only Codex + OpenCode

### Workstream D: Verification And Docs

- add fixtures and duplicate-import tests
- manually verify provider summaries and filters after import
- update provider matrix / support language / quickstart guidance

## Risks

- Claude JSONL record shapes may vary across versions or local setups
- noise files under `.claude/projects/` may resemble sessions if qualification is
  too loose
- model names may not always map cleanly to known pricing
- synthetic assistant/error records may inflate counts if treated naively
- desktop surfaces might have layout assumptions around the current provider set

## Mitigations

- qualify session files by record family, not path alone
- prefer conservative parsing over broad assumptions
- emit stable parser warnings for degraded or partial files
- keep reset-window handling null unless real evidence exists
- test at least one real-session fixture and one noise-file fixture

## Completion Gates

- implementation gate: Claude adapter exists and imports real sessions
- correctness gate: duplicate imports do not create duplicate sessions
- honesty gate: no false quota/reset claims for Claude
- UX gate: Claude appears in existing product surfaces without odd breakage
- docs gate: provider support docs and matrix match shipped behavior
