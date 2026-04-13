import type { ServerResponse } from 'node:http';

export interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'Referrer-Policy': string;
  'Content-Security-Policy': string;
}

export const DEFAULT_SECURITY_HEADERS: SecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
};

export function applySecurityHeaders(res: ServerResponse): void {
  for (const [header, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
}

export function buildSecurityHeadersObject(): Record<string, string> {
  return { ...DEFAULT_SECURITY_HEADERS };
}