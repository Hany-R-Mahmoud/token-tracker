import type { IncomingMessage, ServerResponse } from 'node:http';
import type { TtmReadService } from '@ttm/core';
import type { MonitoringPreferences } from '../preferences.js';
import { getRuntimeStatus } from '../runtime-status.js';
import { sendError } from '../error-handler.js';

export function handleRuntimeStatusRequest(
  request: IncomingMessage,
  response: ServerResponse,
  readService: TtmReadService,
  prefs: MonitoringPreferences,
): boolean {
  try {
    const runtimeStatus = getRuntimeStatus(readService, prefs);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(runtimeStatus));
  } catch (error) {
    sendError(response, 500, 'Internal server error', String(error));
  }
  return true;
}