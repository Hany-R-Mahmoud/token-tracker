export interface EnvironmentConfig {
  port: number;
  runtimeMode: string;
  instanceToken: string;
  ownerPath: string;
  apiKey: string;
  analyticsWindowDays: number;
  refreshCadenceSeconds: number;
  rateLimitWindowMs: number;
}

export interface DatabaseResolutionConfig {
  path: string;
  source: 'explicit' | 'env' | 'canonical_home' | 'legacy_cwd_fallback' | 'legacy_cwd_migrated';
  canonicalPath: string;
  legacyPath: string | null;
  migrationPerformed: boolean;
}

export function loadEnvironmentConfig(): EnvironmentConfig {
  return {
    port: Number(process.env.TTM_DESKTOP_PORT ?? '3100'),
    runtimeMode: process.env.TTM_DESKTOP_RUNTIME ?? 'dev',
    instanceToken: process.env.TTM_RUNTIME_INSTANCE_TOKEN ?? 'dev-runtime',
    ownerPath: process.env.TTM_RUNTIME_OWNER_PATH ?? '',
    apiKey: process.env.TTM_DESKTOP_API_KEY ?? '',
    analyticsWindowDays: 30,
    refreshCadenceSeconds: 5,
    rateLimitWindowMs: 60 * 1000,
  };
}

export const RUNTIME_STARTED_AT = new Date().toISOString();

export const DEFAULT_ANALYTICS_WINDOW_DAYS = 30;
export const DEFAULT_REFRESH_CADENCE_SECONDS = 5;
export const DEFAULT_PORT = 3100;