import type { IncomingMessage, ServerResponse } from "node:http";
import type { TtmReadService } from "@ttm/core";
import { buildAnalyticsSummarySvg } from "../rendering/export-svg.js";
import type { ReadAnalyticsSnapshot } from "@ttm/core";
import { sendError } from "../runtime/error-handler.js";

export function handleAnalyticsExportRequest(
  request: IncomingMessage,
  response: ServerResponse,
  readService: TtmReadService,
): boolean {
  const rawUrl = request.url ?? "/";
  const urlParams = new URLSearchParams(
    rawUrl.includes("?") ? rawUrl.split("?")[1] : "",
  );

  let activePeriod = "1m";
  const periodParam = urlParams.get("period");
  if (periodParam && ["1h", "1d", "7d", "1m", "all"].includes(periodParam)) {
    activePeriod = periodParam;
  } else {
    const daysParam = urlParams.get("days");
    if (daysParam) {
      const parsed = Number(daysParam);
      if (parsed === 0) activePeriod = "1h";
      else if (parsed === 1) activePeriod = "1d";
      else if (parsed === 7) activePeriod = "7d";
      else if (parsed >= 30) activePeriod = "1m";
    }
  }

  let analytics: ReadAnalyticsSnapshot | null = null;
  let error: string | null = null;

  try {
    const periodId = activePeriod as "1h" | "1d" | "7d" | "1m" | "all";
    analytics = readService.getAnalyticsSnapshotForPeriod(periodId);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  if (error || !analytics || analytics.sessionCount === 0) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({ error: "No analytics data available to export" }),
    );
    return true;
  }

  const svg = buildAnalyticsSummarySvg(analytics);
  response.writeHead(200, {
    "Content-Type": "image/svg+xml",
    "Content-Disposition": `attachment; filename="token-tracker-analytics-${activePeriod}.svg"`,
  });
  response.end(svg);
  return true;
}
