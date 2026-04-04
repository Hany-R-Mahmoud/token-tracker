import type { LeaderboardEntry } from '@ttm/core';

export interface SessionData {
  userId: string;
  sessionCount: number;
  totalTokens: number;
  totalCostUsd: number;
  averageEfficiency: number | null;
  averageCacheHitRate: number | null;
  averageWasteScore: number | null;
  outcomeSuccessRate: number | null;
}

export interface CompositeScoreResult {
  efficiencyScore: number;
  components: {
    efficiency: number;
    cacheUtilization: number;
    wastePenalty: number;
    outcomeQuality: number;
    participationBonus: number;
  };
}

// Minimum sessions required to appear on leaderboard
const MINIMUM_PARTICIPATION_THRESHOLD = 3;

// Weights for composite score (sum to 1.0)
const WEIGHTS = {
  efficiency: 0.35,       // Primary: how efficiently tokens are used
  cacheUtilization: 0.20, // Bonus for good cache hit rates
  wastePenalty: 0.25,     // Penalty for high waste scores (inverted)
  outcomeQuality: 0.15,   // Bonus for high outcome success rates
  participationBonus: 0.05, // Small bonus for active participation
};

export function computeCompositeScore(data: SessionData): CompositeScoreResult | null {
  if (data.sessionCount < MINIMUM_PARTICIPATION_THRESHOLD) {
    return null;
  }

  // Normalize each component to 0-100 scale
  const efficiency = clamp((data.averageEfficiency ?? 0) * 100, 0, 100);
  const cacheUtilization = clamp((data.averageCacheHitRate ?? 0) * 100, 0, 100);
  const wastePenalty = clamp(100 - ((data.averageWasteScore ?? 50) * 100), 0, 100);
  const outcomeQuality = clamp((data.outcomeSuccessRate ?? 0) * 100, 0, 100);

  // Participation bonus: logarithmic scaling, max 100 at 50+ sessions
  const participationBonus = clamp(Math.log2(data.sessionCount + 1) / Math.log2(51) * 100, 0, 100);

  const efficiencyScore = (
    efficiency * WEIGHTS.efficiency +
    cacheUtilization * WEIGHTS.cacheUtilization +
    wastePenalty * WEIGHTS.wastePenalty +
    outcomeQuality * WEIGHTS.outcomeQuality +
    participationBonus * WEIGHTS.participationBonus
  );

  return {
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
    components: {
      efficiency: Math.round(efficiency * 100) / 100,
      cacheUtilization: Math.round(cacheUtilization * 100) / 100,
      wastePenalty: Math.round(wastePenalty * 100) / 100,
      outcomeQuality: Math.round(outcomeQuality * 100) / 100,
      participationBonus: Math.round(participationBonus * 100) / 100,
    },
  };
}

export function computeLeaderboardSnapshot(
  sessions: SessionData[],
  users: Array<{
    userId: string;
    githubId: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  }>,
): LeaderboardEntry[] {
  const userMap = new Map(users.map((u) => [u.userId, u]));

  // Compute scores for each user
  const scored = sessions
    .map((data) => {
      const score = computeCompositeScore(data);
      if (!score) return null;

      const user = userMap.get(data.userId);
      if (!user) return null;

      return {
        rank: 0, // Will be assigned after sorting
        userId: data.userId,
        githubId: user.githubId,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        efficiencyScore: score.efficiencyScore,
        sessionCount: data.sessionCount,
        totalTokens: data.totalTokens,
        totalCostUsd: data.totalCostUsd,
        averageCacheHitRate: data.averageCacheHitRate,
        wasteScore: data.averageWasteScore,
        outcomeSuccessRate: data.outcomeSuccessRate,
      };
    })
    .filter((entry): entry is LeaderboardEntry => entry !== null);

  // Sort by efficiency score (descending), then by session count (descending) as tie-breaker
  scored.sort((a, b) => {
    if (a.efficiencyScore !== b.efficiencyScore) {
      return b.efficiencyScore - a.efficiencyScore;
    }
    return b.sessionCount - a.sessionCount;
  });

  // Assign ranks (handle ties: same score = same rank)
  let rank = 1;
  for (let i = 0; i < scored.length; i++) {
    if (i > 0 && scored[i].efficiencyScore < scored[i - 1].efficiencyScore) {
      rank = i + 1;
    }
    scored[i].rank = rank;
  }

  return scored;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export { MINIMUM_PARTICIPATION_THRESHOLD };
