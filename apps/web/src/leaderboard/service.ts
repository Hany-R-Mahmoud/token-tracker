import type { LeaderboardEntry } from "@ttm/core";
import type { LeaderboardDatabase } from "../storage/db.js";
import { computeLeaderboardSnapshot } from "./scoring.js";

interface SessionData {
  userId: string;
  sessionCount: number;
  totalTokens: number;
  totalCostUsd: number;
  averageEfficiency: number | null;
  averageCacheHitRate: number | null;
  averageWasteScore: number | null;
  outcomeSuccessRate: number | null;
}

export function periodToDays(period: string): number {
  switch (period) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "all_time":
      return 3650;
    default:
      return 30;
  }
}

export function computeAndSaveSnapshot(
  db: LeaderboardDatabase,
  teamId: string,
  windowDays: number = 30,
): void {
  const members = db.getOptedInMembers(teamId);
  if (members.length === 0) return;

  const sessions: SessionData[] = members.map((m) => {
    const userSessions = db.getUserSessions(m.githubId, teamId, windowDays);
    if (userSessions.length === 0) {
      return {
        userId: String(m.githubId),
        sessionCount: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        averageEfficiency: null,
        averageCacheHitRate: null,
        averageWasteScore: null,
        outcomeSuccessRate: null,
      };
    }

    const totalTokens = userSessions.reduce((sum, s) => sum + s.tokenTotal, 0);
    const totalCostUsd = userSessions.reduce(
      (sum, s) => sum + s.costTotalUsd,
      0,
    );
    const efficiencies = userSessions
      .map((s) => s.efficiencyScore)
      .filter((e): e is number => e !== null);
    const cacheRates = userSessions
      .map((s) => s.cacheHitRate)
      .filter((c): c is number => c !== null);
    const wasteScores = userSessions
      .map((s) => s.wasteScore)
      .filter((w): w is number => w !== null);
    const outcomes = userSessions.map((s) => s.outcome);
    const successCount = outcomes.filter((o) => o === "success").length;

    return {
      userId: String(m.githubId),
      sessionCount: userSessions.length,
      totalTokens,
      totalCostUsd,
      averageEfficiency:
        efficiencies.length > 0
          ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
          : null,
      averageCacheHitRate:
        cacheRates.length > 0
          ? cacheRates.reduce((a, b) => a + b, 0) / cacheRates.length
          : null,
      averageWasteScore:
        wasteScores.length > 0
          ? wasteScores.reduce((a, b) => a + b, 0) / wasteScores.length
          : null,
      outcomeSuccessRate:
        outcomes.length > 0 ? successCount / outcomes.length : null,
    };
  });

  const users = members.map((m) => ({
    userId: String(m.githubId),
    githubId: m.githubId,
    username: m.username,
    displayName: m.displayName,
    avatarUrl: m.avatarUrl,
  }));

  const entries = computeLeaderboardSnapshot(sessions, users);
  const snapshotId = `snapshot-${teamId}-${windowDays}`;
  db.saveSnapshot(snapshotId, teamId, windowDays, JSON.stringify(entries));
}
