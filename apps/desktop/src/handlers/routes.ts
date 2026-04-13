export interface ParsedUrl {
  path: string;
  sessionId: string | null;
  provider: string | null;
  model: string | null;
  q: string | null;
  page: number;
  mode: string | null;
  period: string | null;
}

export function parseUrlPath(rawUrl: string): ParsedUrl {
  const queryStringIndex = rawUrl.indexOf('?');
  const path = queryStringIndex >= 0 ? rawUrl.slice(0, queryStringIndex) : rawUrl;
  const query = queryStringIndex >= 0 ? rawUrl.slice(queryStringIndex + 1) : '';

  let sessionId: string | null = null;
  let provider: string | null = null;
  let model: string | null = null;
  let q: string | null = null;
  let page = 1;
  let mode: string | null = null;
  let period: string | null = '1m';
  for (const param of query.split('&')) {
    const [key, value] = param.split('=');
    if (key === 'session' && value) {
      sessionId = decodeURIComponent(value);
    } else if (key === 'provider' && value) {
      provider = decodeURIComponent(value);
    } else if (key === 'model' && value) {
      model = decodeURIComponent(value);
    } else if (key === 'q' && value) {
      q = decodeURIComponent(value);
    } else if (key === 'page' && value) {
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed >= 1) {
        page = parsed;
      }
    } else if (key === 'mode' && value) {
      mode = decodeURIComponent(value);
    } else if (key === 'period' && value) {
      period = decodeURIComponent(value);
    } else if (key === 'days' && value) {
      const daysVal = Number(value);
      if (daysVal === 0) period = '1h';
      else if (daysVal === 1) period = '1d';
      else if (daysVal === 7) period = '7d';
      else if (daysVal >= 30) period = '1m';
      else period = 'all';
    }
  }

  return { path, sessionId, provider, model, q, page, mode, period };
}

export interface RouteMatch {
  handler: 'summary' | 'analytics' | 'runtime-status' | 'export' | 'refresh' | 'notification-check' | 'preferences' | 'menubar' | 'analytics-page' | 'diagnostics' | 'overview' | 'session-detail' | 'not-found';
  params: ParsedUrl;
}

export function matchRoute(parsed: ParsedUrl): RouteMatch {
  const { path } = parsed;

  if (path === '/api/summary') {
    return { handler: 'summary', params: parsed };
  }
  if (path === '/api/analytics') {
    return { handler: 'analytics', params: parsed };
  }
  if (path === '/api/runtime-status') {
    return { handler: 'runtime-status', params: parsed };
  }
  if (path === '/api/refresh') {
    return { handler: 'refresh', params: parsed };
  }
  if (path === '/api/notification-check') {
    return { handler: 'notification-check', params: parsed };
  }
  if (path.startsWith('/export/')) {
    return { handler: 'export', params: parsed };
  }
  if (path === '/menubar') {
    return { handler: 'menubar', params: parsed };
  }
  if (path === '/analytics') {
    return { handler: 'analytics-page', params: parsed };
  }
  if (path === '/diagnostics/runtime') {
    return { handler: 'diagnostics', params: parsed };
  }
  if (path === '/' || path === '/index.html') {
    if (parsed.sessionId) {
      return { handler: 'session-detail', params: parsed };
    }
    return { handler: 'overview', params: parsed };
  }

  return { handler: 'not-found', params: parsed };
}