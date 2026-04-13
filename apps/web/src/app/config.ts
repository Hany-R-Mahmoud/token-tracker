export const PORT = Number(process.env.TTM_WEB_PORT ?? "3200");
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? "";
export const DEFAULT_TEAM_ID = process.env.TTM_DEFAULT_TEAM_ID ?? "default-team";
export const DEFAULT_TEAM_NAME = process.env.TTM_DEFAULT_TEAM_NAME ?? "Default Team";
export const ADMIN_API_KEY = process.env.TTM_ADMIN_API_KEY ?? "";
export const WEB_ORIGIN = process.env.TTM_WEB_ORIGIN ?? "";

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 60;
