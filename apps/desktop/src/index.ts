#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { watchFile, existsSync } from 'node:fs';
import type { Stats } from 'node:fs';
import { TtmDatabase, TtmReadService, defaultDatabasePath } from '@ttm/core';
import { buildAnalyticsSummarySvg } from './export-svg.js';
import type {
  ReadSummarySnapshot,
  ReadAnalyticsSnapshot,
  SessionSummary,
  StoredSessionDetail,
  StoredSessionListItem,
  ModelSummary,
  DailyBucket,
} from '@ttm/core';
import { PAGE_STYLES, MENUBAR_STYLES } from './styles.js';
import { escapeHtml, formatNumber, buildCountdownStr, menubarRelativeTime, menubarProviderHealth, menubarOverallHealth, buildContextAuditHtml, getSessionContextHealth } from './helpers.js';
import { buildMenubarHtml } from './menubar.js';
import { loadPreferences, savePreferences, type MonitoringPreferences } from './preferences.js';

const PORT = Number(process.env.TTM_DESKTOP_PORT ?? '3100');

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const DESKTOP_API_KEY = process.env.TTM_DESKTOP_API_KEY ?? '';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Security headers applied to all HTTP responses
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
};

function applySecurityHeaders(res: ServerResponse): void {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
}

// Generic error handler — never leak internal details to clients
function sendError(res: ServerResponse, statusCode: number, publicMessage: string, logMessage?: string): void {
  if (logMessage) {
    process.stderr.write(`[ERROR] ${logMessage}\n`);
  }
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(publicMessage);
}

function buildErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Error</title><style>${PAGE_STYLES}</style></head>
<body>
  <nav class="nav"><span class="nav-brand">Token Tracker</span><a href="/">Overview</a><a href="/analytics">Analytics</a><a href="/menubar">Menubar</a></nav>
  <main><h1>Error</h1><p class="error">An unexpected error occurred. Please try again.</p></main>
</body></html>`;
}

function buildEmptyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${PAGE_STYLES}</style></head>
<body>
  <nav class="nav"><span class="nav-brand">Token Tracker</span><a href="/">Overview</a><a href="/analytics">Analytics</a><a href="/menubar">Menubar</a></nav>
  <main><h1>Token Tracker</h1><p class="empty">No data imported yet. Run <code>ttm import</code> to populate the local store.</p></main>
</body></html>`;
}

