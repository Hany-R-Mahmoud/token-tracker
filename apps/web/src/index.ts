import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { TtmDatabase, defaultDatabasePath } from "@ttm/core";
import { LeaderboardDatabase, defaultLeaderboardDatabasePath } from "./db.js";
import {
  computeLeaderboardSnapshot,
  type SessionData,
  MINIMUM_PARTICIPATION_THRESHOLD,
} from "./scoring.js";
import { syncLocalSessions } from "./ingestion.js";
import { TTM_PRIVACY_POLICY } from "@ttm/core";

const PORT = Number(process.env.TTM_WEB_PORT ?? "3200");
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? "";
const DEFAULT_TEAM_ID = process.env.TTM_DEFAULT_TEAM_ID ?? "default-team";
const DEFAULT_TEAM_NAME = process.env.TTM_DEFAULT_TEAM_NAME ?? "Default Team";
const ADMIN_API_KEY = process.env.TTM_ADMIN_API_KEY ?? "";
const WEB_ORIGIN = process.env.TTM_WEB_ORIGIN ?? "";
const SESSION_COOKIE_NAME = "ttm_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Rate limiting — matches desktop app thresholds
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface GitHubOAuthUser {
  githubId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
}

export interface GitHubOAuthClient {
  exchangeCodeForToken(code: string, redirectUri: string): Promise<string>;
  fetchUser(accessToken: string): Promise<GitHubOAuthUser>;
}

interface AppConfig {
  adminApiKey?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  webOrigin?: string;
  githubOAuthClient?: GitHubOAuthClient;
}

const STYLES = `
  * { box-sizing: border-box; }
  :root {
    --bg: #0b1326;
    --bg-panel: #171f33;
    --bg-panel-strong: #131b2e;
    --text: #dae2fd;
    --text-secondary: #bac9cc;
    --text-muted: #849396;
    --border: #2d3449;
    --border-strong: #3b494c;
    --accent: #a3ffd9;
    --accent-strong: #36ffc4;
    --accent-soft: rgba(163, 255, 217, 0.12);
    --critical: #b01522;
    --critical-soft: rgba(176, 21, 34, 0.14);
    --success-soft: rgba(54, 255, 196, 0.12);
  }
  body {
    font-family: "Manrope", "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif;
    max-width: 1060px;
    margin: 0 auto;
    padding: 0 18px 32px;
    color: var(--text);
    background:
      radial-gradient(circle at top right, rgba(163, 255, 217, 0.08), transparent 32%),
      var(--bg);
  }
  .nav {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(6, 14, 32, 0.92);
    backdrop-filter: blur(18px);
    padding: 12px 18px;
    margin: 0 -18px 28px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .nav-brand { margin-right: auto; }
  .brand-lockup { display: inline-flex; align-items: center; gap: 10px; }
  .brand-mark { width: 18px; height: 18px; color: var(--accent); flex-shrink: 0; }
  .brand-wordmark { color: var(--accent); font-family: "Space Grotesk", "Instrument Sans", sans-serif; font-style: italic; font-weight: 800; letter-spacing: -0.04em; text-transform: uppercase; }
  .nav a { color: var(--text-muted); text-decoration: none; font-size: 11px; padding: 6px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; }
  .nav a:hover, .nav a.active { color: var(--text); background: var(--accent-soft); }
  h1 { margin: 0 0 6px; font-family: "Space Grotesk", "Instrument Sans", sans-serif; font-size: clamp(28px, 5vw, 44px); line-height: 0.95; letter-spacing: -0.05em; text-transform: uppercase; }
  .subtitle { color: var(--text-secondary); margin-bottom: 22px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; }
  .card {
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 18px;
    margin-bottom: 16px;
  }
  .card h2 { font-family: "Space Grotesk", "Instrument Sans", sans-serif; font-size: 16px; font-weight: 700; margin: 0 0 14px; letter-spacing: -0.03em; }
  .btn { display: inline-block; padding: 9px 16px; background: var(--accent); color: #003828; border: 1px solid rgba(163,255,217,0.3); border-radius: 4px; font-size: 11px; cursor: pointer; text-decoration: none; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; }
  .btn:hover { background: var(--accent-strong); text-decoration: none; }
  .btn-secondary { background: var(--accent-soft); color: var(--text); }
  .btn-secondary:hover { background: rgba(163,255,217,0.2); }
  .btn-danger { background: var(--critical-soft); color: #ffc1bd; border-color: rgba(176,21,34,0.32); }
  .btn-danger:hover { background: rgba(176,21,34,0.22); }
  .opt-in-card { border-left: 3px solid var(--accent); }
  .opt-out-card { border-left: 3px solid var(--critical); }
  .privacy-list { margin: 8px 0; padding-left: 20px; font-size: 13px; color: var(--text-secondary); }
  .privacy-list li { margin-bottom: 4px; }
  .status-badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
  .status-connected, .status-opted-in { background: var(--success-soft); color: var(--accent); }
  .status-disconnected { background: rgba(185, 200, 222, 0.14); color: var(--text-secondary); }
  .status-opted-out { background: var(--critical-soft); color: #ffc1bd; }
  .empty { color: var(--text-secondary); font-size: 13px; text-align: center; padding: 24px 0; }
  .error { color: #ffc1bd; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid rgba(59,73,76,0.4); font-size: 13px; }
  th { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; background: var(--bg-panel-strong); }
  .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(59,73,76,0.4); }
  .detail-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.12em; }
  .detail-value { font-size: 13px; font-weight: 600; color: var(--text); }
  .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 100; display: none; }
  .drawer-overlay.open { display: block; }
  .drawer-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 360px; max-width: 90vw; background: var(--bg-panel); box-shadow: -4px 0 20px rgba(0,0,0,0.24); z-index: 101; padding: 24px; overflow-y: auto; display: none; border-left: 1px solid var(--border); }
  .drawer-panel.open { display: block; }
  .drawer-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary); }
  .drawer-close:hover { color: var(--text); }
  .leaderboard-row { cursor: pointer; }
  .leaderboard-row:hover { background: rgba(163,255,217,0.06); }
  .leaderboard-row:focus { outline: 2px solid var(--accent); outline-offset: -2px; }
  code, pre { font-family: "Geist Mono", "JetBrains Mono", monospace; font-variant-numeric: tabular-nums; }
`;

