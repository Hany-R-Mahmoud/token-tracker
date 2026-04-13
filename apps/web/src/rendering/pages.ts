import type { LeaderboardDatabase } from "../db.js";
import type { GitHubUser, Membership } from "../routes.js";
import {
  escapeHtml,
  formatNumber,
  encodeMemberPayload,
  buildWebNav,
  buildBrandLockup,
  wrapWithDoctype,
  buildLeaderboardDrawerScript,
} from "./components.js";
import {
  MINIMUM_PARTICIPATION_THRESHOLD,
  computeLeaderboardSnapshot,
} from "../scoring.js";
import { syncLocalSessions } from "../ingestion.js";

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

export function buildHomePage(
  db: LeaderboardDatabase,
  githubUser: { githubId: number; username: string; displayName: string | null } | null,
  membership: { optedIn: boolean } | null,
  localDb?: unknown,
): string {
  const isConnected = githubUser !== null;
  const isOptedIn = membership?.optedIn ?? false;

  const connectionCard = isConnected
    ? `<p>Connected as <strong>${escapeHtml(githubUser.displayName ?? githubUser.username)}</strong> (<code>@${escapeHtml(githubUser.username)}</code>) <span class="status-badge status-connected">Connected</span></p>`
    : `<p>Not connected to GitHub. <a href="/auth/github">Connect GitHub</a> to participate.</p>`;

  const visibilityCard = !isConnected
    ? '<p class="empty">Connect GitHub first to manage leaderboard visibility.</p>'
    : isOptedIn
      ? `<p>You are <strong>visible</strong> on the team leaderboard. <span class="status-badge status-opted-in">Opted In</span></p>
         <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Your aggregated efficiency stats are visible to teammates. Raw session data, prompts, and code are never shared.</p>
         <form method="post" action="/settings/opt-out" style="margin-top:12px"><button type="submit" class="btn btn-secondary">Opt Out</button></form>`
      : `<p>You are <strong>not visible</strong> on the team leaderboard. <span class="status-badge status-opted-out">Opted Out</span></p>
         <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Opt in to appear on the leaderboard with your aggregated efficiency stats.</p>
         <form method="post" action="/settings/opt-in" style="margin-top:12px"><button type="submit" class="btn">Opt In</button></form>`;

  const html = `${buildWebNav("home")}
  <h1>Team Leaderboard</h1>
  <p class="subtitle">Private, team-scoped, efficiency-oriented ranking. Not a public leaderboard.</p>

  <div class="card">
    <h2>Connection Status</h2>
    ${connectionCard}
  </div>

  <div class="card ${isOptedIn ? "opt-in-card" : "opt-out-card"}">
    <h2>Leaderboard Visibility</h2>
    ${visibilityCard}
  </div>

  ${buildPrivacyPolicyCard()}`;

  return wrapWithDoctype(html);
}

function buildPrivacyPolicyCard(): string {
  const { TTM_PRIVACY_POLICY } = require("@ttm/core");
  return `<div class="card">
    <h2>Privacy Policy</h2>
    <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">Version ${escapeHtml(TTM_PRIVACY_POLICY.version)}</p>
    <h3 style="font-size:13px;font-weight:600;margin:8px 0 4px">What is shared when you opt in:</h3>
    <ul class="privacy-list">${TTM_PRIVACY_POLICY.sharedData.map((item: string) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3 style="font-size:13px;font-weight:600;margin:8px 0 4px">What is NEVER shared:</h3>
    <ul class="privacy-list">${TTM_PRIVACY_POLICY.neverSharedData.map((item: string) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Admins cannot override your visibility choice.</p>
  </div>`;
}

