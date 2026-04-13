import { existsSync } from "node:fs";
import type { TtmReadService } from "@ttm/core";
import type { MonitoringPreferences } from "../shell/preferences.js";
import type { DatabaseResolutionConfig } from "./env-config.js";
import { RUNTIME_STARTED_AT } from "./env-config.js";

export interface DesktopRuntimeStatus {
  runtimeMode: string;
  instanceToken: string;
  ownerPath: string;
  port: number;
  databasePath: string;
  databaseSource: DatabaseResolutionConfig["source"];
  canonicalDatabasePath: string;
  legacyDatabasePath: string | null;
  migrationPerformed: boolean;
  totalSessionCount: number;
  analyticsWindowDays: number;
  analyticsWindowSessionCount: number;
  refreshCadenceSeconds: number;
  dbExists: boolean;
  startedAt: string;
}

export interface DatabasePathResolution {
  path: string;
  source: DatabaseResolutionConfig["source"];
  canonicalPath: string;
  legacyPath: string | null;
  migrationPerformed: boolean;
}

let desktopDatabaseResolution: DatabasePathResolution | null = null;

export function setDesktopDatabaseResolution(
  resolution: DatabasePathResolution,
): void {
  desktopDatabaseResolution = resolution;
}

export function getDesktopDatabaseResolution(): DatabasePathResolution | null {
  return desktopDatabaseResolution;
}

export function getRuntimeStatus(
  readService: TtmReadService,
  prefs: MonitoringPreferences,
  analyticsWindowDays = prefs.defaultAnalyticsWindowDays,
): DesktopRuntimeStatus {
  const summary = readService.getSummarySnapshot();
  const analytics = readService.getAnalyticsSnapshot(analyticsWindowDays);
  const resolution = desktopDatabaseResolution ?? {
    path: summary.databasePath,
    source: "explicit" as const,
    canonicalPath: summary.databasePath,
    legacyPath: null,
    migrationPerformed: false,
  };

  return {
    runtimeMode: process.env.TTM_DESKTOP_RUNTIME ?? "dev",
    instanceToken: process.env.TTM_RUNTIME_INSTANCE_TOKEN ?? "dev-runtime",
    ownerPath: process.env.TTM_RUNTIME_OWNER_PATH ?? "",
    port: Number(process.env.TTM_DESKTOP_PORT ?? "3100"),
    databasePath: summary.databasePath,
    databaseSource: resolution.source,
    canonicalDatabasePath: resolution.canonicalPath,
    legacyDatabasePath: resolution.legacyPath,
    migrationPerformed: resolution.migrationPerformed,
    totalSessionCount: summary.sessionCount,
    analyticsWindowDays,
    analyticsWindowSessionCount: analytics.sessionCount,
    refreshCadenceSeconds: prefs.refreshCadenceSeconds,
    dbExists: existsSync(summary.databasePath),
    startedAt: RUNTIME_STARTED_AT,
  };
}
