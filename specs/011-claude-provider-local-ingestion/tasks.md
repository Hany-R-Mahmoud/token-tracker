# Tasks: Claude Provider Local Ingestion

- [x] T001 Start with `agent-orchestrator` and assign ownership across source qualification, adapter implementation, verification, and docs
- [x] T002 Read `docs/reference-products.md`, the Phase 011 research note, the provider adapter contract, and the current Claude/provider-status code paths before editing
- [x] T003 Implement `packages/core/src/adapters/claude.ts` using the existing provider-adapter contract and the same boring style as `codex.ts` / `opencode.ts`
- [x] T004 Discover Claude sources from `~/.claude/projects/**/*.jsonl` and exclude known noise files such as `skill-injections.jsonl`
- [x] T005 Parse Claude session identity, timing, model, message counts, and token usage conservatively from JSONL records
- [x] T006 Aggregate Claude costs through the shared pricing reader without fabricating pricing for unknown models
- [x] T007 Add file-based checkpointing so repeated imports remain idempotent
- [x] T008 Export `ClaudeAdapter` from `packages/core/src/index.ts`
- [x] T009 Wire Claude into CLI `doctor`, `import`, and provider-status flows in `packages/cli/src/index.ts`
- [x] T010 Update provider-status entries so Claude is no longer reported as unavailable once the adapter ships
- [x] T011 Verify existing desktop summary / analytics surfaces include Claude naturally after import, without quota/reset overclaim
- [x] T012 Add fixture-based tests for real Claude session parsing, malformed lines, noise-file exclusion, and duplicate import behavior
- [x] T013 Optionally add safe `stats-cache.json` enrichment only if it is simple, local, and clearly non-blocking
- [x] T014 Reconcile `specs/006e-provider-validation-and-support-closure/provider-matrix.md` and any other stale Claude-support language
- [x] T015 Run `agent-tester` on import behavior, CLI output, and honesty around reset-window absence
- [x] T016 Run `agent-reviewer` for architectural fit, privacy boundaries, and boring-adapter discipline
- [x] T017 Run `agent-docs` after validation to update support language and any quickstart notes affected by Claude shipping