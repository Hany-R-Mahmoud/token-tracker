Implement Phase 011 using the compact handoff protocol.

Read first:

- `/Users/hanyramadan/token traker/docs/reference-products.md`
- `/Users/hanyramadan/token traker/docs/research/phase-011-claude-provider-source-validation.md`
- `/Users/hanyramadan/token traker/docs/specs/provider-adapter-contract.md`
- `/Users/hanyramadan/token traker/docs/specs/canonical-session-schema.md`
- `/Users/hanyramadan/token traker/specs/011-claude-provider-local-ingestion/spec.md`
- `/Users/hanyramadan/token traker/specs/011-claude-provider-local-ingestion/plan.md`
- `/Users/hanyramadan/token traker/specs/011-claude-provider-local-ingestion/tasks.md`
- `/Users/hanyramadan/token traker/specs/011-claude-provider-local-ingestion/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`
- `/Users/hanyramadan/token traker/docs/handoffs/README.md`

Mission:

Implement Phase 011 end to end by adding Claude as a validated **local**
provider through `~/.claude/projects/**/*.jsonl`, without widening scope into
browser auth, OAuth, or speculative quota/reset claims.

Phase-specific rules:

1. Start with `agent-orchestrator`, then use the minimum specialist set needed.
2. The core deliverable is a boring `ClaudeAdapter`, not a broad provider
   expansion program.
3. Treat `~/.claude/stats-cache.json` as optional enrichment only; its absence
   must not block completion.
4. Exclude noise files such as `skill-injections.jsonl` and avoid creating fake
   Claude sessions from plugin logs.
5. Do not claim Claude quota/reset truth unless you validate a real source for
   it in this repo and on this machine.
6. Keep transcript text ephemeral and privacy-safe; store only bounded derived
   fields.
7. Update stale provider-language/docs so Claude is no longer described as
   unavailable once the adapter is real.
8. Use the compact protocol files above instead of repeating generic execution
   and reporting boilerplate in follow-up prompts or reports.

Implementation target:

- `packages/core/src/adapters/claude.ts`
- core export wiring
- CLI import / doctor / providers wiring
- fixture-based Claude adapter tests
- provider-status and provider-matrix doc reconciliation
- validation that Claude naturally appears in existing summary / analytics flows

Validation:

- `npm run build`
- `npm run typecheck`
- Claude adapter tests and any related CLI tests
- prove that noise files do not import as Claude sessions
- prove that missing `stats-cache.json` does not block Claude import
- prove no surface falsely implies Claude quota/reset truth

Report back using the shared reporting baseline and include the Phase 011
acceptance checklist with PASS / FAIL / PARTIAL.
