import { SCORE_VERSION } from './metrics.js';
import { analyzeSuccess } from './success.js';
import type {
  CanonicalSession,
  CanonicalSessionSeed,
  ScoreFactor,
  SessionOutcome,
  TaskCategory,
} from '../domain/session.js';
import { stableHash } from '../utils/hash.js';

export function enrichSession(seed: CanonicalSessionSeed): CanonicalSession {
  const attemptCount = Math.max(1, seed.metadata.providerMetadata.taskStartedCount as number ?? 1);
  const loopCount = Math.max(0, attemptCount - 1);
  const taskCategory = inferTaskCategory(seed.title);
  const outcome = inferOutcome(seed);
  const outcomeConfidence = outcome === 'unknown' ? 0.2 : 0.6;
  const taskCategoryConfidence = taskCategory === 'unknown' ? 0.2 : 0.55;
  const wasteScore = Math.min(100, loopCount * 15);
  const efficiencyScore = calculateEfficiencyScore({
    attemptCount,
    loopCount,
    outcome,
    cacheHitRate: seed.cache.hitRate,
    wasteScore,
  });
  const factors = buildScoreFactors({
    attemptCount,
    loopCount,
    outcome,
    cacheHitRate: seed.cache.hitRate,
  });
  const id = stableHash([
    seed.provider,
    seed.providerSessionId,
    seed.sourcePath,
    seed.startedAt,
  ]);

  return {
    ...seed,
    id,
    attemptCount,
    outcome,
    outcomeConfidence,
    taskCategory,
    taskCategoryConfidence,
    efficiencyScore,
    wasteScore,
    anomalyScore: null,
    loopCount,
    flags: buildFlags({ loopCount, outcome, cacheHitRate: seed.cache.hitRate }),
    successAnalysis: analyzeSuccess(seed, outcome),
    explanation: {
      scoreVersion: SCORE_VERSION,
      outcomeReasons: [`Outcome inferred as ${outcome} from Codex event patterns.`],
      scoreFactors: factors,
      wasteReasons:
        loopCount > 0
          ? [`Estimated ${loopCount} repeated repair loop(s) from repeated task starts.`]
          : [],
    },
  };
}

function inferOutcome(seed: CanonicalSessionSeed): SessionOutcome {
  const completed = Boolean(seed.metadata.providerMetadata.taskCompletedCount);
  const messageCount = seed.messageCount;

  if (completed) {
    return 'success';
  }

  if (messageCount < 3) {
    return 'abandoned';
  }

  return 'partial';
}

function inferTaskCategory(title: string | null): TaskCategory {
  const text = (title ?? '').toLowerCase();
  if (/(fix|error|bug|broken|failing|crash)/.test(text)) {
    return 'bug_fix';
  }
  if (/(add|build|implement|create|new feature)/.test(text)) {
    return 'feature';
  }
  if (/(refactor|clean|restructure|improve|optimize)/.test(text)) {
    return 'refactor';
  }
  if (/(analyze|review|explain|why|how does)/.test(text)) {
    return 'analysis';
  }
  if (/(write|draft|post|copy|email|message)/.test(text)) {
    return 'content';
  }
  return title ? 'other' : 'unknown';
}

function calculateEfficiencyScore(input: {
  attemptCount: number;
  loopCount: number;
  outcome: SessionOutcome;
  cacheHitRate: number | null;
  wasteScore: number;
}): number {
  let score = 100;
  score -= input.loopCount * 8;
  if (input.attemptCount > 5) {
    score -= 10;
  }
  if (input.outcome === 'partial') {
    score -= 10;
  }
  if (input.outcome === 'abandoned') {
    score -= 20;
  }
  if (input.outcome === 'reverted') {
    score -= 30;
  }
  if (input.wasteScore > 40) {
    score -= 15;
  }
  if (input.outcome === 'success' && input.attemptCount <= 2) {
    score += 10;
  }
  if ((input.cacheHitRate ?? 0) >= 0.3) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function buildScoreFactors(input: {
  attemptCount: number;
  loopCount: number;
  outcome: SessionOutcome;
  cacheHitRate: number | null;
}): ScoreFactor[] {
  const factors: ScoreFactor[] = [];

  if (input.loopCount > 0) {
    factors.push({
      key: 'repair_loops',
      label: `${input.loopCount} repeated repair loop(s)`,
      impact: input.loopCount * -8,
      direction: 'negative',
    });
  }

  if (input.outcome === 'success' && input.attemptCount <= 2) {
    factors.push({
      key: 'quick_success',
      label: 'Likely success with low attempt count',
      impact: 10,
      direction: 'positive',
    });
  }

  if ((input.cacheHitRate ?? 0) >= 0.3) {
    factors.push({
      key: 'cache_effective',
      label: 'Healthy cache usage',
      impact: 5,
      direction: 'positive',
    });
  }

  if (input.outcome === 'partial' || input.outcome === 'abandoned') {
    factors.push({
      key: 'incomplete_outcome',
      label: `Likely ${input.outcome} outcome`,
      impact: input.outcome === 'partial' ? -10 : -20,
      direction: 'negative',
    });
  }

  return factors;
}

function buildFlags(input: {
  loopCount: number;
  outcome: SessionOutcome;
  cacheHitRate: number | null;
}): string[] {
  const flags: string[] = [];

  if (input.loopCount > 0) {
    flags.push('repair_loops_detected');
  }
  if ((input.cacheHitRate ?? 0) >= 0.3) {
    flags.push('healthy_cache_usage');
  }
  if (input.outcome !== 'success') {
    flags.push(`outcome_${input.outcome}`);
  }

  return flags;
}