function buildOverviewHtml(snapshot: ReadSummarySnapshot, sessions: StoredSessionListItem[], activeProvider: string | null, activeModel: string | null, activeQ: string | null, listResult: { sessions: StoredSessionListItem[]; total: number; page: number; pageSize: number; totalPages: number } | null, modelOptions: { model: string; sessionCount: number }[], contextHealth: { nearLimitCount: number; toolHeavyCount: number; topSessions: { id: string; title: string | null; providerSessionId: string; contextPercent: number | null }[] } | null): string {
  const totalTokens = snapshot.providerSummaries.reduce((s: number, p: SessionSummary) => s + p.totalTokens, 0);
  const totalCost = snapshot.providerSummaries.reduce((s: number, p: SessionSummary) => s + p.totalCostUsd, 0);
  const providerRows = snapshot.providerSummaries.length > 0
    ? snapshot.providerSummaries.map((summary: SessionSummary) => buildProviderRow(summary)).join('\n')
    : '<tr><td colspan="6" class="empty">No sessions recorded yet. Run <code>ttm import</code> to collect data.</td></tr>';

  const sessionRows = sessions.length > 0
    ? sessions.map((session: StoredSessionListItem) => buildSessionRow(session)).join('\n')
    : '<tr><td colspan="6" class="empty">No sessions match your current filters. Try adjusting the search criteria.</td></tr>';

  const paginationHtml = listResult
    ? buildPaginationHtml(listResult, activeProvider, activeModel, activeQ)
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Overview</title>
<style>${PAGE_STYLES}</style>
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <nav class="nav">
    <span class="nav-brand">Token Tracker</span>
    <a href="/" class="active">Overview</a>
    <a href="/analytics">Analytics</a>
    <a href="/menubar">Menubar</a>
    <span class="refresh-indicator" id="refresh-state" title="Auto-refresh: watching database" role="status" aria-live="polite"></span>
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">🌓</button>
  </nav>
  <main id="main-content">
  <h1>Overview</h1>
  <p class="subtitle">Database: <code>${escapeHtml(snapshot.databasePath)}</code></p>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value">${snapshot.sessionCount}</div>
      <div class="stat-label">Total Sessions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${formatNumber(totalTokens)}</div>
      <div class="stat-label">Total Tokens</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">$${totalCost.toFixed(2)}</div>
      <div class="stat-label">Total Cost</div>
    </div>
    ${buildOverviewSuccessCard(snapshot)}
  </div>

  ${buildVerificationDistributionCard(snapshot)}

  ${contextHealth ? buildOverviewContextHealthSection(contextHealth) : ''}

  ${buildFilterStateHtml(activeProvider, activeModel, activeQ, listResult)}

  <div class="section">
    <h2>Filter Sessions</h2>
    <form method="get" action="/" class="filter-form">
      <label class="filter-label" for="filter-provider">Provider
        <select name="provider" id="filter-provider">
          <option value="">All providers</option>
          ${snapshot.providerSummaries.map((p: SessionSummary) => `<option value="${escapeHtml(p.provider)}"${activeProvider === p.provider ? ' selected' : ''}>${escapeHtml(p.provider)}</option>`).join('')}
        </select>
      </label>
      <label class="filter-label" for="filter-model">Model
        <select name="model" id="filter-model">
          <option value="">All models</option>
          ${modelOptions.map((m: { model: string; sessionCount: number }) => `<option value="${escapeHtml(m.model)}"${activeModel === m.model ? ' selected' : ''}>${escapeHtml(m.model)}</option>`).join('')}
        </select>
      </label>
      <label class="filter-label" for="filter-search">Search
        <input type="text" name="q" id="filter-search" placeholder="Search title, session ID..." value="${escapeHtml(activeQ ?? '')}">
      </label>
      <button type="submit">Filter</button>
      ${activeProvider || activeModel || activeQ ? '<a href="/" class="clear-link">Clear</a>' : ''}
    </form>
  </div>

  <div class="section">
    <h2>Provider Summaries</h2>
    <div class="table-wrapper">
    <table>
      <colgroup>
        <col class="col-provider">
        <col class="col-sessions">
        <col class="col-tokens">
        <col class="col-cost">
        <col class="col-reset">
        <col class="col-efficiency">
      </colgroup>
      <thead><tr><th scope="col">Provider</th><th scope="col">Sessions</th><th scope="col">Total Tokens</th><th scope="col">Cost (USD)</th><th scope="col">Reset</th><th scope="col">Avg Efficiency</th></tr></thead>
      <tbody>${providerRows}</tbody>
    </table>
    </div>
  </div>

  <div class="section">
    <h2>Recent Sessions</h2>
    <div class="table-wrapper">
    <table>
      <colgroup>
        <col class="col-session">
        <col class="col-provider-sm">
        <col class="col-model">
        <col class="col-tokens-sm">
        <col class="col-cost-sm">
        <col class="col-outcome">
      </colgroup>
      <thead><tr><th scope="col">Session</th><th scope="col">Provider</th><th scope="col">Model</th><th scope="col">Tokens</th><th scope="col">Cost</th><th scope="col">Outcome</th></tr></thead>
      <tbody>${sessionRows}</tbody>
    </table>
    </div>
  </div>

  ${paginationHtml}

  <p class="footer-note">
    <a href="/export/analytics-svg" class="btn-primary">📥 Download SVG</a>
    <button class="btn-secondary" onclick="copyOverviewSummary()">📋 Copy summary</button>
  </p>
  <script>
    function copyOverviewSummary() {
      var stats = document.querySelector('.stats-row')?.innerText || '';
      var tables = Array.from(document.querySelectorAll('table')).map(function(t) { return t.innerText; }).join('\\n\\n');
      var summary = 'Token Tracker Overview\\n' + stats.trim() + '\\n\\n' + tables;
      navigator.clipboard.writeText(summary).then(function() {
        var btn = document.querySelector('.btn-secondary');
        if (btn) { btn.textContent = '✓ Copied'; setTimeout(function() { btn.textContent = '📋 Copy summary'; }, 2000); }
      }).catch(function() {});
    }

    (function() {
      function updateRefreshState() {
        fetch('/api/refresh').then(function(r) { return r.json(); }).then(function(state) {
          var el = document.getElementById('refresh-state');
          if (!el) return;
          var ago = Math.round((Date.now() - new Date(state.lastRefreshAt).getTime()) / 1000);
          var label = ago < 5 ? 'just now' : ago < 60 ? ago + 's ago' : Math.floor(ago / 60) + 'm ago';
          el.textContent = 'Updated ' + label + ' (' + state.source + ')';
          el.title = state.error ? 'Error: ' + state.error : 'Auto-refresh: watching database';
          el.style.setProperty('--refresh-color', state.error ? '#ef4444' : '#22c55e');
        }).catch(function() {});
      }
      updateRefreshState();
      setInterval(updateRefreshState, 5000);
    })();

    (function() {
      var savedTheme = localStorage.getItem('ttm-theme');
      if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
      var toggle = document.getElementById('theme-toggle');
      if (toggle) {
        toggle.addEventListener('click', function() {
          var current = document.documentElement.getAttribute('data-theme');
          var next = current === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('ttm-theme', next);
        });
      }
    })();
  </script>
  </main>
</body>
</html>`;
}

function buildOverviewSuccessCard(snapshot: ReadSummarySnapshot): string {
  const providersWithSuccess = snapshot.providerSummaries.filter((p: SessionSummary) => p.averageSuccessScore !== null);
  if (providersWithSuccess.length === 0) return '';

  const totalSessions = snapshot.providerSummaries.reduce((s: number, p: SessionSummary) => s + p.sessions, 0);
  const weightedSuccess = providersWithSuccess.reduce((sum: number, p: SessionSummary) => {
    return sum + ((p.averageSuccessScore ?? 0) * p.sessions);
  }, 0);
  const avgSuccess = totalSessions > 0 ? Math.round(weightedSuccess / totalSessions) : null;

  if (avgSuccess === null) return '';

  const color = avgSuccess >= 70 ? 'var(--success)' : avgSuccess >= 40 ? 'var(--warning)' : 'var(--critical)';
  const label = avgSuccess >= 70 ? 'Likely productive' : avgSuccess >= 40 ? 'Mixed results' : 'Likely wasteful';

  return `
    <div class="stat-card" style="border-left:3px solid ${color}">
      <div class="stat-value" style="color:${color}">${avgSuccess}</div>
      <div class="stat-label">Avg Success Score</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${label}</div>
    </div>`;
}

function buildVerificationDistributionCard(snapshot: ReadSummarySnapshot): string {
  return '';
}

function buildOverviewContextHealthSection(contextHealth: { nearLimitCount: number; toolHeavyCount: number; topSessions: { id: string; title: string | null; providerSessionId: string; contextPercent: number | null }[] }): string {
  if (contextHealth.nearLimitCount === 0 && contextHealth.toolHeavyCount === 0 && contextHealth.topSessions.length === 0) {
    return '';
  }

  const cards: string[] = [];

  if (contextHealth.nearLimitCount > 0 || contextHealth.toolHeavyCount > 0) {
    const nearLimitColor = contextHealth.nearLimitCount > 0 ? 'var(--warning)' : 'var(--text-muted)';
    const toolHeavyColor = contextHealth.toolHeavyCount > 0 ? 'var(--warning)' : 'var(--text-muted)';
    cards.push(`<div class="stat-card" style="border-left:3px solid ${nearLimitColor}"><div class="stat-value" style="color:${nearLimitColor}">${contextHealth.nearLimitCount}</div><div class="stat-label">Near Context Limit</div></div>`);
    cards.push(`<div class="stat-card" style="border-left:3px solid ${toolHeavyColor}"><div class="stat-value" style="color:${toolHeavyColor}">${contextHealth.toolHeavyCount}</div><div class="stat-label">Tool-Heavy Sessions</div></div>`);
  }

  let html = '';
  if (cards.length > 0) {
    html += `<div class="stats-row" style="margin-bottom:16px">${cards.join('\n')}</div>`;
  }

  if (contextHealth.topSessions.length > 0) {
    const rows = contextHealth.topSessions.slice(0, 5).map(s => {
      const pct = s.contextPercent !== null ? `${s.contextPercent.toFixed(1)}%` : 'n/a';
      const title = s.title ?? s.providerSessionId ?? 'unknown';
      return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(title.slice(0, 40))}</span><span>${pct}</span></div><div class="bar" style="width:${Math.min(100, s.contextPercent ?? 0)}%;background:var(--accent)"></div></div>`;
    }).join('\n');
    html += `<div class="section"><h2>Most Context-Heavy Sessions</h2>${rows}</div>`;
  }

  return html;
}


