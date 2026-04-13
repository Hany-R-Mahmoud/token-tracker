import type { IncomingMessage, ServerResponse } from "node:http";
import type { MonitoringPreferences } from "../shell/preferences.js";

export function handlePreferencesRequest(
  request: IncomingMessage,
  response: ServerResponse,
  prefs: MonitoringPreferences,
): boolean {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(prefs));
  return true;
}
