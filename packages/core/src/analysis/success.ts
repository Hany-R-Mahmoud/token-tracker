import type {
  CanonicalSessionSeed,
  CompletionState,
  VerificationState,
  SuccessSignal,
  SuccessSignalKind,
  SessionSuccessAnalysis,
  SessionOutcome,
} from '../domain/session.js';

const ANALYSIS_VERSION = '1.0.0';

/**
 * Analyze a session for success signals and compute derived scores.
 *
 * This is the shared success-truth layer — scoring policy lives here,
 * not in adapters.
 *
 * Evidence levels:
 * - Level 1: provider/session metadata (always available)
 * - Level 2: git/repo evidence (when projectPath is a git repo)
 * - Level 3: verification-command evidence (when detectable)
 *
 * When Level 2/3 evidence is unavailable, confidence is lowered but
 * failure is NOT implied.
 */
export function analyzeSuccess(seed: CanonicalSessionSeed, outcome: SessionOutcome): SessionSuccessAnalysis {
  const signals = collectSignals(seed, outcome);
  const completionState = determineCompletionState(outcome, signals);
  const verificationState = determineVerificationState(seed, signals);
  const analysisConfidence = computeConfidence(signals);
  const successScore = computeSuccessScore(signals, analysisConfidence);
  const executionQualityScore = computeExecutionQuality(seed, signals);
  const reworkScore = computeReworkScore(seed, signals);
  const valueDensityScore = computeValueDensity(seed, successScore);

  return {
    completionState,
    verificationState,
    successScore,
    executionQualityScore,
    reworkScore,
    valueDensityScore,
    analysisConfidence,
    successSignals: signals,
  };
}

// --- Signal Collection ---

function collectSignals(seed: CanonicalSessionSeed, outcome: SessionOutcome): SuccessSignal[] {
  const signals: SuccessSignal[] = [];

  // Level 1: Provider-native completion evidence
  const taskCompleted = Boolean(seed.metadata.providerMetadata.taskCompletedCount);
  if (taskCompleted) {
    signals.push({
      kind: 'provider_completion',
      direction: 'positive',
      weight: 0.35,
      confidence: 0.7,
      label: 'Provider reported task completion',
      evidence: `taskCompletedCount=${seed.metadata.providerMetadata.taskCompletedCount}`,
    });
  }

  // Repair loop signal (negative)
  const taskStartedCount = (seed.metadata.providerMetadata.taskStartedCount as number) ?? 1;
  const loopCount = Math.max(0, taskStartedCount - 1);
  if (loopCount > 3) {
    signals.push({
      kind: 'repair_loop',
      direction: 'negative',
      weight: 0.2,
      confidence: 0.6,
      label: 'Excessive repair loops detected',
      evidence: `${loopCount} repair loops from ${taskStartedCount} task starts`,
    });
  } else if (loopCount > 0) {
    signals.push({
      kind: 'repair_loop',
      direction: 'negative',
      weight: 0.1,
      confidence: 0.5,
      label: 'Some repair activity detected',
      evidence: `${loopCount} repair loop(s)`,
    });
  }

  // Cache efficiency signal (positive)
  const cacheHitRate = seed.cache.hitRate ?? 0;
  if (cacheHitRate >= 0.5) {
    signals.push({
      kind: 'cache_efficiency',
      direction: 'positive',
      weight: 0.1,
      confidence: 0.8,
      label: 'Strong cache efficiency',
      evidence: `Cache hit rate: ${(cacheHitRate * 100).toFixed(0)}%`,
    });
  } else if (cacheHitRate >= 0.2) {
    signals.push({
      kind: 'cache_efficiency',
      direction: 'neutral',
      weight: 0.05,
      confidence: 0.6,
      label: 'Moderate cache usage',
      evidence: `Cache hit rate: ${(cacheHitRate * 100).toFixed(0)}%`,
    });
  }

  // Outcome-based signals
  if (outcome === 'success' && taskStartedCount <= 2) {
    signals.push({
      kind: 'provider_completion',
      direction: 'positive',
      weight: 0.15,
      confidence: 0.75,
      label: 'Quick success with minimal attempts',
      evidence: `Completed in ${taskStartedCount} attempt(s)`,
    });
  }

  if (outcome === 'abandoned') {
    signals.push({
      kind: 'human_stop',
      direction: 'negative',
      weight: 0.15,
      confidence: 0.5,
      label: 'Session appears abandoned',
      evidence: `Low message count (${seed.messageCount}) without completion`,
    });
  }

  if (outcome === 'reverted') {
    signals.push({
      kind: 'revert_indicator',
      direction: 'negative',
      weight: 0.25,
      confidence: 0.6,
      label: 'Reversion signals detected',
      evidence: 'Outcome classified as reverted',
    });
  }

  // Error burst detection (from warnings)
  const errorWarnings = seed.metadata.parserWarnings.filter(w =>
    /error|fail|exception/i.test(w)
  );
  if (errorWarnings.length >= 3) {
    signals.push({
      kind: 'error_burst',
      direction: 'negative',
      weight: 0.15,
      confidence: 0.5,
      label: 'Multiple error indicators in session',
      evidence: `${errorWarnings.length} error-related warnings`,
    });
  }

  return signals;
}

// --- Completion State ---

function determineCompletionState(outcome: SessionOutcome, signals: SuccessSignal[]): CompletionState {
  // Provider-native completion is strong evidence
  const hasCompletion = signals.some(s =>
    s.kind === 'provider_completion' && s.direction === 'positive'
  );

  if (hasCompletion) {
    return 'completed';
  }

  if (outcome === 'reverted') {
    return 'reverted';
  }

  if (outcome === 'abandoned') {
    return 'abandoned';
  }

  if (outcome === 'partial') {
    return 'partial';
  }

  return 'unknown';
}

