# Quickstart: Success Analysis And Representation

Required checks:

- sessions now carry completion state, verification state, confidence, and
  success-signal outputs
- adapters remain free of product scoring policy
- missing verification evidence lowers confidence and does not imply failure
- contradiction evidence lowers confidence and success appropriately
- existing fields such as `outcome`, `efficiencyScore`, and `wasteScore` still
  populate for backward compatibility
- CLI output includes verification state, confidence, and signal-aware success
  framing
- overview renders outcome-aware success framing, not cost-only framing
- analytics renders a success funnel, verification-state breakdown, and at least
  one rework or value-density view
- menubar renders a compact success cue without losing glanceability
- leaderboard only uses aggregated, privacy-safe success-aware metrics
- no surface leaks raw git details, raw test traces, or other sensitive local
  evidence
- docs do not overclaim "verified" or "success truth" where the evidence is
  only probable

Implementation acceptance tests should include:

- verified success + low rework
- probable success + missing verification
- contradicted / revert-like outcome
- abandoned session
- high-cost low-progress session
- no repo present
- repo present but no diff
- repo diff detected
- verification evidence detected
- contradictory evidence lowers confidence