export function buildSettingsPage(
  db: LeaderboardDatabase,
  githubUser: { username: string; displayName: string | null } | null,
  membership: { optedIn: boolean } | null,
): string {
  const connectionCard = githubUser
    ? `<p>Connected as <strong>${escapeHtml(githubUser.displayName ?? githubUser.username)}</strong></p>
       <form method="post" action="/auth/disconnect" style="margin-top:12px"><button type="submit" class="btn btn-danger">Disconnect GitHub</button></form>`
    : `<p>Not connected.</p><a href="/auth/github" class="btn">Connect GitHub</a>`;

  const optInCard = !githubUser
    ? '<p class="empty">Connect GitHub first.</p>'
    : membership?.optedIn
      ? '<p>You are currently <strong>opted in</strong> to the team leaderboard.</p><form method="post" action="/settings/opt-out"><button type="submit" class="btn btn-secondary">Opt Out</button></form>'
      : '<p>You are currently <strong>opted out</strong> of the team leaderboard.</p><form method="post" action="/settings/opt-in"><button type="submit" class="btn">Opt In</button></form>';

  const html = `${buildWebNav("settings")}
  <h1>Settings</h1>
  <p class="subtitle">Manage your GitHub connection and leaderboard preferences.</p>

  <div class="card">
    <h2>GitHub Connection</h2>
    ${connectionCard}
  </div>

  <div class="card">
    <h2>Leaderboard Opt-In</h2>
    ${optInCard}
  </div>`;

  return wrapWithDoctype(html);
}

