import type { IncomingMessage } from "node:http";
import type { GitHubOAuthClient, GitHubOAuthUser } from "../routing/routes.js";

let PORT = 3200;
export function setPort(port: number): void {
  PORT = port;
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

export function generateOAuthState(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function validateOAuthState(cookieState: string | undefined, state: string): boolean {
  return !!cookieState && cookieState === state;
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
