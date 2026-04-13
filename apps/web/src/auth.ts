import type { IncomingMessage } from "node:http";
import type { GitHubOAuthClient, GitHubOAuthUser } from "./routes.js";
import { randomUUID, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "ttm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface Session {
  sessionId: string;
  githubId: number;
  expiresAt: string;
}

export function parseCookies(header: string | undefined): Record<string, string> {
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

export function buildSessionCookie(sessionId: string, req: IncomingMessage): string {
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

export function buildClearedSessionCookie(req: IncomingMessage): string {
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

export function buildClearedOAuthStateCookie(req: IncomingMessage): string {
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

export function buildOAuthStateCookie(state: string, req: IncomingMessage): string {
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

export function resolveOrigin(req: IncomingMessage, configuredOrigin: string): string {
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

let PORT = 3200;
export function setPort(port: number): void {
  PORT = port;
}

export function generateSessionId(): string {
  return randomUUID();
}

export function generateOAuthState(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function validateOAuthState(cookieState: string | undefined, state: string): boolean {
  return !!cookieState && cookieState === state;
}

export function validateAdminApiKey(
  authHeader: string | undefined,
  adminApiKey: string,
): boolean {
  if (!adminApiKey) return true;

  const expected = Buffer.from(`Bearer ${adminApiKey}`, "utf8");
  const actual = Buffer.from(authHeader ?? "", "utf8");

  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}

export function createDefaultGitHubOAuthClient(
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

export interface SessionManager {
  getSession(sessionId: string): Session | null;
  createSession(githubId: number): Session;
  deleteSession(sessionId: string): void;
}

export function createSessionManager(
  db: {
    getWebSession(sessionId: string): { sessionId: string; githubId: number; expiresAt: string } | null;
    createWebSession(sessionId: string, githubId: number, expiresAt: string): void;
    deleteWebSession(sessionId: string): void;
  },
): SessionManager {
  return {
    getSession(sessionId: string): Session | null {
      const session = db.getWebSession(sessionId);
      if (!session) return null;

      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        db.deleteWebSession(sessionId);
        return null;
      }

      return session;
    },

    createSession(githubId: number): Session {
      const sessionId = generateSessionId();
      const expiresAt = new Date(
        Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
      ).toISOString();
      db.createWebSession(sessionId, githubId, expiresAt);
      return { sessionId, githubId, expiresAt };
    },

    deleteSession(sessionId: string): void {
      db.deleteWebSession(sessionId);
    },
  };
}