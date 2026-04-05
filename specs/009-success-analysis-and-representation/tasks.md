# Tasks: Success Analysis And Representation

- [ ] S001 Run `agent-orchestrator` first and define shared-core, surface, and validation ownership
- [ ] S002 Review the Phase 009 research cornerstone before implementation starts
- [ ] S003 Extend the canonical session model with completion, verification, confidence, and signal fields
- [ ] S004 Create a shared evidence subsystem in the analysis layer; do not move scoring policy into adapters
- [ ] S005 Implement Level 1 provider/session signals from existing normalized metadata
- [ ] S006 Implement optional Level 2 local repo / git evidence collection
- [ ] S007 Implement optional Level 3 verification-command evidence collection when detectable
- [ ] S008 Implement score composition for `successScore`, `executionQualityScore`, `reworkScore`, `valueDensityScore`, and `analysisConfidence`
- [ ] S009 Preserve backward-compatible population of `outcome`, `outcomeConfidence`, `efficiencyScore`, and `wasteScore`
- [ ] S010 Update CLI outputs to include success-aware metrics, verification state, confidence, and signal explanations
- [ ] S011 Update desktop overview to add success-quality framing and cost-vs-success representation
- [ ] S012 Update analytics to add success funnel, verification breakdown, and rework/value-density views
- [ ] S013 Update menubar to add a compact success cue without harming glanceability
- [ ] S014 Update leaderboard to use aggregated success-aware metrics only, with no raw evidence exposure
- [ ] S015 Run `agent-tester` on score composition, evidence collection, compatibility, and all-surface outputs
- [ ] S016 Run `agent-reviewer` for regressions, privacy, and semantic honesty
- [ ] S017 Run `agent-docs` to reconcile README and any parity or metric docs that would overclaim certainty
