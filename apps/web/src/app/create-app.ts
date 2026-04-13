import { type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { TtmDatabase } from "@ttm/core";
import type { LeaderboardDatabase } from "../storage/db.js";
import { syncLocalSessions } from "../leaderboard/ingestion.js";
import {
  computeAndSaveSnapshot,
  periodToDays,
} from "../leaderboard/service.js";
import {
  parseUrlPath,
  type AppConfig,
  type GitHubOAuthClient,
  type GitHubUser,
  type Membership,
} from "../routing/routes.js";
import {
  parseCookies,
  buildSessionCookie,
  buildClearedSessionCookie,
  buildClearedOAuthStateCookie,
  buildOAuthStateCookie,
  SESSION_COOKIE_NAME,
} from "../auth/cookies.js";
import {
  resolveOrigin,
  createDefaultGitHubOAuthClient,
} from "../auth/github-oauth.js";
import { WEB_ORIGIN, DEFAULT_TEAM_ID } from "./config.js";
import {
  buildHomePage,
  buildSettingsPage,
  buildLeaderboardPage,
  buildApiResponse,
  buildApiError,
} from "../rendering/pages.js";

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;

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
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    );

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
            buildApiError("Too many requests. Please try again later.", 429),
          );
          return;
        }
      }
    } else {
      rateLimitStore.set(clientIp, { count: 1, windowStart: now });
    }

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
          `<!DOCTYPE html><html><head></head><body><h1>GitHub OAuth Not Configured</h1><p>Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables to enable GitHub OAuth.</p></body></html>`,
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

          const newSessionId = crypto.randomUUID();
          const expiresAt = new Date(
            Date.now() + 60 * 60 * 24 * 30 * 1000,
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
        buildApiResponse({
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
        buildApiResponse({
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
      if (adminApiKey) {
        const authHeader = req.headers.authorization ?? "";
        const expected = Buffer.from(`Bearer ${adminApiKey}`, "utf8");
        const actual = Buffer.from(authHeader, "utf8");
        if (
          expected.length !== actual.length ||
          !timingSafeEqual(expected, actual)
        ) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(buildApiError("admin API key required", 403));
          return;
        }
      }

      const period = query.period ?? "month";
      const windowDays = periodToDays(period);
      computeAndSaveSnapshot(db, DEFAULT_TEAM_ID, windowDays);
      const snapshot = db.getSnapshot(DEFAULT_TEAM_ID, windowDays);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        buildApiResponse({
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
