import { createServer } from "node:http";
import { TtmDatabase, defaultDatabasePath } from "@ttm/core";
import { LeaderboardDatabase, defaultLeaderboardDatabasePath } from "../storage/db.js";
import { createApp } from "./create-app.js";
import {
  PORT,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  DEFAULT_TEAM_ID,
  DEFAULT_TEAM_NAME,
  ADMIN_API_KEY,
  WEB_ORIGIN,
} from "./config.js";
import { setPort } from "../auth/github-oauth.js";

export function main(): void {
  setPort(PORT);

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
