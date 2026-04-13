import { randomUUID, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./cookies.js";

export interface Session {
  sessionId: string;
  githubId: number;
  expiresAt: string;
}

export function generateSessionId(): string {
  return randomUUID();
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
