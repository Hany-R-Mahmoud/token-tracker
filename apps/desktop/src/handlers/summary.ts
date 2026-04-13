import type { IncomingMessage, ServerResponse } from 'node:http';
import type { TtmReadService } from '@ttm/core';
import { sendError } from '../error-handler.js';

const API_KEY_HEADER = 'x-api-key';
const API_KEY_PARAM = 'api_key';

export function handleSummaryRequest(
  request: IncomingMessage,
  response: ServerResponse,
  readService: TtmReadService,
  apiKey: string | undefined,
): boolean {
  const rawUrl = request.url ?? '/';
  const url = new URL(rawUrl, 'http://localhost');

  if (apiKey) {
    const providedKey = url.searchParams.get(API_KEY_PARAM);
    if (!providedKey || providedKey !== apiKey) {
      response.writeHead(401, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'API key required' }));
      return true;
    }
  }

  try {
    const snapshot = readService.getSummarySnapshot();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(snapshot));
  } catch (error) {
    sendError(response, 500, 'Internal server error', String(error));
  }
  return true;
}

export function handleAnalyticsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  readService: TtmReadService,
): boolean {
  try {
    const analytics = readService.getAnalyticsSnapshot();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(analytics));
  } catch (error) {
    sendError(response, 500, 'Internal server error', String(error));
  }
  return true;
}