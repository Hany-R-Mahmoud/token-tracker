export const SCORE_VERSION = 'v1-alpha';

export const METRIC_DESCRIPTIONS = {
  anomalyScore: 'Relative deviation from the recent personal baseline.',
  attemptCount: 'Estimated number of retry or repair cycles in the session.',
  efficiencyScore:
    'Heuristic score estimating value produced relative to effort and cost.',
  loopCount: 'Estimated repeated repair loops without clear forward progress.',
  wasteScore: 'Estimated portion of spend that likely did not add useful progress.',
} as const;