// --- Verification State ---

function determineVerificationState(seed: CanonicalSessionSeed, signals: SuccessSignal[]): VerificationState {
  // Check for verification command evidence (Level 3)
  const hasVerification = signals.some(s => s.kind === 'verification_command');

  // Check for repo change evidence (Level 2)
  const hasRepoChange = signals.some(s => s.kind === 'repo_change' && s.direction === 'positive');

  // Contradiction signals
  const hasContradiction = signals.some(s =>
    s.kind === 'revert_indicator' || s.kind === 'error_burst'
  );

  if (hasVerification) {
    return 'verified';
  }

  if (hasContradiction) {
    return 'contradicted';
  }

  if (hasRepoChange) {
    return 'probable';
  }

  return 'missing';
}

// --- Confidence Computation ---

function computeConfidence(signals: SuccessSignal[]): number {
  if (signals.length === 0) {
    return 0.2; // Minimal confidence with no evidence
  }

  // Base confidence from quantity of evidence
  const quantityScore = Math.min(1, signals.length / 5);

  // Diversity bonus: more signal kinds = higher confidence
  const uniqueKinds = new Set(signals.map(s => s.kind));
  const diversityScore = Math.min(1, uniqueKinds.size / 4);

  // Consistency: ratio of signals that agree on direction
  const positiveCount = signals.filter(s => s.direction === 'positive').length;
  const negativeCount = signals.filter(s => s.direction === 'negative').length;
  const total = positiveCount + negativeCount;
  const consistencyScore = total > 0 ? Math.abs(positiveCount - negativeCount) / total : 0.5;

  // Contradiction penalty
  const hasContradiction = signals.some(s => s.kind === 'revert_indicator' || s.kind === 'error_burst');
  const contradictionPenalty = hasContradiction ? 0.15 : 0;

  // Weighted combination
  const raw = (quantityScore * 0.3) + (diversityScore * 0.3) + (consistencyScore * 0.4) - contradictionPenalty;

  return Math.max(0.1, Math.min(0.95, raw));
}

// --- Success Score ---

function computeSuccessScore(signals: SuccessSignal[], confidence: number): number | null {
  if (signals.length === 0) {
    return null;
  }

  // Weighted sum of signal directions
  let weightedSum = 0;
  let totalWeight = 0;

  for (const signal of signals) {
    const directionValue = signal.direction === 'positive' ? 1 : signal.direction === 'negative' ? -1 : 0;
    weightedSum += directionValue * signal.weight * signal.confidence;
    totalWeight += signal.weight;
  }

  if (totalWeight === 0) {
    return null;
  }

  // Normalize to 0-100 scale
  const raw = (weightedSum / totalWeight + 1) / 2; // -1..1 → 0..1
  const score = raw * 100;

  // Scale by confidence — low confidence means the score is less reliable
  return Math.round(score * confidence);
}

// --- Execution Quality Score ---

function computeExecutionQuality(seed: CanonicalSessionSeed, signals: SuccessSignal[]): number {
  const taskStartedCount = (seed.metadata.providerMetadata.taskStartedCount as number) ?? 1;
  const loopCount = Math.max(0, taskStartedCount - 1);

  let score = 100;

  // Penalize for repair loops
  score -= loopCount * 8;

  // Penalize for excessive attempts
  if (taskStartedCount > 5) {
    score -= 10;
  }

  // Bonus for quick success
  const hasQuickSuccess = signals.some(s =>
    s.kind === 'provider_completion' && s.direction === 'positive' && taskStartedCount <= 2
  );
  if (hasQuickSuccess) {
    score += 10;
  }

  // Bonus for good cache usage
  const cacheHitRate = seed.cache.hitRate ?? 0;
  if (cacheHitRate >= 0.3) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

// --- Rework Score ---

function computeReworkScore(seed: CanonicalSessionSeed, signals: SuccessSignal[]): number {
  const taskStartedCount = (seed.metadata.providerMetadata.taskStartedCount as number) ?? 1;
  const loopCount = Math.max(0, taskStartedCount - 1);

  // Base rework from loops
  let score = Math.min(100, loopCount * 15);

  // Additional rework from error bursts
  const errorBurst = signals.find(s => s.kind === 'error_burst');
  if (errorBurst) {
    score = Math.min(100, score + 10);
  }

  // Reversion is heavy rework
  const hasRevert = signals.some(s => s.kind === 'revert_indicator');
  if (hasRevert) {
    score = Math.min(100, score + 25);
  }

  return score;
}

// --- Value Density Score ---

function computeValueDensity(seed: CanonicalSessionSeed, successScore: number | null): number | null {
  if (successScore === null) {
    return null;
  }

  // Value density = success relative to spend (tokens + cost + time)
  const tokenTotal = seed.tokens.total;
  const costTotal = seed.costs.totalUsd;
  const durationSec = seed.durationMs ? seed.durationMs / 1000 : 0;

  // Normalize spend components (lower is better for value density)
  // Use log scale to handle wide ranges
  const tokenFactor = tokenTotal > 0 ? 1 / (1 + Math.log10(tokenTotal)) : 1;
  const costFactor = costTotal > 0 ? 1 / (1 + Math.log10(costTotal)) : 1;
  const timeFactor = durationSec > 0 ? 1 / (1 + Math.log10(durationSec)) : 1;

  // Weighted combination: success matters most, then cost efficiency
  const spendEfficiency = (tokenFactor * 0.3) + (costFactor * 0.4) + (timeFactor * 0.3);

  return Math.round(successScore * spendEfficiency);
}

export { ANALYSIS_VERSION };
