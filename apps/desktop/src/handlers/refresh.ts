import type { IncomingMessage, ServerResponse } from 'node:http';

export interface RefreshState {
  lastRefreshAt: string;
  source: 'manual' | 'watcher' | 'initial';
  error: string | null;
}

export function handleRefreshRequest(
  request: IncomingMessage,
  response: ServerResponse,
  getRefreshState: () => RefreshState,
): boolean {
  const state = getRefreshState();
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(state));
  return true;
}