function buildBrandLockup(label = "Token Tracker"): string {
  return `<span class="brand-lockup">
    <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M32 8 52 28 32 48 12 28 32 8Z"></path>
        <path d="M20 24H44"></path>
        <path d="M17 32H47"></path>
        <path d="M24 40H40"></path>
      </g>
    </svg>
    <span class="brand-wordmark">${escapeHtml(label)}</span>
  </span>`;
}

function buildWebNav(active: "home" | "settings" | "leaderboard"): string {
  return `<nav class="nav">
    <span class="nav-brand">${buildBrandLockup("Token Tracker")}</span>
    <a href="/"${active === "home" ? ' class="active"' : ""}>Home</a>
    <a href="/settings"${active === "settings" ? ' class="active"' : ""}>Settings</a>
    <a href="/leaderboard"${active === "leaderboard" ? ' class="active"' : ""}>Leaderboard</a>
  </nav>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/`/g, "&#x60;");
}

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function encodeMemberPayload(value: object): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

function parseUrlPath(rawUrl: string): {
  path: string;
  query: Record<string, string>;
} {
  const queryStringIndex = rawUrl.indexOf("?");
  const path =
    queryStringIndex >= 0 ? rawUrl.slice(0, queryStringIndex) : rawUrl;
  const query: Record<string, string> = {};
  if (queryStringIndex >= 0) {
    const params = new URLSearchParams(rawUrl.slice(queryStringIndex + 1));
    for (const [key, value] of params.entries()) {
      query[key] = value;
    }
  }
  return { path, query };
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(";").reduce<Record<string, string>>((cookies, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split("=");
    if (!rawKey) {
      return cookies;
    }

    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function resolveOrigin(req: IncomingMessage, configuredOrigin: string): string {
  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string" && forwardedProto.length > 0
      ? forwardedProto
      : "http";
  const host = req.headers.host ?? `localhost:${PORT}`;

  return `${protocol}://${host}`;
}

function buildSessionCookie(sessionId: string, req: IncomingMessage): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure =
    process.env.NODE_ENV === "production" ||
    (typeof forwardedProto === "string" && forwardedProto === "https");

  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];

  if (isSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function buildClearedSessionCookie(req: IncomingMessage): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure =
    process.env.NODE_ENV === "production" ||
    (typeof forwardedProto === "string" && forwardedProto === "https");

  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ];

  if (isSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function buildClearedOAuthStateCookie(req: IncomingMessage): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure =
    process.env.NODE_ENV === "production" ||
    (typeof forwardedProto === "string" && forwardedProto === "https");

  const parts = [
    "oauth_state=",
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=0",
  ];

  if (isSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function buildOAuthStateCookie(state: string, req: IncomingMessage): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure =
    process.env.NODE_ENV === "production" ||
    (typeof forwardedProto === "string" && forwardedProto === "https");

  const parts = [
    `oauth_state=${encodeURIComponent(state)}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=600",
  ];

  if (isSecure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function createDefaultGitHubOAuthClient(
  clientId: string,
  clientSecret: string,
): GitHubOAuthClient {
  return {
    async exchangeCodeForToken(
      code: string,
      redirectUri: string,
    ): Promise<string> {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Token-Tracker-Team-Web",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `GitHub token exchange failed with status ${response.status}`,
        );
      }

      const payload = (await response.json()) as {
        access_token?: string;
        error?: string;
        error_description?: string;
      };
      if (!payload.access_token) {
        throw new Error(
          payload.error_description ??
            payload.error ??
            "GitHub token exchange returned no access token",
        );
      }

      return payload.access_token;
    },

    async fetchUser(accessToken: string): Promise<GitHubOAuthUser> {
      const headers = {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Token-Tracker-Team-Web",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      const userResponse = await fetch("https://api.github.com/user", {
        headers,
      });
      if (!userResponse.ok) {
        throw new Error(
          `GitHub user fetch failed with status ${userResponse.status}`,
        );
      }

      const user = (await userResponse.json()) as {
        id: number;
        login: string;
        name: string | null;
        avatar_url: string | null;
        email: string | null;
      };

      let email = user.email;
      if (!email) {
        const emailResponse = await fetch(
          "https://api.github.com/user/emails",
          { headers },
        );
        if (emailResponse.ok) {
          const emails = (await emailResponse.json()) as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }>;
          const primaryEmail =
            emails.find((entry) => entry.primary && entry.verified) ??
            emails.find((entry) => entry.verified);
          email = primaryEmail?.email ?? null;
        }
      }

      return {
        githubId: user.id,
        username: user.login,
        displayName: user.name,
        avatarUrl: user.avatar_url,
        email,
      };
    },
  };
}

function periodToDays(period: string): number {
  switch (period) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "all_time":
      return 3650; // ~10 years
    default:
      return 30;
  }
}

function computeAndSaveSnapshot(
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
  // Use a deterministic snapshot ID per team+window so we update rather than create duplicates
  const snapshotId = `snapshot-${teamId}-${windowDays}`;
  db.saveSnapshot(snapshotId, teamId, windowDays, JSON.stringify(entries));
}

function buildHomePage(
  db: LeaderboardDatabase,
  githubUser: {
    githubId: number;
    username: string;
    displayName: string | null;
  } | null,
  membership: { optedIn: boolean } | null,
): string {
  const isConnected = githubUser !== null;
  const isOptedIn = membership?.optedIn ?? false;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Team Leaderboard</title><style>${STYLES}</style></head>
<body>
  ${buildWebNav("home")}
  <h1>Team Leaderboard</h1>
  <p class="subtitle">Private, team-scoped, efficiency-oriented ranking. Not a public leaderboard.</p>

  <div class="card">
    <h2>Connection Status</h2>
    ${
      isConnected
        ? `<p>Connected as <strong>${escapeHtml(githubUser.displayName ?? githubUser.username)}</strong> (<code>@${escapeHtml(githubUser.username)}</code>) <span class="status-badge status-connected">Connected</span></p>`
        : `<p>Not connected to GitHub. <a href="/auth/github">Connect GitHub</a> to participate.</p>`
    }
  </div>

  <div class="card ${isOptedIn ? "opt-in-card" : "opt-out-card"}">
    <h2>Leaderboard Visibility</h2>
    ${
      !isConnected
        ? '<p class="empty">Connect GitHub first to manage leaderboard visibility.</p>'
        : isOptedIn
          ? `<p>You are <strong>visible</strong> on the team leaderboard. <span class="status-badge status-opted-in">Opted In</span></p>
           <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Your aggregated efficiency stats are visible to teammates. Raw session data, prompts, and code are never shared.</p>
           <form method="post" action="/settings/opt-out" style="margin-top:12px"><button type="submit" class="btn btn-secondary">Opt Out</button></form>`
          : `<p>You are <strong>not visible</strong> on the team leaderboard. <span class="status-badge status-opted-out">Opted Out</span></p>
           <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Opt in to appear on the leaderboard with your aggregated efficiency stats.</p>
           <form method="post" action="/settings/opt-in" style="margin-top:12px"><button type="submit" class="btn">Opt In</button></form>`
    }
  </div>

  <div class="card">
    <h2>Privacy Policy</h2>
    <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">Version ${escapeHtml(TTM_PRIVACY_POLICY.version)}</p>
    <h3 style="font-size:13px;font-weight:600;margin:8px 0 4px">What is shared when you opt in:</h3>
    <ul class="privacy-list">${TTM_PRIVACY_POLICY.sharedData.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3 style="font-size:13px;font-weight:600;margin:8px 0 4px">What is NEVER shared:</h3>
    <ul class="privacy-list">${TTM_PRIVACY_POLICY.neverSharedData.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Admins cannot override your visibility choice.</p>
  </div>
</body></html>`;
}

function buildSettingsPage(
  db: LeaderboardDatabase,
  githubUser: { username: string; displayName: string | null } | null,
  membership: { optedIn: boolean } | null,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Settings</title><style>${STYLES}</style></head>
<body>
  ${buildWebNav("settings")}
  <h1>Settings</h1>
  <p class="subtitle">Manage your GitHub connection and leaderboard preferences.</p>

  <div class="card">
    <h2>GitHub Connection</h2>
    ${
      githubUser
        ? `<p>Connected as <strong>${escapeHtml(githubUser.displayName ?? githubUser.username)}</strong></p>
         <form method="post" action="/auth/disconnect" style="margin-top:12px"><button type="submit" class="btn btn-danger">Disconnect GitHub</button></form>`
        : `<p>Not connected.</p><a href="/auth/github" class="btn">Connect GitHub</a>`
    }
  </div>

  <div class="card">
    <h2>Leaderboard Opt-In</h2>
    ${
      !githubUser
        ? '<p class="empty">Connect GitHub first.</p>'
        : membership?.optedIn
          ? '<p>You are currently <strong>opted in</strong> to the team leaderboard.</p><form method="post" action="/settings/opt-out"><button type="submit" class="btn btn-secondary">Opt Out</button></form>'
          : '<p>You are currently <strong>opted out</strong> of the team leaderboard.</p><form method="post" action="/settings/opt-in"><button type="submit" class="btn">Opt In</button></form>'
    }
  </div>
</body></html>`;
}

function buildLeaderboardPage(
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

  // Find current user's rank
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

  // My Rank card
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

  // Period tabs with functional links
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

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Leaderboard</title><style>${STYLES}</style></head>
<body>
  ${buildWebNav("leaderboard")}
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

  <!-- Member Detail Drawer -->
  <div class="drawer-overlay" id="drawer-overlay" onclick="closeDrawer()"></div>
  <div class="drawer-panel" id="drawer-panel" role="dialog" aria-modal="true" aria-label="Member detail">
    <button class="drawer-close" onclick="closeDrawer()" aria-label="Close drawer">&times;</button>
    <h2 id="drawer-title" style="margin-bottom:16px"></h2>
    <div id="drawer-content"></div>
  </div>
  <script>
    (function() {
      var overlay = document.getElementById('drawer-overlay');
      var panel = document.getElementById('drawer-panel');
      var title = document.getElementById('drawer-title');
      var content = document.getElementById('drawer-content');

      function decodeMemberPayload(encoded) {
        var binary = window.atob(encoded);
        var bytes = Uint8Array.from(binary, function(char) {
          return char.charCodeAt(0);
        });
        return JSON.parse(new TextDecoder().decode(bytes));
      }

      function openDrawer(data) {
        title.textContent = data.displayName;
        // Clear previous content safely
        while (content.firstChild) content.removeChild(content.firstChild);
        var rows = [
          { label: 'Username', value: '@' + data.username },
          { label: 'Efficiency Score', value: data.efficiencyScore.toFixed(0) },
          { label: 'Sessions', value: String(data.sessionCount) },
          { label: 'Total Tokens', value: formatNum(data.totalTokens) },
          { label: 'Total Cost', value: '$' + data.totalCostUsd.toFixed(2) },
          { label: 'Cache Hit Rate', value: data.averageCacheHitRate !== null ? (data.averageCacheHitRate * 100).toFixed(0) + '%' : '\u2014' },
          { label: 'Outcome Success Rate', value: data.outcomeSuccessRate !== null ? (data.outcomeSuccessRate * 100).toFixed(0) + '%' : '\u2014' },
          { label: 'Period', value: data.period + ' (' + data.windowDays + ' days)' },
        ];
        rows.forEach(function(r) {
          var row = document.createElement('div');
          row.className = 'detail-row';
          var label = document.createElement('span');
          label.className = 'detail-label';
          label.textContent = r.label;
          var value = document.createElement('span');
          value.className = 'detail-value';
          value.textContent = r.value;
          row.appendChild(label);
          row.appendChild(value);
          content.appendChild(row);
        });
        overlay.classList.add('open');
        panel.classList.add('open');
        panel.querySelector('.drawer-close').focus();
      }

      window.closeDrawer = function() {
        overlay.classList.remove('open');
        panel.classList.remove('open');
      };

      window.formatNum = function(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return String(n);
      };

      document.querySelectorAll('.leaderboard-row').forEach(function(row) {
        row.addEventListener('click', function() {
          var data = decodeMemberPayload(this.getAttribute('data-member-b64'));
          openDrawer(data);
        });
        row.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var data = decodeMemberPayload(this.getAttribute('data-member-b64'));
            openDrawer(data);
          }
        });
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
          closeDrawer();
        }
      });
    })();
  </script>
</body></html>`;
}

/**
 * Creates a request handler for the leaderboard web app.
 * Exported for testability — tests can call this with a test database.
 */
export function createApp(
  db: LeaderboardDatabase,
  localDb: TtmDatabase | null = null,
  config: AppConfig = {},
): (req: IncomingMessage, res: ServerResponse) => void {
  const adminApiKey = config.adminApiKey ?? "";
  const githubClientId = config.githubClientId ?? "";
  const githubClientSecret = config.githubClientSecret ?? "";
  const githubOAuthClient =
    config.githubOAuthClient ??
    (githubClientId && githubClientSecret
      ? createDefaultGitHubOAuthClient(githubClientId, githubClientSecret)
      : null);

  return (req: IncomingMessage, res: ServerResponse) => {
    // Security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    );

    // Rate limiting — matches desktop app (60 req/min per IP)
    const clientIp =
      (req.headers["x-forwarded-for"] as string | undefined) ??
      req.socket.remoteAddress ??
      "unknown";
    const now = Date.now();
    const entry = rateLimitStore.get(clientIp);

    if (entry) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(clientIp, { count: 1, windowStart: now });
      } else {
        entry.count++;
        if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
          res.writeHead(429, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Too many requests. Please try again later.",
            }),
          );
          return;
        }
      }
    } else {
      rateLimitStore.set(clientIp, { count: 1, windowStart: now });
    }

    // Periodic cleanup of stale rate limit entries
    if (rateLimitStore.size > 1000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (now - value.windowStart > RATE_LIMIT_WINDOW_MS) {
          rateLimitStore.delete(key);
        }
      }
    }

    const { path, query } = parseUrlPath(req.url ?? "/");
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies[SESSION_COOKIE_NAME];
    const session = sessionId ? db.getWebSession(sessionId) : null;
    const devGithubId =
      process.env.TTM_DEV_AUTH === "true" &&
      !session &&
      !githubClientId &&
      cookies.github_id
        ? Number(cookies.github_id)
        : null;
    if (devGithubId)
      process.stderr.write(
        "[WARNING] Dev-mode auth active (TTM_DEV_AUTH=true). Do not use in production.\n",
      );
    const githubId = session?.githubId ?? devGithubId ?? null;
    const persistedUser = githubId ? db.getGitHubUser(githubId) : null;
    const githubUser =
      persistedUser ??
      (devGithubId
        ? {
            githubId: devGithubId,
            username: `user_${devGithubId}`,
            displayName: null,
            avatarUrl: null,
            email: null,
          }
        : null);
    const membership = githubId
      ? db.getMembership(githubId, DEFAULT_TEAM_ID)
      : null;

    if (path === "/" || path === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(buildHomePage(db, githubUser, membership));
      return;
    }

    if (path === "/settings") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(buildSettingsPage(db, githubUser, membership));
      return;
    }

    if (path === "/leaderboard") {
      const period = query.period ?? "month";
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(buildLeaderboardPage(db, DEFAULT_TEAM_ID, githubId, period));
      return;
    }

    if (path === "/auth/github") {
      if (!githubClientId || !githubClientSecret || !githubOAuthClient) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<!DOCTYPE html><html><head><style>${STYLES}</style></head><body>${buildWebNav("home")}<h1>GitHub OAuth Not Configured</h1><p class="subtitle">Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables to enable GitHub OAuth.</p><div class="card"><h2>Development Mode</h2><p>In development, you can simulate a GitHub connection by setting a cookie:</p><pre style="background:var(--bg-panel-strong);padding:12px;border-radius:4px;font-size:12px;border:1px solid var(--border)">curl -b "github_id=12345" http://localhost:${PORT}/</pre></div></body></html>`,
        );
        return;
      }

      const origin = resolveOrigin(req, config.webOrigin ?? WEB_ORIGIN);
      const redirectUri = `${origin}/auth/github/callback`;
      const state = crypto.randomUUID().replace(/-/g, "");
      const scope = "read:user,user:email";
      const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
      res.writeHead(302, {
        Location: url,
        "Set-Cookie": buildOAuthStateCookie(state, req),
      });
      res.end();
      return;
    }

    if (path === "/auth/github/callback") {
      const code = query.code;
      const state = query.state;

      if (!code || !state) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing code or state parameter");
        return;
      }

      // Validate state to prevent CSRF
      const cookieState = cookies.oauth_state;
      if (!cookieState || cookieState !== state) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Invalid state parameter");
        return;
      }

      if (!githubClientId || !githubClientSecret || !githubOAuthClient) {
        res.writeHead(503, {
          "Content-Type": "text/plain",
          "Set-Cookie": buildClearedOAuthStateCookie(req),
        });
        res.end("GitHub OAuth is not configured");
        return;
      }

      const origin = resolveOrigin(req, config.webOrigin ?? WEB_ORIGIN);
      const redirectUri = `${origin}/auth/github/callback`;

      void githubOAuthClient
        .exchangeCodeForToken(code, redirectUri)
        .then(async (accessToken) => {
          const user = await githubOAuthClient.fetchUser(accessToken);
          db.upsertGitHubUser({
            githubId: user.githubId,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            email: user.email,
            accessToken,
          });

          const newSessionId = randomUUID();
          const expiresAt = new Date(
            Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
          ).toISOString();
          db.createWebSession(newSessionId, user.githubId, expiresAt);

          res.writeHead(302, {
            Location: "/",
            "Set-Cookie": [
              buildSessionCookie(newSessionId, req),
              buildClearedOAuthStateCookie(req),
            ],
          });
          res.end();
        })
        .catch((error: unknown) => {
          process.stderr.write(
            `[ERROR] OAuth callback failed: ${error instanceof Error ? error.message : String(error)}\n`,
          );
          res.writeHead(502, {
            "Content-Type": "text/plain",
            "Set-Cookie": buildClearedOAuthStateCookie(req),
          });
          res.end("Authentication failed. Please try again.");
        });
      return;
    }

    if (path === "/auth/disconnect" && req.method === "POST") {
      req.on("end", () => {
        if (sessionId) {
          db.deleteWebSession(sessionId);
        }

        res.writeHead(302, {
          Location: "/",
          "Set-Cookie": [
            buildClearedSessionCookie(req),
            "github_id=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
          ],
        });
        res.end();
      });
      return;
    }

    if (
      (path === "/settings/opt-in" || path === "/settings/opt-out") &&
      req.method === "POST"
    ) {
      if (!githubId) {
        res.writeHead(302, { Location: "/auth/github" });
        res.end();
        return;
      }

      const optedIn = path === "/settings/opt-in";

      // Ensure the user exists in github_users before syncing
      // In dev mode (cookie-based auth), create a placeholder entry
      if (optedIn && githubId && !db.getGitHubUser(githubId)) {
        db.upsertGitHubUser({
          githubId,
          username: `user_${githubId}`,
          displayName: null,
          avatarUrl: null,
          email: null,
          accessToken: "",
        });
      }

      // Sync local sessions into leaderboard for this user
      if (optedIn && githubId) {
        syncLocalSessions(db, githubId, DEFAULT_TEAM_ID, 30, localDb);
      }
      db.setMembership(githubId, DEFAULT_TEAM_ID, optedIn);

      res.writeHead(302, { Location: "/" });
      res.end();
      return;
    }

    if (path === "/api/me") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          connected: githubUser !== null,
          user: githubUser,
          membership: membership,
          team: db.getTeam(DEFAULT_TEAM_ID),
        }),
      );
      return;
    }

    if (path === "/api/leaderboard") {
      const period = query.period ?? "month";
      const windowDays = periodToDays(period);
      computeAndSaveSnapshot(db, DEFAULT_TEAM_ID, windowDays);
      const snapshot = db.getSnapshot(DEFAULT_TEAM_ID, windowDays);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          team: db.getTeam(DEFAULT_TEAM_ID),
          period,
          windowDays,
          snapshot: snapshot
            ? {
                snapshotId: snapshot.snapshotId,
                computedAt: snapshot.computedAt,
                windowDays: snapshot.windowDays,
                entries: JSON.parse(snapshot.entriesJson),
              }
            : null,
        }),
      );
      return;
    }

    if (path === "/api/compute-snapshot" && req.method === "POST") {
      // Basic admin protection: requires TTM_ADMIN_API_KEY header
      if (adminApiKey) {
        const authHeader = req.headers.authorization ?? "";
        const expected = Buffer.from(`Bearer ${adminApiKey}`, "utf8");
        const actual = Buffer.from(authHeader, "utf8");
        if (
          expected.length !== actual.length ||
          !timingSafeEqual(expected, actual)
        ) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "admin API key required" }));
          return;
        }
      }

      const period = query.period ?? "month";
      const windowDays = periodToDays(period);
      computeAndSaveSnapshot(db, DEFAULT_TEAM_ID, windowDays);
      const snapshot = db.getSnapshot(DEFAULT_TEAM_ID, windowDays);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          computed: true,
          period,
          windowDays,
          snapshot: snapshot
            ? {
                snapshotId: snapshot.snapshotId,
                computedAt: snapshot.computedAt,
                entryCount: JSON.parse(snapshot.entriesJson).length,
              }
            : null,
        }),
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  };
}

