import type { ReadSummarySnapshot, StoredSessionListItem } from '@ttm/core';
import { PAGE_STYLES } from '../styles.js';
import { escapeHtml, formatNumber } from '../helpers.js';
import { buildDesktopNav, buildThemeScript } from './layout.js';

function buildMiniBars(values: number[], color: string = 'var(--accent)'): string {
  const max = Math.max(...values, 1);
  return values.map((v) => {
    const height = Math.max(4, (v / max) * 24);
    return `<span class="mini-bar" style="height:${height}px;background:${color}" aria-hidden="true"></span>`;
  }).join('');
}

function buildTrendMesh(values: number[], color: string): string {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return `<svg class="trend-mesh" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

function buildOverviewHero(snapshot: ReadSummarySnapshot): string {
  const totalTokens = snapshot.providerSummaries.reduce((sum, p) => sum + p.totalTokens, 0);
  const totalCost = snapshot.providerSummaries.reduce((sum, p) => sum + p.totalCostUsd, 0);
  const totalSessions = snapshot.sessionCount;
  return `<section class="overview-hero-grid">
    <div class="overview-hero-main">
      <div class="overview-hero-value">${formatNumber(totalTokens)}<span>tokens</span></div>
      <div class="overview-hero-delta">across ${totalSessions} sessions</div>
    </div>
    <div class="overview-hero-side">
      <div class="overview-side-card overview-side-card-primary">
        <div class="overview-side-value">$${totalCost.toFixed(2)}</div>
        <div class="overview-side-label">Total cost</div>
      </div>
    </div>
  </section>`;
}

function buildOverviewKpiDeck(snapshot: ReadSummarySnapshot): string {
  const providers = snapshot.providerSummaries;
  return `<section class="overview-grid overview-grid-split">
    <h3>Provider Summary</h3>
    <div class="kpi-deck">
      ${providers.map((p) => `<div class="kpi-card">
        <div class="kpi-provider">${escapeHtml(p.provider)}</div>
        <div class="kpi-tokens">${formatNumber(p.totalTokens)}</div>
        <div class="kpi-cost">$${p.totalCostUsd.toFixed(2)}</div>
      </div>`).join('\n')}
    </div>
  </section>`;
}

function buildOverviewTrendActivity(): string {
  const tokenValues: number[] = [];
  return `<section class="overview-grid overview-grid-featured">
    <h3>Token Activity</h3>
    ${tokenValues.length > 0 ? buildTrendMesh(tokenValues, 'var(--accent)') : '<p class="empty">No activity yet</p>'}
  </section>`;
}

function buildOverviewProviderIntegrity(snapshot: ReadSummarySnapshot): string {
  const providers = snapshot.providerSummaries;
  return `<section class="overview-grid overview-grid-split">
    <h3>Provider Usage</h3>
    <table class="data-table">
      <thead><tr><th>Provider</th><th>Sessions</th><th>Tokens</th><th>Cost</th></tr></thead>
      <tbody>
        ${providers.map((p) => `<tr>
          <td>${escapeHtml(p.provider)}</td>
          <td>${p.sessions}</td>
          <td>${formatNumber(p.totalTokens)}</td>
          <td>$${p.totalCostUsd.toFixed(2)}</td>
        </tr>`).join('\n')}
      </tbody>
    </table>
  </section>`;
}

function buildOverviewLiveFeed(sessions: StoredSessionListItem[]): string {
  if (sessions.length === 0) return '';
  return `<section class="overview-grid overview-grid-split">
    <h3>Recent Sessions</h3>
    <ul class="session-list">
      ${sessions.slice(0, 5).map((s) => `<li>
        <a href="/session/${s.id}">${escapeHtml(s.title || s.providerSessionId || s.id.slice(0, 8))}</a>
        <span class="session-meta">${escapeHtml(s.provider)} · ${formatNumber(s.tokenTotal)} tokens</span>
      </li>`).join('\n')}
    </ul>
  </section>`;
}

function buildOverviewSuccessCard(snapshot: ReadSummarySnapshot): string {
  const providersWithSuccess = snapshot.providerSummaries.filter((p) => p.averageSuccessScore !== null);
  if (providersWithSuccess.length === 0) return '';
  return `<section class="overview-card">
    <h3>Success Rates</h3>
    <div class="success-bars">
      ${providersWithSuccess.slice(0, 5).map((p) => `<div class="success-bar">
        <div class="success-provider">${escapeHtml(p.provider)}</div>
        <div class="success-score" style="width:${p.averageSuccessScore ?? 0}%">${p.averageSuccessScore?.toFixed(0) ?? 'n/a'}%</div>
      </div>`).join('\n')}
    </div>
  </section>`;
}

function buildOperationalTimeChips(activePeriod: string, basePath: '/' | '/analytics' = '/'): string {
  const periods = [
    { id: '1h', label: '1h' },
    { id: '1d', label: '1d' },
    { id: '7d', label: '7d' },
    { id: '1m', label: '30d' },
    { id: 'all', label: 'All' },
  ];
  return `<div class="time-chips" data-base-path="${basePath}" role="tablist" aria-label="Time period">
    ${periods.map((p) => `<button type="button" class="time-chip${activePeriod === p.id ? ' active' : ''}" data-period="${p.id}" ${p.id === '1m' ? 'data-is-default' : ''} role="tab" aria-selected="${activePeriod === p.id}" aria-controls="main-content">${p.label}</button>`).join('\n')}
  </div>`;
}

export function buildOverviewHtml(
  snapshot: ReadSummarySnapshot,
  sessions: StoredSessionListItem[],
  activePeriod: string = '1m',
): string {
  const hasData = snapshot.sessionCount > 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Overview</title><style>${PAGE_STYLES}</style></head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${buildDesktopNav('overview', { showRefreshIndicator: true })}
  <main id="main-content">
    <h1>Overview</h1>
    ${buildOperationalTimeChips(activePeriod)}
    ${hasData ? buildOverviewHero(snapshot) : '<p class="empty">No data yet</p>'}
    ${hasData ? buildOverviewKpiDeck(snapshot) : ''}
    ${hasData ? buildOverviewProviderIntegrity(snapshot) : ''}
    ${hasData && sessions.length > 0 ? buildOverviewLiveFeed(sessions) : ''}
    ${hasData ? buildOverviewSuccessCard(snapshot) : ''}
  </main>
  ${buildThemeScript()}
</body></html>`;
}