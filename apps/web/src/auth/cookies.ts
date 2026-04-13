import type { IncomingMessage } from "node:http";

export const SESSION_COOKIE_NAME = "ttm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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