function main(): void {
  const dbPath = defaultLeaderboardDatabasePath();
  const db = new LeaderboardDatabase(dbPath);
  const localDb = new TtmDatabase(defaultDatabasePath());

  db.createTeam(DEFAULT_TEAM_ID, DEFAULT_TEAM_NAME);

  const app = createApp(db, localDb, {
    adminApiKey: ADMIN_API_KEY,
    githubClientId: GITHUB_CLIENT_ID,
    githubClientSecret: GITHUB_CLIENT_SECRET,
    webOrigin: WEB_ORIGIN,
  });
  const server = createServer(app);

  server.listen(PORT, "127.0.0.1", () => {
    process.stdout.write(
      `Token Tracker Team Web running at http://localhost:${PORT}\n`,
    );
    process.stdout.write(`Home: http://localhost:${PORT}/\n`);
    process.stdout.write(`Settings: http://localhost:${PORT}/settings\n`);
    process.stdout.write(`Leaderboard: http://localhost:${PORT}/leaderboard\n`);
    process.stdout.write(`API: http://localhost:${PORT}/api/me\n`);
    process.stdout.write(`Database: ${db.path}\n`);
    process.stdout.write(
      `GitHub OAuth: ${GITHUB_CLIENT_ID ? "configured" : "not configured (dev mode available)"}\n`,
    );
    process.stdout.write(
      `Admin API key: ${ADMIN_API_KEY ? "set" : "not set (compute-snapshot is unprotected)"}\n`,
    );
  });
}

// Only run the server when this file is executed directly, not when imported by tests
const isMain = process.argv[1]?.endsWith("index.js") ?? false;
if (isMain) {
  main();
}