export function buildLeaderboardPage(
  db: LeaderboardDatabase,
  teamId: string,
  githubId: number | null,
  period: string,
): string {
  const windowDays = periodToDays(period);
  computeAndSaveSnapshot(db, teamId, windowDays);

  const snapshot = db.getSnapshot(teamId, windowDays);
  const team = db.getTeam(teamId);
  const members = db.getOptedInMembers(teamId);
  const currentMembership = githubId
    ? db.getMembership(githubId, teamId)
    : null;

  let myRank: { rank: number; totalMembers: number } | null = null;
  if (snapshot && githubId) {
    try {
      const entries = JSON.parse(snapshot.entriesJson) as Array<{
        rank: number;
        githubId: number;
      }>;
      const myEntry = entries.find((e) => e.githubId === githubId);
      if (myEntry) {
        myRank = { rank: myEntry.rank, totalMembers: entries.length };
      }
    } catch {
      // Ignore parse errors
    }
  }

  let myRankCard = "";
  if (myRank) {
    myRankCard = `<div class="card" style="border-left:4px solid var(--accent)">
      <h2>My Rank</h2>
      <p style="font-size:24px;font-weight:700">#${myRank.rank} <span style="font-size:14px;color:var(--text-secondary)">of ${myRank.totalMembers}</span></p>
      <p style="font-size:12px;color:var(--text-secondary)">You are visible on the leaderboard. <a href="/settings">Manage visibility</a></p>
    </div>`;
  } else if (currentMembership?.optedIn) {
    myRankCard = `<div class="card" style="border-left:4px solid var(--critical)">
      <h2>My Rank</h2>
      <p class="empty">Not enough sessions to appear on the leaderboard. Minimum ${MINIMUM_PARTICIPATION_THRESHOLD} sessions required.</p>
    </div>`;
  }

  const periods = [
    { key: "week", label: "Week" },
    { key: "month", label: "30 days" },
    { key: "all_time", label: "All time" },
  ];
  const periodTabs = `<div style="display:flex;gap:8px;margin-bottom:16px">
    ${periods
      .map((p) => {
        const isActive = p.key === period;
        const cls = isActive
          ? 'status-badge" style="background:var(--accent);color:#003828'
          : 'status-badge" style="background:var(--bg-panel-strong);color:var(--text-secondary)';
        return `<a href="/leaderboard?period=${p.key}" class="${cls}">${p.label}</a>`;
      })
      .join("")}
  </div>`;

  let entriesHtml = "";
  if (snapshot) {
    try {
      const entries = JSON.parse(snapshot.entriesJson) as Array<{
        rank: number;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        efficiencyScore: number;
        sessionCount: number;
        totalTokens: number;
        totalCostUsd: number;
        averageCacheHitRate: number | null;
        outcomeSuccessRate: number | null;
        githubId: number;
      }>;

      entriesHtml = entries
        .map((e) => {
          const successRate =
            e.outcomeSuccessRate !== null
              ? `${(e.outcomeSuccessRate * 100).toFixed(0)}%`
              : "—";
          const cacheRate =
            e.averageCacheHitRate !== null
              ? `${(e.averageCacheHitRate * 100).toFixed(0)}%`
              : "—";
          const isCurrentUser = e.githubId === githubId;
          const rowStyle = isCurrentUser
            ? 'style="background:rgba(163,255,217,0.08)"'
            : "";
          const memberData = encodeMemberPayload({
            displayName: e.displayName ?? e.username,
            username: e.username,
            efficiencyScore: e.efficiencyScore,
            sessionCount: e.sessionCount,
            totalTokens: e.totalTokens,
            totalCostUsd: e.totalCostUsd,
            averageCacheHitRate: e.averageCacheHitRate,
            outcomeSuccessRate: e.outcomeSuccessRate,
            period,
            windowDays,
          });
          return `<tr class="leaderboard-row" tabindex="0" role="button" aria-label="View details for ${escapeHtml(e.displayName ?? e.username)}" data-member-b64="${memberData}" ${rowStyle}>
          <td><strong>${e.rank}</strong></td>
          <td>${escapeHtml(e.displayName ?? e.username)}${isCurrentUser ? ' <span class="status-badge status-connected">You</span>' : ""}</td>
          <td><strong>${e.efficiencyScore.toFixed(0)}</strong></td>
          <td>${e.sessionCount}</td>
          <td>${formatNumber(e.totalTokens)}</td>
          <td>$${e.totalCostUsd.toFixed(2)}</td>
          <td>${successRate}</td>
          <td>${cacheRate}</td>
        </tr>`;
        })
        .join("\n");
    } catch {
      entriesHtml =
        '<tr><td colspan="8" class="empty">Invalid snapshot data</td></tr>';
    }
  } else {
    entriesHtml =
      '<tr><td colspan="8" class="empty">No leaderboard data yet. Opt in and submit sessions to appear.</td></tr>';
  }

  const html = `${buildWebNav("leaderboard")}
  <h1>Team Leaderboard</h1>
  <p class="subtitle">${team ? escapeHtml(team.teamName) : "Team"} · ${members.length} opted-in member${members.length !== 1 ? "s" : ""}${snapshot ? ` · Last updated: ${escapeHtml(snapshot.computedAt)}` : ""}</p>

  ${myRankCard}

  <div class="card">
    ${periodTabs}
    <table>
      <thead><tr><th>Rank</th><th>Member</th><th>Efficiency</th><th>Sessions</th><th>Tokens</th><th>Cost</th><th>Success</th><th>Cache</th></tr></thead>
      <tbody>${entriesHtml}</tbody>
    </table>
  </div>

  <div class="card">
    <h2>About This Leaderboard</h2>
    <p style="font-size:13px;color:var(--text-secondary)">This leaderboard ranks team members by <strong>efficiency score</strong>, not by raw token consumption. Higher efficiency means better outcomes with less waste. It considers: outcome success rate (15%), cache utilization (20%), waste penalty (25%), efficiency (35%), and participation bonus (5%).</p>
    <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Only opted-in members with ${MINIMUM_PARTICIPATION_THRESHOLD}+ sessions appear. Raw session data, prompts, and code are never shared. Admins cannot override visibility choices. Click a row or press Enter to view member details.</p>
  </div>

  ${buildLeaderboardDrawerScript()}`;

  return wrapWithDoctype(html);
}

export function buildApiResponse(data: unknown): string {
  return JSON.stringify(data);
}

export function buildApiError(error: string, statusCode: number = 400): string {
  return JSON.stringify({ error });
}