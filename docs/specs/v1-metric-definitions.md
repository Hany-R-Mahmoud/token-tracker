# V1 Metric Definitions

## Goal

Metrics should help users make decisions, not just admire dashboards.

Every metric in v1 must be:

- explainable
- locally computable
- robust to imperfect provider data
- safe to display without pretending to know more than we know

## Success Analysis Metrics (Phase 009)

These metrics model success as an evidence-weighted judgment rather than a
single opaque score. They combine provider-native signals, optional local
evidence, and contradiction detection.

### Completion State

Definition:
Whether the session appears to have finished meaningful work from the
provider/session perspective.

Values:
- `completed`: strong provider-native completion evidence
- `partial`: some progress, but no strong completion
- `abandoned`: session stopped without completion and with weak forward signal
- `reverted`: signals suggest reversal or contradiction after apparent progress
- `unknown`: not enough evidence to classify

Display rule:
- show as a badge alongside outcome
- never present as ground truth

### Verification State

Definition:
Whether success appears to be technically confirmed by durable evidence.

Values:
- `verified`: explicit technical or durable completion evidence exists
- `probable`: positive completion signals exist, but proof is incomplete
- `contradicted`: evidence undermines apparent success
- `missing`: verification evidence was not observed

Display rule:
- missing verification lowers confidence, does not imply failure
- only show `verified` when real verification evidence exists

### Success Score

Definition:
A 0-100 estimate of whether this session likely produced useful progress.

Derived from weighted success signals scaled by analysis confidence.

Display rule:
- show alongside confidence indicator
- color-code: green (>=70), yellow (40-69), red (<40)

### Execution Quality Score

Definition:
How efficiently was progress reached? Strongly influenced by loops, retries,
recovery cost, context inefficiency, and error-heavy execution.

### Rework Score

Definition:
How much churn, reversal, or repair burden happened? Captures the "it moved
forward but expensively and messily" story.

### Value Density Score

Definition:
How much useful progress was achieved relative to spend, tokens, and time?
The strongest answer to "was the consumption worth it?"

### Analysis Confidence

Definition:
How much trustworthy evidence exists for the judgment. Separate from success
itself.

Computed from:
- quantity of evidence
- diversity of evidence levels (provider, repo, verification commands)
- consistency of evidence
- contradiction penalties

Display rule:
- show as percentage with high/moderate/low indicator
- missing verification evidence lowers this more than success evidence

### Success Signals

Typed evidence items that feed the scores:

| Kind | Direction | Description |
|---|---|---|
| `provider_completion` | positive/negative | Task complete markers, session duration |
| `verification_command` | positive/negative | Test/build/lint success or failure |
| `repo_change` | positive/negative | Git diff detected during session window |
| `repair_loop` | negative | Repeated repair cycles detected |
| `error_burst` | negative | Multiple errors in short succession |
| `revert_indicator` | negative | Reversal or contradiction signals |
| `cache_efficiency` | positive | Effective cache usage pattern |
| `human_stop` | neutral | Session stopped by human intervention |

Each signal carries: kind, direction, weight, confidence, label, evidence.

Display rule:
- show top positive and negative signals in session detail
- never expose raw evidence in shared surfaces (leaderboard, web)

## Core Metrics

### Total Tokens

Definition:
Sum of input, output, reasoning, and relevant cache token categories for a
session or aggregate period.

Use:
- activity volume
- provider/model comparison
- cost correlation

### Total Cost USD

Definition:
Computed from pricing snapshot plus token categories.

Use:
- daily spend
- provider cost comparison
- burn-rate forecasting

### Attempt Count

Definition:
Estimated number of distinct repair or retry cycles within a session.

Signal sources:
- repeated issue/fix turns
- repeated tool call groups
- repeated “try again”-style transitions

Display rule:
- call it “estimated attempts”

### Loop Count

Definition:
Estimated repeated back-and-forth repair loops without clear forward progress.

Use:
- inefficiency scoring
- anomaly flags

### Outcome

Definition:
Best-effort classification of likely session ending state.

Values:
- `success`
- `partial`
- `abandoned`
- `reverted`
- `unknown`

Display rule:
- always show confidence
- never present as ground truth

### Task Category

Definition:
Best-effort classification of dominant session intent.

Values:
- `bug_fix`
- `feature`
- `refactor`
- `analysis`
- `content`
- `ops`
- `other`
- `unknown`

### Efficiency Score

Definition:
A 0-100 local heuristic score estimating whether a session produced good value
for the cost and effort spent.

V1 formula:

```text
Base = 100

Penalties
- repeated loops
- high attempt count
- high waste score
- reverted / abandoned outcomes
- unusually high cost for category baseline

Bonuses
- likely success with low attempt count
- healthy cache usage
- below-baseline cost for category and provider

Final = clamp(0, 100)
```

Display rule:
- show top contributing factors alongside the number

### Waste Score

Definition:
A 0-100 estimate of how much session spend likely did not contribute to useful
progress.

Likely inputs:
- repeated loops
- repeated failed tool patterns
- high cost with poor outcome
- abnormal turn count for category baseline

### Cache Effectiveness

Definition:
How much cache usage reduced likely spend for eligible requests.

Display:
- percentage
- estimated dollars saved when supported

### Cost Per Successful Session

Definition:
Aggregate cost divided by count of sessions with likely successful outcomes
above a confidence threshold.

Use:
- provider and model comparison
- personal trend tracking

### Burn Rate

Definition:
Current spend velocity projected over the current day or week based on recent
activity windows.

Use:
- “you are trending above normal” alerts
- budget awareness

### Anomaly Score

Definition:
A relative deviation from the user’s recent personal baseline.

Use:
- unusually expensive day
- unusual provider spike
- abnormal inefficiency streak

## Confidence Rules

Use confidence bands for inferred metrics:

- `high`: 0.8-1.0
- `medium`: 0.5-0.79
- `low`: below 0.5

Low-confidence signals should be visually subdued.

## Copy Rules

Good wording:
- `Likely success`
- `Estimated attempts`
- `Best-effort category`
- `Above your normal cost range`

Bad wording:
- `AI determined this was a failure`
- `This session was definitely wasteful`
- `Your team is inefficient`

## Initial Acceptance Thresholds

We should only expose a metric in the main UI when:

- it is stable across fixture tests
- it can be explained in one or two sentences
- we can show which inputs drove it

If a metric is still noisy, keep it in CLI diagnostics first.
