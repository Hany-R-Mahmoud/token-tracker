# Phase 009 Research: Success Analysis For Token Consumption

Last updated: 2026-04-05

## Product Question

How should Token Tracker determine whether AI token consumption was successful,
efficient, or wasteful?

This research is the cornerstone for Phase 009. It exists to move the project
beyond cost-only reporting and toward a more truthful answer to the question
users actually care about:

- did the spend produce useful progress?
- how much rework was required?
- how much confidence should we have in that judgment?

## Executive Conclusion

Raw token volume is not a value metric.

Across coding-agent benchmarks, practitioner writeups, evaluation-framework
guidance, and community discussion, the same pattern appears repeatedly:

- high token usage is not inherently bad if it resolves a meaningful task
- low token usage is not inherently good if it produces churn, dead ends, or
  unverifiable output
- successful analysis must combine:
  - task completion
  - technical verification
  - recovery/rework burden
  - cost-to-value
  - confidence / uncertainty

For Token Tracker, that means Phase 009 should model **success truth as a
layered evidence problem**, not a single score derived from token counts.

## Why This Matters For Token Tracker

Token Tracker's current strength is that it already tries to answer more than
"how much was spent." It has:

- `outcome`
- `efficiencyScore`
- `wasteScore`
- `loopCount`
- explanation factors

But the current model is still relatively narrow:

- it leans heavily on provider-native session signals
- it does not clearly separate completion from verification
- it does not distinguish "probably useful" from "actually verified"
- it does not explicitly model confidence as a first-class output

Phase 009 should evolve the product from **heuristic session scoring** into
**evidence-weighted success analysis**.

## External Research Synthesis

### 1. Coding-agent benchmarks reward resolved work, not cheap token counts

Relevant sources:

- [Agent Scaffolding Beats Model Upgrades: 42% to 78% on SWE-Bench](https://particula.tech/blog/agent-scaffolding-beats-model-upgrades-swe-bench)
- [Evaluation of LLMs as Coding Agents on SWE-Bench (at 30x Speed!)](https://openhands.dev/blog/evaluation-of-llms-as-coding-agents-on-swe-bench-at-30x-speed)
- [I benchmarked 4 coding agents on SWE-bench with the same model. The only variable was context. The cost gap was 3x.](https://www.reddit.com/r/ClaudeAI/comments/1s1gooc/i_benchmarked_4_coding_agents_on_swebench_with/)

Key takeaway:

- the meaningful unit is not "tokens burned"
- the meaningful unit is closer to:
  - cost per resolved issue
  - time per resolved issue
  - rework required before resolution

Design implication for Token Tracker:

- report spend in relation to likely progress, not as a standalone hero metric
- create analysis views that show cost-to-success and cost-to-rework, not only
  totals

### 2. Better outcomes often come from better process, not just cheaper models

Relevant sources:

- [Agent Scaffolding Beats Model Upgrades: 42% to 78% on SWE-Bench](https://particula.tech/blog/agent-scaffolding-beats-model-upgrades-swe-bench)
- [How to Choose an LLM for Your Workload: Cost, Latency, and Quality Trade-offs](https://www.stackspend.app/resources/blog/how-to-choose-llm-for-your-workload)

Observed pattern:

- context management
- tool sequencing
- recovery behavior
- verification discipline

often change outcomes more than token price alone.

Design implication for Token Tracker:

- treat process quality as part of token analysis
- repeated repair loops, contradictory edits, or costly retries should count as
  first-class waste signals

### 3. Community reports focus on hidden waste, not just visible cost

Relevant sources:

- [The AI coding productivity data is in and it's not what anyone expected](https://www.reddit.com/r/ExperiencedDevs/comments/1rnkv2t/the_ai_coding_productivity_data_is_in_and_its_not/)
- [I made small LLMs last 3x longer on agentic tasks by piggybacking context compression on every tool call](https://www.reddit.com/r/AI_India/comments/1riuy9n/i_made_small_llms_last_3x_longer_on_agentic_tasks/)

Common concerns in community discussion:

- repeated context resend
- high-cost turns that add little forward progress
- large token usage caused by poor retrieval or bloated context
- "looks productive" sessions that still end without durable output

Inference from these sources:

- users experience waste as **friction and churn**, not just as a large bill
- Token Tracker should expose "rework burden" and "value density" to make that
  friction visible

### 4. Modern evaluation guidance favors layered metrics over one opaque score

Relevant sources:

- [LLM Evaluation: Metrics, Frameworks, and What Actually Works in 2026](https://techsy.io/blog/llm-evals-guide)
- [How to Choose an LLM for Your Workload: Cost, Latency, and Quality Trade-offs](https://www.stackspend.app/resources/blog/how-to-choose-llm-for-your-workload)
- [5 Techniques to Improve LLM-Judges](https://www.reddit.com/r/LLMDevs/comments/1j3gbil)

Shared pattern:

- quality
- cost
- latency
- confidence
- failure modes

should be evaluated together.

Design implication for Token Tracker:

- avoid replacing the old score with a new opaque "magic number"
- expose a small set of interpretable dimensions
- make confidence visible so uncertain judgments are honest

## Explicit Findings For Phase 009

These findings should be locked into the Phase 009 spec:

1. Cost per successful task matters more than total tokens.
2. Repeated context resend, repair loops, contradiction, and failed
   verification are major waste signals.
3. Success needs both outcome and verification dimensions.
4. Evaluation should use layered metrics rather than one opaque score.
5. Missing evidence should reduce confidence, not silently imply failure.
6. Adapters should remain boring and only normalize provider data; product
   scoring policy belongs in the shared analysis layer.

## Proposed Metric Taxonomy

Phase 009 should introduce the following analysis concepts.

### `completionState`

Represents whether the session appears to have finished meaningful work from the
provider/session perspective.

Proposed values:

- `completed`
- `partial`
- `abandoned`
- `reverted`
- `unknown`

### `verificationState`

Represents whether success appears to be technically confirmed.

Proposed values:

- `verified`
- `probable`
- `contradicted`
- `missing`

Interpretation:

- `verified`: there is explicit evidence of validation or durable completion
- `probable`: there are positive completion signals, but not enough hard proof
- `contradicted`: strong negative evidence undermines apparent success
- `missing`: no verification evidence was observed

### `successScore`

Measures:

- did this session likely produce useful progress?

This is not purely technical completion. It is a weighted product judgment based
on multiple signals.

### `executionQualityScore`

Measures:

- how efficiently was that progress reached?

This should be strongly influenced by:

- loops
- retries
- recovery cost
- context inefficiency
- error-heavy execution

### `reworkScore`

Measures:

- how much churn, reversal, or repair burden happened?

This is the best home for the "it technically moved forward, but expensively and
messily" story.

### `valueDensityScore`

Measures:

- how much useful progress was achieved relative to spend, tokens, and time?

This is the strongest answer to "was the consumption worth it?"

### `analysisConfidence`

Measures:

- how much trustworthy evidence exists for the judgment?

This must stay separate from success itself.

## Proposed Signal Hierarchy

Phase 009 should treat success analysis as evidence synthesis.

### Level 1: Provider-native completion signals

Examples:

- task complete markers
- session duration and last activity
- error markers
- attempt counts
- loop counts
- cache efficiency

Why they matter:

- always available for current supported providers
- lowest-friction source of analysis

Limit:

- they often indicate process completion, not real task success

### Level 2: Local repo / git evidence

Examples:

- repo changed during or near session window
- diff size or file-touch pattern
- revert-like behavior
- no-change sessions after high spend

Why they matter:

- they provide stronger evidence that work actually changed the project

Limit:

- not all sessions happen inside repos
- a diff is not equivalent to success

### Level 3: Verification-command evidence

Examples:

- tests, builds, lint, typecheck, compile, or verification command success
- explicit failure or contradiction from those commands

Why they matter:

- strongest technical evidence that output is durable

Limit:

- not all sessions run explicit verification
- absence of verification must not be treated as failure

## Contradiction Signals

Phase 009 should also explicitly model contradiction evidence.

Examples:

- completion-like signals followed by revert indicators
- expensive sessions with repeated retries and no durable repo change
- apparent completion with clear downstream verification failure
- error-heavy assistant behavior that undermines claimed completion

These signals should lower:

- `successScore`
- `executionQualityScore`
- `analysisConfidence`

## Representation Guidance By Surface

### Overview

Should answer:

- how much did we spend?
- how much of that spend likely produced useful progress?
- how much was likely rework or low-value effort?

Recommended representation:

- success-quality hero
- verified/probable/missing breakdown
- cost-to-success visual
- rework burden highlight

### Analytics

Should answer:

- where is successful spend happening?
- where is churn concentrated?
- which providers/models produce likely value vs likely waste?

Recommended representation:

- success funnel
- verification-state breakdown
- cost-to-success trend
- rework concentration view
- provider/model value-density comparison

### Menubar

Should answer quickly:

- is today’s spend looking healthy or suspect?

Recommended representation:

- compact success cue
- compact verification state
- glanceable rework warning when relevant

### Leaderboard

Should answer safely:

- who appears to be producing strong outcomes efficiently?

Recommended representation:

- aggregated success-aware metrics only
- no raw evidence, raw git details, or raw verification traces

### CLI

Should answer directly:

- did this session likely work?
- what evidence supports that?
- what reduced confidence?

Recommended representation:

- verification state
- confidence
- rework explanation
- signal summary

## What Token Tracker Should Not Do

- do not treat missing verification as failure
- do not let adapters own product scoring policy
- do not collapse all quality into a single vanity number
- do not pretend provider-native completion is the same as user value
- do not overclaim "success truth" where the product only has probable evidence
- do not expose private repo details or raw verification traces in shared views

## Implications For The Existing Model

Current fields such as:

- `efficiencyScore`
- `wasteScore`
- `outcome`
- `outcomeConfidence`

should remain for backward compatibility, but Phase 009 should reposition them
as part of a richer model rather than the whole model.

Practical implication:

- `efficiencyScore` becomes a summary of process quality
- `wasteScore` becomes a summary of low-value effort and rework burden
- `outcome` remains useful but should no longer stand in for complete success
  truth

## Recommended Phase 009 Direction

Inference from repo state and external research:

- Token Tracker should implement a **shared-core evidence engine**
- it should enrich current session analysis with optional local git and
  verification evidence
- it should expose success truth consistently across CLI, desktop, menubar, and
  leaderboard
- it should show confidence explicitly

That is the right next step because it builds on the project's strongest
identity:

- local-first
- operator-friendly
- honest about uncertainty
- focused on whether spend was worth it

## Sources

- [Agent Scaffolding Beats Model Upgrades: 42% to 78% on SWE-Bench](https://particula.tech/blog/agent-scaffolding-beats-model-upgrades-swe-bench)
- [Evaluation of LLMs as Coding Agents on SWE-Bench (at 30x Speed!)](https://openhands.dev/blog/evaluation-of-llms-as-coding-agents-on-swe-bench-at-30x-speed)
- [I benchmarked 4 coding agents on SWE-bench with the same model. The only variable was context. The cost gap was 3x.](https://www.reddit.com/r/ClaudeAI/comments/1s1gooc/i_benchmarked_4_coding_agents_on_swebench_with/)
- [The AI coding productivity data is in and it's not what anyone expected](https://www.reddit.com/r/ExperiencedDevs/comments/1rnkv2t/the_ai_coding_productivity_data_is_in_and_its_not/)
- [LLM Evaluation: Metrics, Frameworks, and What Actually Works in 2026](https://techsy.io/blog/llm-evals-guide)
- [How to Choose an LLM for Your Workload: Cost, Latency, and Quality Trade-offs](https://www.stackspend.app/resources/blog/how-to-choose-llm-for-your-workload)
- [5 Techniques to Improve LLM-Judges](https://www.reddit.com/r/LLMDevs/comments/1j3gbil)
- [I made small LLMs last 3x longer on agentic tasks by piggybacking context compression on every tool call](https://www.reddit.com/r/AI_India/comments/1riuy9n/i_made_small_llms_last_3x_longer_on_agentic_tasks/)
