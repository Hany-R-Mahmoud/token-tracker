import type { LeaderboardDatabase } from './db.js';
import type { TtmDatabase } from '@ttm/core';

export interface SyncResult {
  syncedSessions: number;
  skippedSessions: number;
  windowDays: number;
}

/**
 * Ingests analyzed sessions from the local session store into the leaderboard database.
 *
 * Ownership mapping: All local sessions are attributed to the currently
 * connected GitHub user. This is honest because:
 * - The product is local-first with a single user on this machine
 * - Sessions are already parsed from local Codex/OpenCode log files
 * - GitHub connection is an opt-in identity layer for the leaderboard
 * - No guessing or fabrication of ownership is needed
 *
 * Only aggregated fields are ingested. No raw prompts, transcripts,
 * message content, file paths, or explanation text are copied.
 *
 * Success analysis fields (completionState, verificationState, successScore,
 * executionQualityScore, reworkScore, valueDensityScore, analysisConfidence)
 * are included for aggregated leaderboard computation. Raw evidence signals
 * are never shared.
 *
 * @param leaderboardDb - The leaderboard database to write to
 * @param githubId - The GitHub user ID to attribute sessions to
 * @param teamId - The team ID to scope sessions to
 * @param windowDays - Number of days to look back (default 30)
 * @param localDb - The local session database to read from. Pass null to skip ingestion.
 */
export function syncLocalSessions(
  leaderboardDb: LeaderboardDatabase,
  githubId: number,
  teamId: string,
  windowDays: number = 30,
  localDb: TtmDatabase | null = null,
): SyncResult {
  if (!localDb) {
    return { syncedSessions: 0, skippedSessions: 0, windowDays };
  }

  // Get ALL sessions within the window (no artificial cap)
  const sessions = localDb.listSessionsForWindow(windowDays, 100_000);

  let syncedSessions = 0;
  let skippedSessions = 0;

  for (const session of sessions) {
    // Skip sessions without meaningful data
    if (session.tokenTotal === 0 && session.costTotalUsd === 0) {
      skippedSessions++;
      continue;
    }

    // Get detailed data for fields not in the list item
    const detail = localDb.getSessionDetail(session.id);
    if (!detail) {
      skippedSessions++;
      continue;
    }

    const sa = detail.successAnalysis;

    leaderboardDb.upsertSession({
      sessionId: session.id,
      githubId,
      teamId,
      provider: session.provider,
      startedAt: session.startedAt,
      endedAt: detail.endedAt,
      model: session.model,
      tokenTotal: session.tokenTotal,
      costTotalUsd: session.costTotalUsd,
      efficiencyScore: detail.efficiencyScore,
      wasteScore: detail.wasteScore,
      cacheHitRate: detail.cacheHitRate,
      outcome: session.outcome,
      outcomeConfidence: detail.outcomeConfidence,
      completionState: sa?.completionState ?? null,
      verificationState: sa?.verificationState ?? null,
      successScore: sa?.successScore ?? null,
      executionQualityScore: sa?.executionQualityScore ?? null,
      reworkScore: sa?.reworkScore ?? null,
      valueDensityScore: sa?.valueDensityScore ?? null,
      analysisConfidence: sa?.analysisConfidence ?? null,
    });

    syncedSessions++;
  }

  return { syncedSessions, skippedSessions, windowDays };
}
