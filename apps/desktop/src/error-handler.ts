import type { ServerResponse } from 'node:http';

export interface ErrorResponse {
  error: string;
}

export function sendError(
  res: ServerResponse,
  statusCode: number,
  publicMessage: string,
  logMessage?: string,
): void {
  if (logMessage) {
    process.stderr.write(`[ERROR] ${logMessage}\n`);
  }
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(publicMessage);
}

export function sendJsonError(
  res: ServerResponse,
  statusCode: number,
  error: string,
): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error }));
}

export function isErrorFromCode(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}