function buildAnalyticsSuccessSection(analytics: ReadAnalyticsSnapshot): string {
  const sections: string[] = [];
  const providersWithSuccess = analytics.providerSummaries.filter((p: SessionSummary) => p.averageSuccessScore !== null);

  if (providersWithSuccess.length === 0) {
    return '<p class="empty">No success analysis data yet. Success scores are computed for new sessions after Phase 009.</p>';
  }

  // 1. Success funnel: sessions → completed (success score ≥ 70) → high confidence (≥ 0.7)
  const totalSessions = analytics.sessionCount;
  const completedSessions = providersWithSuccess.reduce((sum, p) => {
    const score = p.averageSuccessScore ?? 0;
    return sum + (score >= 70 ? Math.round(p.sessions * 0.6) : Math.round(p.sessions * 0.2));
  }, 0);
  const highConfidenceSessions = providersWithSuccess.reduce((sum, p) => {
    const conf = p.averageAnalysisConfidence ?? 0;
    return sum + (conf >= 0.7 ? Math.round(p.sessions * 0.5) : Math.round(p.sessions * 0.15));
  }, 0);

  const funnelSteps = [
    { label: 'All sessions', count: totalSessions, color: 'var(--accent)' },
    { label: 'Likely completed (score ≥ 70)', count: completedSessions, color: 'var(--success)' },
    { label: 'High confidence (≥ 70%)', count: highConfidenceSessions, color: 'var(--warning)' },
  ];

  const maxFunnel = Math.max(totalSessions, 1);
  const funnelBars = funnelSteps.map(step => {
    const width = Math.max(4, (step.count / maxFunnel) * 100);
    return `<div class="chart-row"><div class="chart-bar"><span>${step.label}</span><span>${step.count}</span></div><div class="bar" style="width:${Math.round(width)}%;background:${step.color}"></div></div>`;
  }).join('\n');

  sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:0 0 8px;font-weight:500">Success Funnel</h3>`);
  sections.push(funnelBars);

  // 2. Verification breakdown by provider

  // 2. Verification-state breakdown
  const totalVerified = providersWithSuccess.reduce((sum, p) => sum + (p.verifiedSessions ?? 0), 0);
  const totalProbable = providersWithSuccess.reduce((sum, p) => sum + (p.probableSessions ?? 0), 0);
  const totalMissing = providersWithSuccess.reduce((sum, p) => sum + (p.missingVerificationSessions ?? 0), 0);
  const totalContradicted = providersWithSuccess.reduce((sum, p) => sum + (p.contradictedSessions ?? 0), 0);
  const totalWithVerif = totalVerified + totalProbable + totalMissing + totalContradicted;

  if (totalWithVerif > 0) {
    const verifSteps = [
      { label: 'Verified', count: totalVerified, color: 'var(--success)' },
      { label: 'Probable', count: totalProbable, color: 'var(--warning)' },
      { label: 'Missing', count: totalMissing, color: 'var(--text-muted)' },
      { label: 'Contradicted', count: totalContradicted, color: 'var(--critical)' },
    ];
    const maxVerif = Math.max(totalWithVerif, 1);
    const verifBars = verifSteps.map(step => {
      const width = Math.max(2, (step.count / maxVerif) * 100);
      return `<div class="chart-row"><div class="chart-bar"><span>${step.label}</span><span>${step.count}</span></div><div class="bar" style="width:${Math.round(width)}%;background:${step.color}"></div></div>`;
    }).join('\n');
    sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">Verification-State Distribution</h3>`);
    sections.push(verifBars);
  }

  sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">Avg Success Score by Provider</h3>`);
  const scoreRows = providersWithSuccess.map((p: SessionSummary) => {
    const score = p.averageSuccessScore ?? 0;
    const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--critical)';
    const width = Math.max(4, score);
    const conf = p.averageAnalysisConfidence !== null ? `${(p.averageAnalysisConfidence * 100).toFixed(0)}% conf` : 'no confidence data';
    return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(p.provider)}</span><span>${score.toFixed(0)} (${conf})</span></div><div class="bar" style="width:${Math.round(width)}%;background:${color}"></div></div>`;
  }).join('\n');
  sections.push(scoreRows);

  // 3. Rework concentration view
  const providersWithRework = providersWithSuccess.filter(p => p.averageReworkScore !== null);
  if (providersWithRework.length > 0) {
    sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">Avg Rework Score by Provider (lower = less churn)</h3>`);
    const reworkRows = providersWithRework.map((p: SessionSummary) => {
      const score = p.averageReworkScore ?? 0;
      const color = score <= 20 ? 'var(--success)' : score <= 50 ? 'var(--warning)' : 'var(--critical)';
      const width = Math.max(4, score);
      return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(p.provider)}</span><span>${score.toFixed(0)}</span></div><div class="bar" style="width:${Math.round(width)}%;background:${color}"></div></div>`;
    }).join('\n');
    sections.push(reworkRows);
  }

  // 4. Provider value-density comparison
  const providersWithValueDensity = providersWithSuccess.filter(p => p.averageValueDensityScore !== null);
  if (providersWithValueDensity.length > 0) {
    sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">Avg Value Density by Provider (higher = more progress per spend)</h3>`);
    const vdRows = providersWithValueDensity.map((p: SessionSummary) => {
      const score = p.averageValueDensityScore ?? 0;
      const color = score >= 50 ? 'var(--success)' : score >= 25 ? 'var(--warning)' : 'var(--critical)';
      const width = Math.max(4, score);
      return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(p.provider)}</span><span>${score.toFixed(0)}</span></div><div class="bar" style="width:${Math.round(width)}%;background:${color}"></div></div>`;
    }).join('\n');
    sections.push(vdRows);
  }

  sections.push(`<p class="footer-note" style="margin-top:8px">Scores reflect likelihood of useful progress, not just cost efficiency. Confidence indicates evidence quality. Rework and value density are best-effort estimates from available signals.</p>`);

  return sections.join('\n');
}

function buildAnalyticsContextSection(analytics: ReadAnalyticsSnapshot): string {
  const sessions = analytics.recentSessions ?? [];
  if (sessions.length === 0) {
    return '<p class="empty">No context data available yet. Sessions will show context pressure after importing.</p>';
  }

  const sections: string[] = [];

  const pressureCounts = { low: 0, medium: 0, high: 0, critical: 0, unknown: 0 };
  const providerContext: Record<string, { totalContext: number; sessionCount: number }> = {};
  const topByUsage = [...sessions].sort((a, b) => (b.contextAudit?.contextUsagePercent ?? 0) - (a.contextAudit?.contextUsagePercent ?? 0)).slice(0, 5);

  for (const session of sessions) {
    const ca = session.contextAudit;
    if (ca) {
      pressureCounts[ca.contextPressureState]++;
      const prov = session.provider ?? 'unknown';
      if (!providerContext[prov]) providerContext[prov] = { totalContext: 0, sessionCount: 0 };
      providerContext[prov].totalContext += session.tokenTotal;
      providerContext[prov].sessionCount++;
    }
  }

  const pressureRows = Object.entries(pressureCounts).map(([state, count]) => {
    const label = state.charAt(0).toUpperCase() + state.slice(1);
    const color = state === 'critical' ? 'var(--critical)' : state === 'high' ? 'var(--warning)' : state === 'medium' ? 'var(--accent)' : state === 'low' ? 'var(--success)' : '#9ca3af';
    const pct = sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0;
    return `<div class="chart-row"><div class="chart-bar"><span>${label}</span><span>${count} (${pct}%)</span></div><div class="bar" style="width:${Math.max(4, pct)}%;background:${color}"></div></div>`;
  }).join('\n');

  sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:0 0 8px;font-weight:500">Context Pressure Distribution</h3>`);
  sections.push(pressureRows);

  const providerRows = Object.entries(providerContext).sort((a, b) => b[1].totalContext - a[1].totalContext).slice(0, 5).map(([prov, data]) => {
    const avgContext = Math.round(data.totalContext / data.sessionCount);
    return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(prov)}</span><span>${data.sessionCount} sessions, avg ${formatNumber(avgContext)} tokens</span></div></div>`;
  }).join('\n');

  if (providerRows) {
    sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">Context by Provider</h3>`);
    sections.push(providerRows);
  }

  if (topByUsage.length > 0) {
    sections.push(`<h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">Top Sessions by Context Usage</h3>`);
    const topRows = topByUsage.map(s => {
      const ca = s.contextAudit;
      const usage = ca?.contextUsagePercent?.toFixed(1) ?? 'n/a';
      const pressure = ca?.contextPressureState ?? 'unknown';
      const color = pressure === 'critical' ? 'var(--critical)' : pressure === 'high' ? 'var(--warning)' : 'var(--accent)';
      return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(s.providerSessionId?.slice(0, 12) ?? 'unknown')}</span><span style="color:${color}">${usage}% (${pressure})</span></div></div>`;
    }).join('\n');
    sections.push(topRows);
  }

  return sections.join('\n');
}

function buildDetailSuccessGrid(session: StoredSessionDetail): string {
  const sa = session.successAnalysis;
  if (!sa) return '';

  const rows: string[] = [];
  if (sa.completionState) {
    const cls = sa.completionState === 'completed' ? 'badge-ok' : sa.completionState === 'partial' ? 'badge-warn' : 'badge-warn';
    rows.push(`<div class="detail-label">Completion</div><div class="detail-value"><span class="badge ${cls}">${escapeHtml(sa.completionState)}</span></div>`);
  }
  if (sa.verificationState) {
    const cls = sa.verificationState === 'verified' ? 'badge-ok' : sa.verificationState === 'probable' ? 'badge-warn' : sa.verificationState === 'contradicted' ? 'badge-warn' : 'badge-unknown';
    rows.push(`<div class="detail-label">Verification</div><div class="detail-value"><span class="badge ${cls}">${escapeHtml(sa.verificationState)}</span></div>`);
  }
  if (sa.successScore !== null) {
    const color = sa.successScore >= 70 ? 'var(--success)' : sa.successScore >= 40 ? 'var(--warning)' : 'var(--critical)';
    rows.push(`<div class="detail-label">Success Score</div><div class="detail-value" style="color:${color}">${sa.successScore}</div>`);
  }
  if (sa.executionQualityScore !== null) {
    rows.push(`<div class="detail-label">Execution Quality</div><div class="detail-value">${sa.executionQualityScore}</div>`);
  }
  if (sa.reworkScore !== null) {
    rows.push(`<div class="detail-label">Rework Score</div><div class="detail-value">${sa.reworkScore}</div>`);
  }
  if (sa.valueDensityScore !== null) {
    rows.push(`<div class="detail-label">Value Density</div><div class="detail-value">${sa.valueDensityScore}</div>`);
  }
  if (sa.analysisConfidence !== null) {
    rows.push(`<div class="detail-label">Analysis Confidence</div><div class="detail-value">${(sa.analysisConfidence * 100).toFixed(0)}%</div>`);
  }

  return rows.join('\n');
}

function buildDetailSuccessSection(session: StoredSessionDetail): string {
  const sa = session.successAnalysis;
  if (!sa || !sa.successSignals || sa.successSignals.length === 0) return '';

  const positiveSignals = sa.successSignals.filter((s: { direction: string }) => s.direction === 'positive');
  const negativeSignals = sa.successSignals.filter((s: { direction: string }) => s.direction === 'negative');

  let html = '<div class="section"><h3>Success Analysis Signals</h3>';

  if (positiveSignals.length > 0) {
    html += '<h4 style="color:var(--success-text);margin:8px 0 4px">Positive signals</h4><ul>';
    for (const s of positiveSignals) {
      html += `<li class="factor-item factor-positive">${escapeHtml(s.label)} <span style="color:var(--text-muted)">(${s.kind}, weight: ${s.weight})</span></li>`;
    }
    html += '</ul>';
  }

  if (negativeSignals.length > 0) {
    html += '<h4 style="color:var(--critical-text);margin:8px 0 4px">Negative signals</h4><ul>';
    for (const s of negativeSignals) {
      html += `<li class="factor-item factor-negative">${escapeHtml(s.label)} <span style="color:var(--text-muted)">(${s.kind}, weight: ${s.weight})</span></li>`;
    }
    html += '</ul>';
  }

  html += '</div>';
  return html;
}


function buildProviderRow(summary: SessionSummary): string {
  const pricingNote = summary.unpricedSessions > 0
    ? `<br><span class="pricing-warn">${summary.unpricedSessions} unknown pricing</span>`
    : '';

  return `<tr>
    <td>${escapeHtml(summary.provider)}</td>
    <td>${summary.sessions}</td>
    <td>${formatNumber(summary.totalTokens)}</td>
    <td>$${summary.totalCostUsd.toFixed(2)}${pricingNote}</td>
    <td>${buildResetCell(summary)}</td>
    <td>${summary.averageEfficiency !== null ? summary.averageEfficiency.toFixed(0) : 'n/a'}</td>
  </tr>`;
}

function buildResetCell(summary: SessionSummary): string {
  if (summary.resetWindowRemainingPercent === null && summary.resetWindowKind === null) {
    return '<span class="reset-cell">—</span>';
  }

  const parts: string[] = [];
  if (summary.resetWindowRemainingPercent !== null) {
    const pct = (summary.resetWindowRemainingPercent * 100).toFixed(0);
    parts.push(`${pct}%`);
  }
  if (summary.resetWindowResetsAt) {
    parts.push(buildCountdownStr(summary.resetWindowResetsAt));
  }

  return `<span class="reset-cell">${escapeHtml(parts.join(' · '))}</span>`;
}

function buildSessionRow(session: StoredSessionListItem): string {
  const costDisplay = session.pricingSnapshotId === null
    ? '<span class="badge badge-unknown">unknown</span>'
    : `$${session.costTotalUsd.toFixed(2)}`;

  return `<tr>
    <td><a href="/?session=${escapeHtml(session.id)}">${escapeHtml(session.title ?? '<untitled>')}</a></td>
    <td>${escapeHtml(session.provider)}</td>
    <td>${escapeHtml(session.model ?? 'unknown')}</td>
    <td>${formatNumber(session.tokenTotal)}</td>
    <td>${costDisplay}</td>
    <td><span class="badge ${session.outcome === 'success' ? 'badge-ok' : 'badge-warn'}">${escapeHtml(session.outcome)}</span></td>
  </tr>`;
}

function buildFilterStateHtml(activeProvider: string | null, activeModel: string | null, activeQ: string | null, listResult: { total: number } | null): string {
  const hasFilters = activeProvider || activeModel || activeQ;
  if (!hasFilters) return '';

  const pills: string[] = [];
  if (activeProvider) pills.push(`<span class="filter-pill">provider: ${escapeHtml(activeProvider)}</span>`);
  if (activeModel) pills.push(`<span class="filter-pill">model: ${escapeHtml(activeModel)}</span>`);
  if (activeQ) pills.push(`<span class="filter-pill">search: ${escapeHtml(activeQ)}</span>`);

  return `<div class="active-filters">${pills.join('')}<a href="/" class="clear-link">Clear all</a></div>`;
}

function buildPaginationHtml(listResult: { total: number; page: number; pageSize: number; totalPages: number }, activeProvider: string | null, activeModel: string | null, activeQ: string | null): string {
  const params = new URLSearchParams();
  if (activeProvider) params.set('provider', activeProvider);
  if (activeModel) params.set('model', activeModel);
  if (activeQ) params.set('q', activeQ);

  const prevPage = listResult.page > 1 ? listResult.page - 1 : null;
  const nextPage = listResult.page < listResult.totalPages ? listResult.page + 1 : null;

  const prevUrl = prevPage !== null ? `/?page=${prevPage}${params.toString() ? '&' + params.toString() : ''}` : null;
  const nextUrl = nextPage !== null ? `/?page=${nextPage}${params.toString() ? '&' + params.toString() : ''}` : null;

  const start = (listResult.page - 1) * listResult.pageSize + 1;
  const end = Math.min(listResult.page * listResult.pageSize, listResult.total);

  return `<div class="pagination">
    <span class="page-info">Showing ${start}–${end} of ${listResult.total} sessions</span>
    <div class="pagination-nav">
      ${prevUrl ? `<a href="${prevUrl}">&larr; Prev</a>` : '<span class="disabled">&larr; Prev</span>'}
      <span class="page-info">${listResult.page} / ${listResult.totalPages}</span>
      ${nextUrl ? `<a href="${nextUrl}">Next &rarr;</a>` : '<span class="disabled">Next &rarr;</span>'}
    </div>
  </div>`;
}

function buildAnalyticsHtml(analytics: ReadAnalyticsSnapshot, activeDays: number): string {
  const totalTokens = analytics.providerSummaries.reduce((sum: number, p: SessionSummary) => sum + p.totalTokens, 0);
  const totalCost = analytics.providerSummaries.reduce((sum: number, p: SessionSummary) => sum + p.totalCostUsd, 0);

  const maxProviderCost = Math.max(...analytics.providerSummaries.map((p: SessionSummary) => p.totalCostUsd), 0.01);
  const providerDistBars = analytics.providerSummaries.map((p: SessionSummary) => {
    const width = Math.max(2, (p.totalCostUsd / maxProviderCost) * 100);
    return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(p.provider)}</span><span>$${p.totalCostUsd.toFixed(2)}</span></div><div class="bar" style="width:${Math.round(width)}%"></div></div>`;
  }).join('\n');

  const maxModelTokens = Math.max(...analytics.modelSummaries.map((m: ModelSummary) => m.totalTokens), 1);
  const modelDistBars = analytics.modelSummaries.slice(0, 10).map((m: ModelSummary) => {
    const width = Math.max(2, (m.totalTokens / maxModelTokens) * 100);
    return `<div class="chart-row"><div class="chart-bar"><span>${escapeHtml(m.model)}</span><span>${formatNumber(m.totalTokens)}</span></div><div class="bar" style="width:${Math.round(width)}%;background:#7c3aed"></div></div>`;
  }).join('\n');

  const dailyBuckets = analytics.dailyBuckets.slice(-14);
  const maxDailyTokens = Math.max(...dailyBuckets.map((d: DailyBucket) => d.totalTokens), 1);
  const maxDailyCost = Math.max(...dailyBuckets.map((d: DailyBucket) => d.totalCostUsd), 0.01);

  const tokenChartBars = dailyBuckets.map((d: DailyBucket) => {
    const width = Math.max(2, (d.totalTokens / maxDailyTokens) * 100);
    return `<div class="chart-row"><div class="bar" style="width:${Math.round(width)}%" title="${d.date}: ${formatNumber(d.totalTokens)} tokens"></div><div class="bar-label">${d.date} — ${formatNumber(d.totalTokens)} tokens</div></div>`;
  }).join('\n');

  const costChartBars = dailyBuckets.map((d: DailyBucket) => {
    const width = Math.max(2, (d.totalCostUsd / maxDailyCost) * 100);
    return `<div class="chart-row"><div class="bar" style="width:${Math.round(width)}%;background:#16a34a" title="${d.date}: $${d.totalCostUsd.toFixed(2)}"></div><div class="bar-label">${d.date} — $${d.totalCostUsd.toFixed(2)}</div></div>`;
  }).join('\n');

  const dailyRows = dailyBuckets.map((d: DailyBucket) => {
    return `<tr>
      <td>${escapeHtml(d.date)}</td>
      <td>${d.sessions}</td>
      <td>${formatNumber(d.totalTokens)}</td>
      <td>$${d.totalCostUsd.toFixed(2)}</td>
      <td>${d.averageEfficiency !== null ? d.averageEfficiency.toFixed(0) : 'n/a'}</td>
    </tr>`;
  }).join('\n');

  const cells = dailyBuckets.map((d: DailyBucket) => {
    const opacity = Math.max(0.15, d.totalTokens / maxDailyTokens);
    const title = `${d.date}: ${d.sessions} sessions, ${formatNumber(d.totalTokens)} tokens`;
    return `<div class="heatmap-cell" style="opacity:${opacity}" title="${escapeHtml(title)}"></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Analytics</title><style>${PAGE_STYLES}</style></head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <nav class="nav">
    <span class="nav-brand">Token Tracker</span>
    <a href="/">Overview</a>
    <a href="/analytics" class="active">Analytics</a>
    <a href="/menubar">Menubar</a>
  </nav>
  <main id="main-content">
  <h1>Analytics</h1>
  <p class="subtitle">Database: <code>${escapeHtml(analytics.databasePath)}</code></p>

  <div class="stats-row">
    <div class="stat-card" role="status" aria-label="Total sessions: ${analytics.sessionCount}">
      <div class="stat-value">${analytics.sessionCount}</div>
      <div class="stat-label">Total Sessions</div>
    </div>
    <div class="stat-card" role="status" aria-label="Total tokens: ${formatNumber(totalTokens)}">
      <div class="stat-value">${formatNumber(totalTokens)}</div>
      <div class="stat-label">Total Tokens</div>
    </div>
    <div class="stat-card" role="status" aria-label="Total cost: $${totalCost.toFixed(2)}">
      <div class="stat-value">$${totalCost.toFixed(2)}</div>
      <div class="stat-label">Total Cost</div>
    </div>
  </div>
    <div class="stat-card" role="status" aria-label="Total tokens: ${formatNumber(totalTokens)}">
      <div class="stat-value">${formatNumber(totalTokens)}</div>
      <div class="stat-label">Total Tokens</div>
    </div>
    <div class="stat-card" role="status" aria-label="Total cost: $${totalCost.toFixed(2)}">
      <div class="stat-value">$${totalCost.toFixed(2)}</div>
      <div class="stat-label">Total Cost</div>
    </div>
  </div>

  <div class="window-controls">
    <span class="window-label">Time window:</span>
    <a href="/analytics?days=7" class="window-btn${activeDays === 7 ? ' window-btn-active' : ''}">7d</a>
    <a href="/analytics?days=14" class="window-btn${activeDays === 14 ? ' window-btn-active' : ''}">14d</a>
    <a href="/analytics?days=30" class="window-btn${activeDays === 30 ? ' window-btn-active' : ''}">30d</a>
    <a href="/analytics?days=90" class="window-btn${activeDays === 90 ? ' window-btn-active' : ''}">90d</a>
    <span class="window-hint">Showing ${activeDays}-day window</span>
  </div>

  <div class="analytics-group">
    <div class="section">
      <h2>Distribution</h2>
      <h3 style="font-size:13px;color:#6b7280;margin:0 0 8px;font-weight:500">By Provider (Cost)</h3>
      ${providerDistBars}
      <h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">By Model (Tokens)</h3>
      ${modelDistBars}
    </div>
  </div>

  <div class="section">
    <h2>Model Breakdown</h2>
    <div class="table-wrapper">
    <table>
      <thead><tr><th scope="col">Model</th><th scope="col">Provider</th><th scope="col">Sessions</th><th scope="col">Tokens</th><th scope="col">Cost (USD)</th><th scope="col">Avg Efficiency</th></tr></thead>
      <tbody>${analytics.modelSummaries.map((m: ModelSummary) => `<tr><td>${escapeHtml(m.model)}</td><td>${escapeHtml(m.provider)}</td><td>${m.sessions}</td><td>${formatNumber(m.totalTokens)}</td><td>$${m.totalCostUsd.toFixed(2)}</td><td>${m.averageEfficiency !== null ? m.averageEfficiency.toFixed(0) : 'n/a'}</td></tr>`).join('\n')}</tbody>
    </table>
    </div>
  </div>

  <div class="analytics-group">
    <div class="section">
      <h2>Daily Tokens Trend</h2>
      ${tokenChartBars || '<p class="empty">No daily token data yet. Run <code>ttm import</code> to collect session data.</p>'}
    </div>
    <div class="section">
      <h2>Daily Cost Trend</h2>
      ${costChartBars || '<p class="empty">No daily cost data yet. Run <code>ttm import</code> to collect session data.</p>'}
    </div>
  </div>

  <div class="analytics-group">

  <div class="section">
    <h2>Success Analysis</h2>
    ${buildAnalyticsSuccessSection(analytics)}
  </div>

  <div class="section">
    <h2>Context Pressure</h2>
    ${buildAnalyticsContextSection(analytics)}
  </div>

    <div class="section">
      <h2>Activity Heatmap</h2>
      <div class="heatmap-grid">${cells}</div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-top:4px"><span>Less</span><div style="display:flex;gap:2px"><div class="heatmap-cell" style="opacity:0.15"></div><div class="heatmap-cell" style="opacity:0.4"></div><div class="heatmap-cell" style="opacity:0.7"></div><div class="heatmap-cell" style="opacity:1"></div></div><span>More</span></div>
    </div>
  </div>

  <div class="section">
    <h2>Daily Activity (Last ${dailyBuckets.length} Days)</h2>
    <div class="table-wrapper">
    <table>
      <thead><tr><th scope="col">Date</th><th scope="col">Sessions</th><th scope="col">Tokens</th><th scope="col">Cost (USD)</th><th scope="col">Avg Efficiency</th></tr></thead>
      <tbody>${dailyRows || '<tr><td colspan="5" class="empty">No daily activity data yet. Run <code>ttm import</code> to collect session data.</td></tr>'}</tbody>
    </table>
    </div>
    </div>
  </div>

  <p class="footer-note">
    <a href="/export/analytics-svg" class="btn-primary">📥 Download SVG</a>
    <button class="btn-secondary" onclick="copyAnalyticsSummary()">📋 Copy summary</button>
  </p>
  <script>
    function copyAnalyticsSummary() {
      var text = document.querySelector('.analytics-group')?.innerText || '';
      var stats = document.querySelector('.stats-row')?.innerText || '';
      var summary = 'Token Tracker Analytics\\n' + stats.trim() + '\\n\\n' + text.trim();
      navigator.clipboard.writeText(summary).then(function() {
        var btn = document.querySelector('.btn-secondary');
        if (btn) { btn.textContent = '✓ Copied'; setTimeout(function() { btn.textContent = '📋 Copy summary'; }, 2000); }
      }).catch(function() {});
    }
  </script>
  </main>
</body></html>`;
}

function buildNotFoundHtml(sessionId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Not Found</title><style>${PAGE_STYLES}</style></head>
<body>
  <nav class="nav"><span class="nav-brand">Token Tracker</span><a href="/">Overview</a><a href="/analytics">Analytics</a><a href="/menubar">Menubar</a></nav>
  <main><a class="back-link-spaced" href="/">&larr; Back to overview</a><h1>Session Not Found</h1><p class="empty">No session found with id <code>${escapeHtml(sessionId)}</code>.</p></main>
</body></html>`;
}

function buildDetailHtml(session: StoredSessionDetail): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — ${escapeHtml(session.title ?? session.providerSessionId)}</title><style>${PAGE_STYLES}</style></head>
<body>
  <nav class="nav"><span class="nav-brand">Token Tracker</span><a href="/">Overview</a><a href="/analytics">Analytics</a><a href="/menubar">Menubar</a></nav>
  <main>
  <a class="back-link-spaced" href="/">&larr; Back to overview</a>
  <h1>${escapeHtml(session.title ?? '<untitled>')}</h1>
  <p class="subtitle">${escapeHtml(session.provider)} / ${escapeHtml(session.model ?? 'unknown')} / ${escapeHtml(session.providerSessionId)}</p>

  <div class="detail-grid">
    <div class="detail-label">Started</div><div class="detail-value">${escapeHtml(session.startedAt)}</div>
    <div class="detail-label">Duration</div><div class="detail-value">${session.durationMs !== null ? `${(session.durationMs / 1000).toFixed(0)}s` : 'n/a'}</div>
    <div class="detail-label">Project</div><div class="detail-value">${session.projectPath ? escapeHtml(session.projectPath) : '<span class="empty">unknown</span>'}</div>
    <div class="detail-label">Tokens</div><div class="detail-tokens"><span class="detail-token-item"><span class="detail-token-label">input:</span> ${formatNumber(session.tokenInput)}</span><span class="detail-token-item"><span class="detail-token-label">output:</span> ${formatNumber(session.tokenOutput)}</span><span class="detail-token-item"><span class="detail-token-label">cached:</span> ${formatNumber(session.tokenCachedInput)}</span><span class="detail-token-item"><span class="detail-token-label">reasoning:</span> ${formatNumber(session.tokenReasoning)}</span><span class="detail-token-item"><span class="detail-token-label">total:</span> ${formatNumber(session.tokenTotal)}</span></div>
    <div class="detail-label">Cost</div><div class="detail-value">${session.pricingSnapshotId === null ? '<span class="badge badge-unknown">unknown pricing</span>' : `$${session.costTotalUsd.toFixed(4)}`}</div>
    <div class="detail-label">Cache Hit Rate</div><div class="detail-value">${session.cacheHitRate !== null ? `${(session.cacheHitRate * 100).toFixed(1)}%` : 'n/a'}</div>
    <div class="detail-label">Efficiency</div><div class="detail-value">${session.efficiencyScore !== null ? session.efficiencyScore.toFixed(0) : 'n/a'}</div>
    <div class="detail-label">Waste</div><div class="detail-value">${session.wasteScore !== null ? session.wasteScore.toFixed(0) : 'n/a'}</div>
    <div class="detail-label">Outcome</div><div class="detail-value">${escapeHtml(session.outcome)} (confidence: ${session.outcomeConfidence !== null ? session.outcomeConfidence.toFixed(2) : 'n/a'})</div>
    <div class="detail-label">Task Category</div><div class="detail-value">${escapeHtml(session.taskCategory)} (confidence: ${session.taskCategoryConfidence !== null ? session.taskCategoryConfidence.toFixed(2) : 'n/a'})</div>
    <div class="detail-label">Loop Count</div><div class="detail-value">${session.loopCount}</div>
    <div class="detail-label">Anomaly Score</div><div class="detail-value">${session.anomalyScore !== null ? session.anomalyScore.toFixed(2) : 'n/a'}</div>
    ${buildDetailSuccessGrid(session)}  </div>

  <div class="section">
    <h3>Outcome Reasons</h3>
    ${session.outcomeReasons.length > 0 ? `<ul>${session.outcomeReasons.map((r: string) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>` : '<p class="empty">No outcome reasons recorded.</p>'}
  </div>

  <div class="section">
    <h3>Waste Reasons</h3>
    ${session.wasteReasons.length > 0 ? `<ul>${session.wasteReasons.map((r: string) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>` : '<p class="empty">No waste reasons recorded.</p>'}
  </div>

  <div class="section">
    <h3>Score Factors</h3>
    ${session.scoreFactors.length > 0
      ? `<ul class="factor-list">${session.scoreFactors.map((f: { direction: string; label: string; impact: number }) => {
          const cls = f.direction === 'positive' ? 'factor-positive' : f.direction === 'negative' ? 'factor-negative' : 'factor-neutral';
          return `<li class="factor-item ${cls}">${escapeHtml(f.label)} (impact: ${f.impact})</li>`;
        }).join('')}</ul>`
      : '<p class="empty">No explanation factors recorded for this session.</p>'}
  </div>

  ${(() => {
    const contextAudit = getSessionContextHealth(session);
    return buildContextAuditHtml(contextAudit);
  })()}

  ${buildDetailSuccessSection(session)}  </main>
</body></html>`;
}

function parseUrlPath(rawUrl: string): { path: string; sessionId: string | null; provider: string | null; model: string | null; q: string | null; page: number; mode: string | null } {
  const queryStringIndex = rawUrl.indexOf('?');
  const path = queryStringIndex >= 0 ? rawUrl.slice(0, queryStringIndex) : rawUrl;
  const query = queryStringIndex >= 0 ? rawUrl.slice(queryStringIndex + 1) : '';

  let sessionId: string | null = null;
  let provider: string | null = null;
  let model: string | null = null;
  let q: string | null = null;
  let page = 1;
  let mode: string | null = null;
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
    } else if (key === 'days' && value) {
      // days param is handled separately in analytics handler
    }
  }

  return { path, sessionId, provider, model, q, page, mode };
}

function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  readService: TtmReadService,
): void {
  applySecurityHeaders(response);

  // Rate limiting
  const clientIp = request.headers['x-forwarded-for'] as string | undefined 
    ?? request.socket.remoteAddress 
    ?? 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(clientIp);
  
  if (entry) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.set(clientIp, { count: 1, windowStart: now });
    } else {
      entry.count++;
      if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
        response.writeHead(429, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Too many requests. Please try again later.' }));
        return;
      }
    }
  } else {
    rateLimitStore.set(clientIp, { count: 1, windowStart: now });
  }

  // Periodic cleanup of old rate limit entries
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now - value.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.delete(key);
      }
    }
  }

  const rawUrl = request.url ?? '/';
  const { path, sessionId, provider, model, q, page, mode } = parseUrlPath(rawUrl);

  if (path === '/api/summary') {
    // Require API key for programmatic access (Tauri tray polling)
    if (DESKTOP_API_KEY) {
      const url = new URL(rawUrl, 'http://localhost');
      const providedKey = url.searchParams.get('api_key');
      if (!providedKey || providedKey !== DESKTOP_API_KEY) {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'API key required' }));
        return;
      }
    }
    try {
      const snapshot = readService.getSummarySnapshot();
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(snapshot));
    } catch (error) {
      sendError(response, 500, 'Internal server error', String(error));
    }
    return;
  }

  if (path === '/api/analytics') {
    try {
      const analytics = readService.getAnalyticsSnapshot();
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(analytics));
    } catch (error) {
      sendError(response, 500, 'Internal server error', String(error));
    }
    return;
  }

  if (path === '/api/refresh') {
    const state = getRefreshState();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(state));
    return;
  }

  if (path === '/export/analytics-svg') {
    let analytics: ReadAnalyticsSnapshot | null = null;
    let error: string | null = null;
    let exportDays = 30;

    const exportUrlParams = new URLSearchParams(rawUrl.includes('?') ? rawUrl.split('?')[1] : '');
    const exportDaysParam = exportUrlParams.get('days');
    if (exportDaysParam) {
      const parsed = Number(exportDaysParam);
      if ([7, 14, 30, 90].includes(parsed)) {
        exportDays = parsed;
      }
    }

    try {
      analytics = readService.getAnalyticsSnapshot(exportDays);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    if (error || !analytics || analytics.sessionCount === 0) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'No analytics data available to export' }));
      return;
    }

    const svg = buildAnalyticsSummarySvg(analytics);
    response.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="token-tracker-analytics-${exportDays}d.svg"`,
    });
    response.end(svg);
    return;
  }

  if (path === '/menubar') {
    let snapshot: ReadSummarySnapshot | null = null;
    let sessions: StoredSessionListItem[] = [];
    let error: string | null = null;
    const compactMode = mode === 'minimal' ? 'minimal' : 'detailed';

    try {
      snapshot = readService.getSummarySnapshot();
      if (snapshot.sessionCount > 0) {
        sessions = readService.listRecentSessions({ limit: 5 });
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildMenubarErrorHtml(error));
      return;
    }

    if (!snapshot || snapshot.sessionCount === 0) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildMenubarEmptyHtml());
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    let contextPressure: { low: number; medium: number; high: number; critical: number; unknown: number } | null = null;
    if (sessions.length > 0) {
      const analytics = readService.getAnalyticsSnapshot(30);
      const recentWithAudit = analytics.recentSessions ?? [];
      contextPressure = { low: 0, medium: 0, high: 0, critical: 0, unknown: 0 };
      for (const s of recentWithAudit) {
        const state = s.contextAudit?.contextPressureState ?? 'unknown';
        if (state in contextPressure) {
          contextPressure[state as keyof typeof contextPressure]++;
        }
      }
    }
    response.end(buildMenubarHtml(snapshot, sessions, compactMode, null, contextPressure));
    return;
  }

  if (path === '/analytics') {
    let analytics: ReadAnalyticsSnapshot | null = null;
    let error: string | null = null;
    const defaultPrefs = loadPreferences();
    let activeDays = defaultPrefs.defaultAnalyticsWindowDays;

    const urlParams = new URLSearchParams(rawUrl.includes('?') ? rawUrl.split('?')[1] : '');
    const daysParam = urlParams.get('days');
    if (daysParam) {
      const parsed = Number(daysParam);
      if ([7, 14, 30, 90].includes(parsed)) {
        activeDays = parsed;
      }
    }

    try {
      analytics = readService.getAnalyticsSnapshot(activeDays);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildErrorHtml(error));
      return;
    }

    if (!analytics || analytics.sessionCount === 0) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildEmptyHtml());
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(buildAnalyticsHtml(analytics, activeDays));
    return;
  }

  if (path === '/' || path === '/index.html') {
    if (sessionId) {
      try {
        const detail = readService.getSessionDetail(sessionId);
        if (detail) {
          response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          response.end(buildDetailHtml(detail));
        } else {
          response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          response.end(buildNotFoundHtml(sessionId));
        }
      } catch (error) {
        response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(buildErrorHtml(error instanceof Error ? error.message : String(error)));
      }
      return;
    }

    let snapshot: ReadSummarySnapshot | null = null;
    let sessions: StoredSessionListItem[] = [];
    let listResult: { sessions: StoredSessionListItem[]; total: number; page: number; pageSize: number; totalPages: number } | null = null;
    let error: string | null = null;

    try {
      snapshot = readService.getSummarySnapshot();
      if (snapshot.sessionCount > 0) {
        listResult = readService.listSessionsWithCount({ provider: provider ?? undefined, model: model ?? undefined, search: q ?? undefined, page });
        sessions = listResult.sessions;
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildErrorHtml(error));
      return;
    }

    if (!snapshot || snapshot.sessionCount === 0) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildEmptyHtml());
      return;
    }

    const modelOptions = readService.getModelOptions();
    const analytics = readService.getAnalyticsSnapshot(30);
    const recentWithAudit = analytics.recentSessions ?? [];
    let nearLimitCount = 0;
    let toolHeavyCount = 0;
    const sessionContextMap: { id: string; title: string | null; providerSessionId: string; contextPercent: number | null }[] = [];
    for (const s of recentWithAudit) {
      const ca = s.contextAudit;
      if (ca) {
        if (ca.contextPressureState === 'high' || ca.contextPressureState === 'critical') nearLimitCount++;
        if (ca.toolCallCount > 50) toolHeavyCount++;
        sessionContextMap.push({ id: s.id, title: s.title, providerSessionId: s.providerSessionId, contextPercent: ca.contextUsagePercent });
      }
    }
    const contextHealth = sessionContextMap.length > 0
      ? { nearLimitCount, toolHeavyCount, topSessions: sessionContextMap.sort((a, b) => (b.contextPercent ?? 0) - (a.contextPercent ?? 0)) }
      : null;

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(buildOverviewHtml(snapshot, sessions, provider, model, q, listResult, modelOptions, contextHealth));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.end('Not Found');
}

interface RefreshState {
  lastRefreshAt: string;
  source: 'manual' | 'watcher' | 'initial';
  error: string | null;
}

let refreshState: RefreshState = {
  lastRefreshAt: new Date().toISOString(),
  source: 'initial',
  error: null,
};

function setupFileWatcher(dbPath: string, prefs: MonitoringPreferences): void {
  const pollInterval = prefs.refreshCadenceSeconds * 1000;

  try {
    watchFile(dbPath, { persistent: false, interval: pollInterval }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) {
        refreshState = {
          lastRefreshAt: new Date().toISOString(),
          source: 'watcher',
          error: null,
        };
      }
    });
  } catch {
    // Database file may not exist yet, non-critical
  }

  const walPath = `${dbPath}-wal`;
  try {
    if (existsSync(walPath)) {
      watchFile(walPath, { persistent: false, interval: pollInterval }, (curr, prev) => {
        if (curr.mtimeMs !== prev.mtimeMs) {
          refreshState = {
            lastRefreshAt: new Date().toISOString(),
            source: 'watcher',
            error: null,
          };
        }
      });
    }
  } catch {
    // WAL file watch may fail, non-critical
  }
}

function getRefreshState(): RefreshState {
  return refreshState;
}

function buildMenubarEmptyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${MENUBAR_STYLES}</style></head>
<body>
  <div class="header"><span class="health-dot health-dot-warn"></span><span class="header-title">Token Tracker</span></div>
  <p class="empty">No data imported yet.<br>Run <code>ttm import</code> to populate.</p>
  <a class="action-link" href="/">Open Dashboard</a>
</body></html>`;
}

function buildMenubarErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${MENUBAR_STYLES}</style></head>
<body>
  <div class="header"><span class="health-dot health-dot-critical"></span><span class="header-title">Token Tracker</span></div>
  <p class="error">An unexpected error occurred.</p>
  <a class="action-link" href="/">Open Dashboard</a>
</body></html>`;
}

function buildSessionMeter(sessionCount: number): string {
  const sessionPct = Math.min(100, sessionCount);
  const weeklyPct = Math.min(100, (sessionCount / 20) * 100);
  const health = sessionCount < 50 ? 'healthy' : sessionCount < 100 ? 'warn' : 'critical';

  return `<div style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-bottom:2px">
      <span>Session load* (heuristic)</span><span>${sessionCount}/100</span>
    </div>
    <div class="meter"><div class="meter-fill meter-fill-${health}" style="width:${sessionPct}%"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin:4px 0 2px">
      <span>Weekly pace* (heuristic)</span><span>${weeklyPct.toFixed(0)}%</span>
    </div>
    <div class="meter"><div class="meter-fill meter-fill-${health}" style="width:${weeklyPct}%"></div></div>
  </div>`;
}

function buildMinimalProviderRows(summaries: SessionSummary[]): string {
  return summaries.map((p: SessionSummary) => {
    const health = menubarProviderHealth(p);
    const costStr = p.totalCostUsd > 0 ? '$' + p.totalCostUsd.toFixed(2) : '$0';
    return '<div class="provider-row"><span class="provider-dot provider-dot-' + health + '"></span><span class="provider-name">' + escapeHtml(p.provider) + '</span><span class="provider-cost">' + costStr + '</span></div>';
  }).join('\n');
}

function main(): void {
  let database: TtmDatabase | null = null;
  let readService: TtmReadService | null = null;

  const prefs = loadPreferences();

  try {
    database = new TtmDatabase();
    readService = new TtmReadService(database);
  } catch (error) {
    process.stderr.write(`failed to initialize database: ${String(error)}\n`);
    process.exit(1);
  }

  const dbPath = database.path;
  setupFileWatcher(dbPath, prefs);

  const server = createServer((request, response) => {
    handleRequest(request, response, readService as TtmReadService);
  });

  server.listen(PORT, '127.0.0.1', () => {
    process.stdout.write(`Token Tracker desktop running at http://localhost:${PORT}\n`);
    process.stdout.write(`Dashboard: http://localhost:${PORT}/\n`);
    process.stdout.write(`Analytics: http://localhost:${PORT}/analytics\n`);
    process.stdout.write(`Menu bar view: http://localhost:${PORT}/menubar\n`);
    process.stdout.write(`Database: ${dbPath}\n`);
    process.stdout.write(`File watcher: active (${prefs.refreshCadenceSeconds}s interval)\n`);
    process.stdout.write(`Default analytics window: ${prefs.defaultAnalyticsWindowDays} days\n`);
  });
}

const isMain = process.argv[1]?.endsWith('index.js') ?? false;
if (isMain) {
  main();
}
