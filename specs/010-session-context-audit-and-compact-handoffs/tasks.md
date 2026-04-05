# Tasks: Session Context Audit And Compact Handoffs

- [ ] T001 Start with `agent-orchestrator` and assign ownership across shared model, product surfaces, and docs/protocol work
- [ ] T002 Read the Phase 010 research cornerstone and compact handoff protocol files before implementation
- [ ] T003 Define the shared session context-audit model and derived types in the core/domain layer
- [ ] T004 Implement context breakdown derivation for user, assistant, tool, cache, reasoning, verification, and other categories where observable
- [ ] T005 Implement `contextUsagePercent` and `contextPressureState` derivation with honest fallback behavior
- [ ] T006 Implement evidence-based context warning heuristics without exposing raw private content
- [ ] T007 Bridge context audit outputs to Phase 009 success analysis so detail views can explain "high context / low value" or similar conditions
- [ ] T008 Update session detail to add facts, primary stacked breakdown bar, warnings, and raw lineage/evidence section
- [ ] T009 Update overview to surface context health summary and the most context-heavy sessions
- [ ] T010 Update analytics to add context composition, pressure distribution, cost-vs-pressure, and success-vs-pressure views
- [ ] T011 Update menubar to add a compact context health cue without making the shell noisy
- [ ] T012 Update CLI session detail output to include context breakdown and pressure warnings
- [ ] T013 Adopt the compact execution/reporting baseline files for the Phase 010 handoff itself
- [ ] T014 Save Phase 010 prompt/report artifacts in the handoff archive using the established naming convention
- [ ] T015 Run `agent-tester` on model derivation, required surfaces, and privacy boundaries
- [ ] T016 Run `agent-reviewer` for regressions, semantic honesty, and architectural fit
- [ ] T017 Run `agent-docs` to reconcile README, handoff docs, and any parity/roadmap docs affected by Phase 010
