import type { IncomingMessage, ServerResponse } from "node:http";

export interface ParsedUrl {
  path: string;
  query: Record<string, string>;
}

export function parseUrlPath(rawUrl: string): ParsedUrl {
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

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  context: RequestContext,
) => void;

export interface RequestContext {
  path: string;
  query: Record<string, string>;
  cookies: Record<string, string>;
  sessionId: string | null;
  githubId: number | null;
  githubUser: GitHubUser | null;
  membership: Membership | null;
  db: unknown;
  localDb: unknown;
  config: AppConfig;
}

export interface GitHubUser {
  githubId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
}

export interface Membership {
  optedIn: boolean;
  optedInAt: string | null;
  optedOutAt: string | null;
}

export interface AppConfig {
  adminApiKey?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  webOrigin?: string;
  githubOAuthClient?: GitHubOAuthClient;
}

export interface GitHubOAuthClient {
  exchangeCodeForToken(code: string, redirectUri: string): Promise<string>;
  fetchUser(accessToken: string): Promise<GitHubOAuthUser>;
}

export interface GitHubOAuthUser {
  githubId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string | null;
}

export interface RouteDefinition {
  path: string;
  method?: string;
  handler: RouteHandler;
}

export class Router {
  private routes: RouteDefinition[] = [];

  public addRoute(path: string, handler: RouteHandler, method?: string): void {
    this.routes.push({ path, handler, method });
  }

  public match(
    reqPath: string,
    reqMethod: string,
  ): { handler: RouteHandler; params: Record<string, string> } | null {
    const { path } = parseUrlPath(reqPath);

    for (const route of this.routes) {
      const match = this.matchPath(path, route.path);
      if (match !== null) {
        if (!route.method || route.method === reqMethod) {
          return { handler: route.handler, params: match };
        }
      }
    }

    return null;
  }

  private matchPath(
    path: string,
    pattern: string,
  ): Record<string, string> | null {
    const pathParts = path.split("/").filter(Boolean);
    const patternParts = pattern.split("/").filter(Boolean);

    if (pathParts.length !== patternParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];

      if (patternPart.startsWith(":")) {
        params[patternPart.slice(1)] = pathParts[i];
      } else if (patternPart !== pathParts[i]) {
        return null;
      }
    }

    return params;
  }
}