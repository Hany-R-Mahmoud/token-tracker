Implement a focused correction pass for Phase 011 using the compact handoff protocol.

Read first:

- `/Users/hanyramadan/token traker/docs/research/phase-011-claude-provider-source-validation.md`
- `/Users/hanyramadan/token traker/specs/011-claude-provider-local-ingestion/spec.md`
- `/Users/hanyramadan/token traker/specs/011-claude-provider-local-ingestion/tasks.md`
- `/Users/hanyramadan/token traker/specs/011-claude-provider-local-ingestion/quickstart.md`
- `/Users/hanyramadan/token traker/docs/handoffs/phase-011/opencode-to-codex-final-report.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-execution-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/compact-reporting-baseline.md`
- `/Users/hanyramadan/token traker/docs/handoffs/protocol/prompt-compaction-rules.md`

Mission:

Correct the real Phase 011 Claude adapter defects so the implementation is
actually trustworthy, not just green on build/typecheck.

Verified defects to fix:

1. `providerSessionId` is derived from the wrong field.
   The current adapter reads `session_id`, but the observed real Claude logs on
   this machine use `sessionId`.
   Result today: fallback ids like `claude-1775421206103` appear in CLI output.
   Fix this so Claude session identities are stable and idempotent.

2. Synthetic responses are not filtered correctly.
   The current adapter checks `is_synthetic`, but the real files we inspected
   expose synthetic assistant records primarily via `message.model === "<synthetic>"`.
   Result today: imported Claude sessions can show model `<synthetic>`.
   Fix model selection and any related heuristics so real assistant models win.

3. `toolCallCount` is overcounted.
   The current implementation treats any array-shaped `message.content` as a tool call.
   Real Claude content often uses content arrays for normal text/thinking blocks.
   Fix this so tool-call counting is evidence-based and honest.

Concrete evidence from Codex verification:

- `node packages/cli/dist/index.js sessions --provider claude --limit 5`
  currently shows synthetic fallback ids and `<synthetic>` models.
- `node packages/cli/dist/index.js analyze <latest-claude-session-id>`
  currently shows a Claude session with:
  - model `qwen3:8b`
  - title `<command-message>agent-implementer</command-message>`
  - high context pressure
  That row proves real usage is importable; the defects are in identity/model/tool parsing.

Files to inspect first:

- `/Users/hanyramadan/token traker/packages/core/src/adapters/claude.ts`
- `/Users/hanyramadan/token traker/packages/core/src/adapters/claude.test.ts`

Phase-specific rules:

1. Keep this a correction pass, not a redesign.
2. Do not widen scope into OAuth, browser cookies, or reset/quota work.
3. Prefer real observed Claude file schema over guessed alternate schemas.
4. Update tests to cover the actual failure modes above.
5. Re-run the specific CLI checks that exposed the defects.
6. Only mark Phase 011 complete again if the corrected implementation removes
   fallback synthetic ids/models from normal imported Claude sessions.

Required validation:

- `npm run build`
- `npm run typecheck`
- `node --test packages/core/dist/adapters/claude.test.js`
- `node packages/cli/dist/index.js doctor`
- `node packages/cli/dist/index.js import`
- `node packages/cli/dist/index.js sessions --provider claude --limit 5`
- `node packages/cli/dist/index.js analyze <latest-claude-session-id>`

Report back using the shared reporting baseline and explicitly answer:

1. Are Claude session ids now stable and sourced from the real session field?
2. Do normal imported Claude sessions still show `<synthetic>` as the model?
3. What exact record shape now counts as a Claude tool call?
4. Is Phase 011 now truly complete, or still partial?
