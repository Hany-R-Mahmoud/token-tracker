# V1 Metric Definitions

## Goal

Metrics should help users make decisions, not just admire dashboards.

Every metric in v1 must be:

- explainable
- locally computable
- robust to imperfect provider data
- safe to display without pretending to know more than we know

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
