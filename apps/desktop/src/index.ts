#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { writeFileSync, mkdirSync, watchFile, existsSync } from 'node:fs';
import { join } from 'node:path';
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
import { escapeHtml, formatNumber, buildCountdownStr, menubarRelativeTime } from './helpers.js';
import { loadPreferences, savePreferences, type MonitoringPreferences } from './preferences.js';

const PORT = Number(process.env.TTM_DESKTOP_PORT ?? '3100');

function buildErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Error</title><style>${PAGE_STYLES}</style></head>
<body>
  <nav class="nav"><span class="nav-brand">Token Tracker</span><a href="/">Overview</a><a href="/analytics">Analytics</a><a href="/menubar">Menubar</a></nav>
  <main><h1>Error</h1><p class="error">${escapeHtml(message)}</p></main>
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

function buildOverviewHtml(snapshot: ReadSummarySnapshot, sessions: StoredSessionListItem[], activeProvider: string | null, activeModel: string | null, activeQ: string | null, listResult: { sessions: StoredSessionListItem[]; total: number; page: number; pageSize: number; totalPages: number } | null, modelOptions: { model: string; sessionCount: number }[]): string {
  const totalTokens = snapshot.providerSummaries.reduce((s, p) => s + p.totalTokens, 0);
  const totalCost = snapshot.providerSummaries.reduce((s, p) => s + p.totalCostUsd, 0);
  const providerRows = snapshot.providerSummaries.length > 0
    ? snapshot.providerSummaries.map((summary) => buildProviderRow(summary)).join('\n')
    : '<tr><td colspan="6" class="empty">no sessions recorded</td></tr>';

  const sessionRows = sessions.length > 0
    ? sessions.map((session) => buildSessionRow(session)).join('\n')
    : '<tr><td colspan="6" class="empty">no sessions to display</td></tr>';

  const paginationHtml = listResult && listResult.totalPages > 1
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
  <nav class="nav">
    <span class="nav-brand">Token Tracker</span>
    <a href="/" class="active">Overview</a>
    <a href="/analytics">Analytics</a>
    <a href="/menubar">Menubar</a>
    <span class="refresh-indicator" id="refresh-state" title="Auto-refresh: watching database"></span>
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">🌓</button>
  </nav>
  <main>

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
  </div>

  <div class="section">
    <h2>Provider Summaries</h2>
    <table>
      <thead><tr><th>Provider</th><th>Sessions</th><th>Total Tokens</th><th>Cost (USD)</th><th>Reset</th><th>Avg Efficiency</th></tr></thead>
      <tbody>${providerRows}</tbody>
    </table>
  </div>

  <div class="filter-section">
    <form method="get" action="/" class="filter-form" role="search" aria-label="Filter sessions">
      <label class="filter-label">Provider
        <select name="provider">
          <option value="">All providers</option>
          ${snapshot.providerSummaries.map((p) => `<option value="${escapeHtml(p.provider)}"${activeProvider === p.provider ? ' selected' : ''}>${escapeHtml(p.provider)}</option>`).join('')}
        </select>
      </label>
      <label class="filter-label">Model
        <select name="model">
          <option value="">All models</option>
          ${modelOptions.map((m) => `<option value="${escapeHtml(m.model)}"${activeModel === m.model ? ' selected' : ''}>${escapeHtml(m.model)}</option>`).join('')}
        </select>
      </label>
      <label class="filter-label">Search
        <input type="text" name="q" placeholder="Search title, session ID..." value="${escapeHtml(activeQ ?? '')}">
      </label>
      <button type="submit">Filter</button>
    </form>
  </div>

  <div class="section">
    <h2>Recent Sessions</h2>
    <table>
      <thead><tr><th>Session</th><th>Provider</th><th>Model</th><th>Tokens</th><th>Cost</th><th>Outcome</th></tr></thead>
      <tbody>${sessionRows}</tbody>
    </table>
  </div>

  ${paginationHtml}

  <p class="footer-note">Data is local-only. Run <code>ttm import</code> to refresh. <a href="/analytics">View analytics</a></p>
  <script>
    (function() {
      // Theme toggle
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
      // Refresh state
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
  </script>
  </main>
</body>
</html>`;
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

  return `<div class="pagination" role="navigation" aria-label="Pagination">
    <span class="page-info">Showing ${start}–${end} of ${listResult.total} sessions</span>
    <div class="pagination-nav">
      ${prevUrl ? `<a href="${prevUrl}">&larr; Prev</a>` : '<span class="disabled">&larr; Prev</span>'}
      <span class="page-info">${listResult.page} / ${listResult.totalPages}</span>
      ${nextUrl ? `<a href="${nextUrl}">Next &rarr;</a>` : '<span class="disabled">Next &rarr;</span>'}
    </div>
  </div>`;
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
    return '<span class="empty">—</span>';
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

function buildDetailHtml(session: StoredSessionDetail): string {
  const costDisplay = session.pricingSnapshotId === null
    ? '<span class="badge badge-unknown">unknown pricing</span>'
    : `$${session.costTotalUsd.toFixed(2)}`;

  const factorsHtml = session.scoreFactors.length > 0
    ? `<ul class="factor-list">${session.scoreFactors.map((f) => {
        const cls = f.direction === 'positive' ? 'factor-positive' : f.direction === 'negative' ? 'factor-negative' : 'factor-neutral';
        return `<li class="factor-item ${cls}">${escapeHtml(f.label)} (impact: ${f.impact})</li>`;
      }).join('')}</ul>`
    : '<p class="empty">No explanation factors recorded for this session.</p>';

  const outcomeReasonsHtml = session.outcomeReasons.length > 0
    ? `<ul>${session.outcomeReasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
    : '<p class="empty">No outcome reasons recorded.</p>';

  const wasteReasonsHtml = session.wasteReasons.length > 0
    ? `<ul>${session.wasteReasons.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
    : '<p class="empty">No waste reasons recorded.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — ${escapeHtml(session.title ?? session.providerSessionId)}</title>
<style>${PAGE_STYLES}</style>
</head>
<body>
  <nav class="nav">
    <span class="nav-brand">Token Tracker</span>
    <a href="/">Overview</a>
    <a href="/analytics">Analytics</a>
    <a href="/menubar">Menubar</a>
  </nav>
  <main>
  <a class="back-link-spaced" href="/">&larr; Back to overview</a>
  <h1>${escapeHtml(session.title ?? '<untitled>')}</h1>
  <p class="subtitle">${escapeHtml(session.provider)} / ${escapeHtml(session.model ?? 'unknown')} / ${escapeHtml(session.providerSessionId)}</p>

  <div class="detail-grid">
    <div class="detail-label">Started</div><div class="detail-value">${escapeHtml(session.startedAt)}</div>
    <div class="detail-label">Duration</div><div class="detail-value">${session.durationMs !== null ? `${(session.durationMs / 1000).toFixed(0)}s` : 'n/a'}</div>
    <div class="detail-label">Project</div><div class="detail-value">${session.projectPath ? escapeHtml(session.projectPath) : '<span class="empty">unknown</span>'}</div>
    <div class="detail-label">Tokens</div><div class="detail-tokens"><span class="detail-token-item"><span class="detail-token-label">input:</span> ${formatNumber(session.tokenInput)}</span><span class="detail-token-item"><span class="detail-token-label">output:</span> ${formatNumber(session.tokenOutput)}</span><span class="detail-token-item"><span class="detail-token-label">cached:</span> ${formatNumber(session.tokenCachedInput)}</span><span class="detail-token-item"><span class="detail-token-label">reasoning:</span> ${formatNumber(session.tokenReasoning)}</span><span class="detail-token-item"><span class="detail-token-label">total:</span> ${formatNumber(session.tokenTotal)}</span></div>
    <div class="detail-label">Cost</div><div class="detail-value">${costDisplay}</div>
    <div class="detail-label">Cache Hit Rate</div><div class="detail-value">${session.cacheHitRate !== null ? `${(session.cacheHitRate * 100).toFixed(1)}%` : 'n/a'}</div>
    <div class="detail-label">Efficiency</div><div class="detail-value">${session.efficiencyScore !== null ? session.efficiencyScore.toFixed(0) : 'n/a'}</div>
    <div class="detail-label">Waste</div><div class="detail-value">${session.wasteScore !== null ? session.wasteScore.toFixed(0) : 'n/a'}</div>
    <div class="detail-label">Outcome</div><div class="detail-value">${escapeHtml(session.outcome)} (confidence: ${session.outcomeConfidence !== null ? session.outcomeConfidence.toFixed(2) : 'n/a'})</div>
    <div class="detail-label">Task Category</div><div class="detail-value">${escapeHtml(session.taskCategory)} (confidence: ${session.taskCategoryConfidence !== null ? session.taskCategoryConfidence.toFixed(2) : 'n/a'})</div>
    <div class="detail-label">Loop Count</div><div class="detail-value">${session.loopCount}</div>
    <div class="detail-label">Anomaly Score</div><div class="detail-value">${session.anomalyScore !== null ? session.anomalyScore.toFixed(2) : 'n/a'}</div>
  </div>

  <div class="section">
    <h3>Outcome Reasons</h3>
    ${outcomeReasonsHtml}
  </div>

  <div class="section">
    <h3>Waste Reasons</h3>
    ${wasteReasonsHtml}
  </div>

  <div class="section">
    <h3>Score Factors</h3>
    ${factorsHtml}
  </div>
  </main>
</body>
</html>`;
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

function buildAnalyticsHtml(analytics: ReadAnalyticsSnapshot, activeDays: number): string {
  const totalCost = analytics.providerSummaries.reduce((sum, p) => sum + p.totalCostUsd, 0);
  const totalTokens = analytics.providerSummaries.reduce((sum, p) => sum + p.totalTokens, 0);

  const dailyBuckets = analytics.dailyBuckets.slice(0, 14).reverse();
  const maxDailyTokens = Math.max(...dailyBuckets.map((d) => d.totalTokens), 1);
  const maxDailyCost = Math.max(...dailyBuckets.map((d) => d.totalCostUsd), 0.01);

  const tokenChartBars = dailyBuckets.map((d) => {
    const width = Math.max(2, (d.totalTokens / maxDailyTokens) * 100);
    return `<div class="chart-row"><div class="bar" style="width:${Math.round(width)}%" role="img" aria-label="${d.date}: ${formatNumber(d.totalTokens)} tokens" title="${d.date}: ${formatNumber(d.totalTokens)} tokens"></div><div class="chart-label">${d.date} — ${formatNumber(d.totalTokens)} tokens</div></div>`;
  }).join('\n');

  const costChartBars = dailyBuckets.map((d) => {
    const width = Math.max(2, (d.totalCostUsd / maxDailyCost) * 100);
    return `<div class="chart-row"><div class="bar" style="width:${Math.round(width)}%;background:#16a34a" role="img" aria-label="${d.date}: $${d.totalCostUsd.toFixed(2)}" title="${d.date}: $${d.totalCostUsd.toFixed(2)}"></div><div class="chart-label">${d.date} — $${d.totalCostUsd.toFixed(2)}</div></div>`;
  }).join('\n');

  const dailyRows = dailyBuckets.map((d) => {
    return `<tr>
      <td>${escapeHtml(d.date)}</td>
      <td>${d.sessions}</td>
      <td>${formatNumber(d.totalTokens)}</td>
      <td>$${d.totalCostUsd.toFixed(2)}</td>
      <td>${d.averageEfficiency !== null ? d.averageEfficiency.toFixed(0) : 'n/a'}</td>
    </tr>`;
  }).join('\n');

  const maxProviderCost = Math.max(...analytics.providerSummaries.map((p) => p.totalCostUsd), 0.01);
  const providerDistBars = analytics.providerSummaries.map((p) => {
    const width = Math.max(2, (p.totalCostUsd / maxProviderCost) * 100);
    const pct = totalCost > 0 ? ((p.totalCostUsd / totalCost) * 100).toFixed(0) : '0';
    const unpricedNote = p.unpricedSessions > 0 ? ` <span class="unpriced-text">(${p.unpricedSessions} unpriced)</span>` : '';
    return `<div class="dist-section"><div class="chart-bar"><span>${escapeHtml(p.provider)}</span><span>$${p.totalCostUsd.toFixed(2)} (${pct}%)${unpricedNote}</span></div><div class="bar" style="width:${Math.round(width)}%"></div></div>`;
  }).join('\n');

  const maxModelTokens = Math.max(...analytics.modelSummaries.map((m) => m.totalTokens), 1);
  const modelDistBars = analytics.modelSummaries.slice(0, 10).map((m) => {
    const width = Math.max(2, (m.totalTokens / maxModelTokens) * 100);
    const pct = totalTokens > 0 ? ((m.totalTokens / totalTokens) * 100).toFixed(0) : '0';
    return `<div class="dist-section"><div class="chart-bar"><span>${escapeHtml(m.model)}</span><span>${formatNumber(m.totalTokens)} (${pct}%)</span></div><div class="bar" style="width:${Math.round(width)}%;background:#7c3aed"></div></div>`;
  }).join('\n');

  const modelRows = analytics.modelSummaries.map((m) => {
    const width = Math.max(2, (m.totalTokens / maxModelTokens) * 100);
    return `<tr>
      <td>${escapeHtml(m.model)}</td>
      <td>${escapeHtml(m.provider)}</td>
      <td>${m.sessions}</td>
      <td>${formatNumber(m.totalTokens)}</td>
      <td>$${m.totalCostUsd.toFixed(2)}</td>
      <td>${m.averageEfficiency !== null ? m.averageEfficiency.toFixed(0) : 'n/a'}</td>
    </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Analytics</title>
<style>${PAGE_STYLES}</style>
</head>
<body>
  <nav class="nav">
    <span class="nav-brand">Token Tracker</span>
    <a href="/">Overview</a>
    <a href="/analytics" class="active">Analytics</a>
    <a href="/menubar">Menubar</a>
  </nav>
  <main>
  <h1>Analytics</h1>
  <p class="subtitle">Database: <code>${escapeHtml(analytics.databasePath)}</code></p>

  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value">${analytics.sessionCount}</div>
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
    <table>
      <thead><tr><th>Model</th><th>Provider</th><th>Sessions</th><th>Tokens</th><th>Cost (USD)</th><th>Avg Efficiency</th></tr></thead>
      <tbody>${modelRows || '<tr><td colspan="6" class="empty">no model data</td></tr>'}</tbody>
    </table>
  </div>

  <div class="analytics-group">
    <div class="section">
      <h2>Daily Trends</h2>
      <h3 style="font-size:13px;color:#6b7280;margin:0 0 8px;font-weight:500">Tokens</h3>
      ${tokenChartBars || '<p class="empty">no daily token data</p>'}
      <h3 style="font-size:13px;color:#6b7280;margin:16px 0 8px;font-weight:500">Cost</h3>
      ${costChartBars || '<p class="empty">no daily cost data</p>'}
    </div>
  </div>

  <div class="analytics-group">
    <div class="section">
      <h2>Daily Activity (Last 14 Days)</h2>
    <table>
      <thead><tr><th>Date</th><th>Sessions</th><th>Tokens</th><th>Cost (USD)</th><th>Avg Efficiency</th></tr></thead>
      <tbody>${dailyRows || '<tr><td colspan="5" class="empty">no daily data</td></tr>'}</tbody>
    </table>
    </div>
  </div>

  <p class="footer-note">
    <a href="/export/analytics-svg?days=${activeDays}" class="copy-btn" style="background:#16a34a;text-decoration:none">📥 Download SVG</a>
    <button class="copy-btn" onclick="copyAnalyticsSummary()">📋 Copy text</button>
  </p>
  <script>
    function copyAnalyticsSummary() {
      var text = document.querySelector('.analytics-group')?.innerText || '';
      var stats = document.querySelector('.stats-row')?.innerText || '';
      var summary = 'Token Tracker Analytics\n' + stats.trim() + '\n\n' + text.trim();
      navigator.clipboard.writeText(summary).then(function() {
        var btn = document.querySelector('.copy-btn');
        if (btn) { btn.textContent = '✓ Copied'; setTimeout(function() { btn.textContent = '📋 Copy summary'; }, 2000); }
      }).catch(function() {});
    }
  </script>
  </main>
</body>
</html>`;
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
  <p class="error">${escapeHtml(message)}</p>
  <a class="action-link" href="/">Open Dashboard</a>
</body></html>`;
}

function buildCacheEfficiencySection(analytics: ReadAnalyticsSnapshot): string {
  const sessionsWithCache = analytics.modelSummaries.filter(m => m.averageEfficiency !== null);
  if (sessionsWithCache.length === 0) {
    return '<div class="analytics-group"><div class="section"><h2>Cache Efficiency</h2><p class="empty">Cache efficiency data is not available for this provider. OpenCode sessions include native cache metrics; Codex sessions do not expose cache hit rates.</p></div></div>';
  }

  const avgCacheRate = sessionsWithCache.reduce((sum, m) => sum + (m.averageEfficiency ?? 0), 0) / sessionsWithCache.length;
  const barWidth = Math.min(100, avgCacheRate * 100);
  const health = avgCacheRate > 0.7 ? 'healthy' : avgCacheRate > 0.4 ? 'warn' : 'critical';

  return `<div class="analytics-group">
    <div class="section">
      <h2>Cache Efficiency</h2>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span>Average cache hit rate</span>
        <span>${(avgCacheRate * 100).toFixed(1)}%</span>
      </div>
      <div class="meter"><div class="meter-fill meter-fill-${health}" style="width:${barWidth}%"></div></div>
      <p style="font-size:11px;color:#9ca3af;margin-top:8px">Based on ${sessionsWithCache.length} model(s) with cache data. Codex sessions do not expose cache hit rates.</p>
    </div>
  </div>`;
}

function menubarProviderHealth(summary: SessionSummary): 'healthy' | 'warn' | 'critical' {
  if (summary.resetWindowRemainingPercent !== null) {
    if (summary.resetWindowRemainingPercent < 0.20) return 'critical';
    if (summary.resetWindowRemainingPercent < 0.50) return 'warn';
  }
  if (summary.unpricedSessions > 0) return 'warn';
  return 'healthy';
}

function menubarOverallHealth(summaries: SessionSummary[]): 'healthy' | 'warn' | 'critical' {
  if (summaries.length === 0) return 'warn';
  const statuses = summaries.map(menubarProviderHealth);
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warn')) return 'warn';
  return 'healthy';
}

function buildHeatmapSection(buckets: DailyBucket[]): string {
  if (buckets.length === 0) {
    return '<div class="analytics-group"><div class="section"><h2>Activity Heatmap</h2><p class="empty">No activity data available.</p></div></div>';
  }

  const maxSessions = Math.max(...buckets.map((b) => b.sessions), 1);
  const cells = buckets.slice().reverse().map((b) => {
    const intensity = b.sessions / maxSessions;
    const opacity = Math.max(0.15, intensity);
    const title = b.date + ': ' + b.sessions + ' sessions, ' + formatNumber(b.totalTokens) + ' tokens';
    return '<div class="heatmap-cell" style="opacity:' + opacity + '" title="' + title + '"></div>';
  }).join('');

  return '<div class="analytics-group"><div class="section"><h2>Activity Heatmap</h2><div class="heatmap-grid">' + cells + '</div><div style="display:flex;justify-content:space-between;font-size:10px;color:#9ca3af;margin-top:4px"><span>Less</span><div style="display:flex;gap:2px"><div class="heatmap-cell" style="opacity:0.15"></div><div class="heatmap-cell" style="opacity:0.4"></div><div class="heatmap-cell" style="opacity:0.7"></div><div class="heatmap-cell" style="opacity:1"></div></div><span>More</span></div></div></div>';
}

function buildSessionMeter(sessionCount: number): string {
  // Session meter: 0-100 sessions = 0-100%, cap at 100
  // Weekly meter: assumes ~20 sessions/week as "full"
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
  return summaries.map((p) => {
    const health = menubarProviderHealth(p);
    const costStr = p.totalCostUsd > 0 ? '$' + p.totalCostUsd.toFixed(2) : '$0';
    return '<div class="provider-row"><span class="provider-dot provider-dot-' + health + '"></span><span class="provider-name">' + escapeHtml(p.provider) + '</span><span class="provider-cost">' + costStr + '</span></div>';
  }).join('\n');
}

function buildMenubarHtml(snapshot: ReadSummarySnapshot, recentSessions: StoredSessionListItem[], compactMode: 'detailed' | 'minimal' = 'detailed'): string {
  const totalCost = snapshot.providerSummaries.reduce((sum, p) => sum + p.totalCostUsd, 0);
  const overallHealth = menubarOverallHealth(snapshot.providerSummaries);

  const providerRows = snapshot.providerSummaries.map((p) => {
    const health = menubarProviderHealth(p);
    const costStr = p.totalCostUsd > 0 ? `$${p.totalCostUsd.toFixed(2)}` : '$0.00';
    const resetPct = p.resetWindowRemainingPercent;
    const unpricedWarn = p.unpricedSessions > 0 ? `<span class="unpriced-text">${p.unpricedSessions} unpriced</span>` : '';
    const resetBar = resetPct !== null
      ? `<div class="reset-bar-wrap"><div class="reset-bar reset-bar-${health}" style="width:${(resetPct * 100).toFixed(0)}%"></div></div>`
      : '';
    const resetKind = p.resetWindowKind ? `<span class="menubar-label">${escapeHtml(p.resetWindowKind)}</span>` : '';
    const countdownStr = p.resetWindowResetsAt ? buildCountdownStr(p.resetWindowResetsAt) : '';
    const resetLabel = resetPct !== null ? `<span class="menubar-label">${(resetPct * 100).toFixed(0)}%${countdownStr ? ` · ${countdownStr}` : ''}</span>` : '';

    const incidentBadge = p.unpricedSessions > 0 ? `<span class="incident-badge" title="${p.unpricedSessions} session(s) with unknown pricing">⚠</span>` : '';
    return `<div class="provider-row"><span class="provider-dot provider-dot-${health}"></span><span class="provider-name">${escapeHtml(p.provider)}</span>${incidentBadge}${resetKind}<span class="provider-sessions">${p.sessions}</span><span class="provider-cost">${costStr}</span>${resetLabel}${unpricedWarn}</div>${resetBar}`;
  }).join('\n');

  const recentItems = recentSessions.slice(0, 3).map((s) => {
    const costStr = s.pricingSnapshotId === null ? '?' : `$${s.costTotalUsd.toFixed(2)}`;
    const timeStr = menubarRelativeTime(s.startedAt);
    return `<div class="recent-item"><span class="recent-title">${escapeHtml(s.title ?? '<untitled>')}</span><span class="recent-cost">${costStr}</span><span class="recent-time">${timeStr}</span></div>`;
  }).join('\n');

  const recentSection = recentItems
    ? `<div class="section-label">Recent</div>${recentItems}`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title>
<style>${MENUBAR_STYLES}</style>
</head>
<body>
  <div class="header">
    <span class="health-dot health-dot-${overallHealth}" title="${overallHealth === 'healthy' ? 'All systems healthy' : overallHealth === 'warn' ? 'Attention needed' : 'Critical issue'}" role="status" aria-label="Health status: ${overallHealth === 'healthy' ? 'healthy' : overallHealth === 'warn' ? 'warning' : 'critical'}"></span>
    <span class="header-title">Token Tracker</span>
    <span class="mode-toggle" id="mode-toggle" title="Toggle compact mode">▤</span>
  </div>

  <div class="aggregate">
    <span>$${totalCost.toFixed(2)} total</span>
    <span class="aggregate-value">${snapshot.sessionCount} sessions</span>
  </div>
  ${compactMode === 'detailed' ? buildSessionMeter(snapshot.sessionCount) : ''}

  <div class="section-label">Providers</div>
  ${compactMode === 'detailed' ? providerRows : buildMinimalProviderRows(snapshot.providerSummaries)}

  ${compactMode === 'detailed' ? recentSection : ''}

  <a class="action-link" href="/">Open Dashboard</a>
  <script>
    (function() {
      var toggle = document.getElementById('mode-toggle');
      if (toggle) {
        toggle.addEventListener('click', function() {
          var current = new URLSearchParams(window.location.search).get('mode') || 'detailed';
          var next = current === 'detailed' ? 'minimal' : 'detailed';
          window.location.search = 'mode=' + next;
        });
      }
    })();
  </script>
</body>
</html>`;
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
  const rawUrl = request.url ?? '/';
  const { path, sessionId, provider, model, q, page, mode } = parseUrlPath(rawUrl);

  if (path === '/api/summary') {
    try {
      const snapshot = readService.getSummarySnapshot();
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(snapshot));
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: String(error) }));
    }
    return;
  }

  if (path === '/api/analytics') {
    try {
      const analytics = readService.getAnalyticsSnapshot();
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(analytics));
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: String(error) }));
    }
    return;
  }

  if (path === '/api/refresh') {
    const state = getRefreshState();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(state));
    return;
  }

  if (path === '/api/preferences') {
    const currentPrefs = loadPreferences();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(currentPrefs));
    return;
  }

  if (path === '/api/preferences' && request.method === 'POST') {
    let body = '';
    request.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    request.on('end', () => {
      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const current = loadPreferences();
        const updated: MonitoringPreferences = {
          refreshCadenceSeconds: typeof parsed.refreshCadenceSeconds === 'number'
            ? Math.max(1, Math.min(60, Math.trunc(parsed.refreshCadenceSeconds)))
            : current.refreshCadenceSeconds,
          defaultAnalyticsWindowDays: typeof parsed.defaultAnalyticsWindowDays === 'number'
            ? [7, 14, 30, 90].includes(parsed.defaultAnalyticsWindowDays)
              ? parsed.defaultAnalyticsWindowDays
              : current.defaultAnalyticsWindowDays
            : current.defaultAnalyticsWindowDays,
        };
        savePreferences(updated);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(updated));
      } catch {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'invalid preferences' }));
      }
    });
    return;
  }

  if (path === '/menubar') {
    let snapshot: ReadSummarySnapshot | null = null;
    let sessions: StoredSessionListItem[] = [];
    let error: string | null = null;
    let compactMode: 'detailed' | 'minimal' = 'detailed';

    // Parse mode query param
    if (mode) {
      if (mode === 'minimal' || mode === 'detailed') {
        compactMode = mode as 'detailed' | 'minimal';
      }
    }

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
    response.end(buildMenubarHtml(snapshot, sessions, compactMode));
    return;
  }

  if (path === '/analytics') {
    let analytics: ReadAnalyticsSnapshot | null = null;
    let error: string | null = null;
    const defaultPrefs = loadPreferences();
    let activeDays = defaultPrefs.defaultAnalyticsWindowDays;

    // Parse days query param from URL
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

  if (path === '/export/analytics-svg') {
    let analytics: ReadAnalyticsSnapshot | null = null;
    let error: string | null = null;
    let exportDays = 30;

    // Parse days query param from URL (same logic as /analytics)
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
    let error: string | null = null;
    let listResult: { sessions: StoredSessionListItem[]; total: number; page: number; pageSize: number; totalPages: number } | null = null;

    try {
      snapshot = readService.getSummarySnapshot();
      if (snapshot.sessionCount > 0) {
        listResult = readService.listSessionsWithCount({ provider: provider ?? undefined, model: model ?? undefined, search: q ?? undefined, page });
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

    if (!listResult) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildEmptyHtml());
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    const modelOptions = readService.getModelOptions();
    response.end(buildOverviewHtml(snapshot, listResult.sessions, provider, model, q, listResult, modelOptions));
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
  // Use watchFile with polling for reliable macOS support
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

  // Also watch WAL file if it exists
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

void main();
