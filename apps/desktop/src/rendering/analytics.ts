import type { ReadAnalyticsSnapshot } from "@ttm/core";
import { PAGE_STYLES } from "../styles/index.js";
import { escapeHtml, formatNumber } from "./helpers.js";
import { buildDesktopNav, buildThemeScript } from "./layout.js";

function buildAnalyticsHero(
  analytics: ReadAnalyticsSnapshot,
  totalTokens: number,
  totalCost: number,
  activePeriod: string,
): string {
  const providers = analytics.providerSummaries;
  const totalSessions = analytics.sessionCount;
  const liveIndex =
    totalSessions > 0 ? Math.round((totalTokens / totalSessions) * 10) / 10 : 0;
  return `<section class="analytics-hero-grid">
    <div class="analytics-hero-main">
      <div class="analytics-hero-value">${formatNumber(totalTokens)}<span>/100</span></div>
      <div class="analytics-hero-delta">Value density index</div>
    </div>
    <div class="analytics-hero-side">
      <div class="analytics-side-card analytics-side-card-primary">
        <div class="analytics-side-value">$${totalCost.toFixed(2)}</div>
        <div class="analytics-side-label">Total cost</div>
      </div>
    </div>
  </section>`;
}

function buildAnalyticsTrendPanels(analytics: ReadAnalyticsSnapshot): string {
  const tokenValues = analytics.dailyBuckets.map(
    (bucket) => bucket.totalTokens,
  );
  const costValues = analytics.dailyBuckets.map(
    (bucket) => bucket.totalCostUsd * 100,
  );
  return `<section class="analytics-grid analytics-grid-featured">
    <h3>Token Cost Trend</h3>
    <div class="chart-container">
      ${tokenValues.length > 0 ? '<svg class="trend-chart" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="' + tokenValues.map((v, i) => `${(i / (tokenValues.length - 1 || 1)) * 100},${30 - (v / Math.max(...tokenValues, 1)) * 28}`).join(" ") + '" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>' : '<p class="empty">No data</p>'}
    </div>
  </section>`;
}

function buildAnalyticsValueMatrix(analytics: ReadAnalyticsSnapshot): string {
  const providers = analytics.providerSummaries;
  return `<section class="analytics-grid analytics-grid-split">
    <h3>Provider Distribution</h3>
    <div class="provider-matrix">
      ${providers
        .map(
          (p) => `<div class="provider-cell">
        <div class="provider-name">${escapeHtml(p.provider)}</div>
        <div class="provider-tokens">${formatNumber(p.totalTokens)}</div>
        <div class="provider-cost">$${p.totalCostUsd.toFixed(2)}</div>
      </div>`,
        )
        .join("\n")}
    </div>
  </section>`;
}

function buildAnalyticsComposition(analytics: ReadAnalyticsSnapshot): string {
  const sessions = analytics.recentSessions ?? [];
  return `<section class="analytics-grid analytics-grid-split">
    <h3>Model Composition</h3>
    <table class="data-table">
      <thead><tr><th>Model</th><th>Provider</th><th>Sessions</th><th>Tokens</th><th>Cost</th></tr></thead>
      <tbody>
        ${analytics.modelSummaries
          .slice(0, 10)
          .map(
            (m) => `<tr>
          <td>${escapeHtml(m.model)}</td>
          <td>${escapeHtml(m.provider ?? "unknown")}</td>
          <td>${m.sessions}</td>
          <td>${formatNumber(m.totalTokens)}</td>
          <td>$${m.totalCostUsd.toFixed(2)}</td>
        </tr>`,
          )
          .join("\n")}
      </tbody>
    </table>
  </section>`;
}

function buildOperationalTimeChips(
  activePeriod: string,
  basePath: "/" | "/analytics" = "/",
): string {
  const periods = [
    { id: "1h", label: "1h" },
    { id: "1d", label: "1d" },
    { id: "7d", label: "7d" },
    { id: "1m", label: "30d" },
    { id: "all", label: "All" },
  ];
  return `<div class="time-chips" data-base-path="${basePath}" role="tablist" aria-label="Time period">
    ${periods.map((p) => `<button type="button" class="time-chip${activePeriod === p.id ? " active" : ""}" data-period="${p.id}" ${p.id === "1m" ? "data-is-default" : ""} role="tab" aria-selected="${activePeriod === p.id}" aria-controls="main-content">${p.label}</button>`).join("\n")}
  </div>`;
}

export function buildAnalyticsHtml(
  analytics: ReadAnalyticsSnapshot,
  activePeriod: string,
  activeSurfacePanel: unknown,
): string {
  const totalTokens = analytics.providerSummaries.reduce(
    (sum, p) => sum + p.totalTokens,
    0,
  );
  const totalCost = analytics.providerSummaries.reduce(
    (sum, p) => sum + p.totalCostUsd,
    0,
  );
  const hasData = analytics.sessionCount > 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Analytics</title><style>${PAGE_STYLES}</style></head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${buildDesktopNav("analytics")}
  <main id="main-content">
    <h1>Analytics</h1>
    ${buildOperationalTimeChips(activePeriod, "/analytics")}
    ${hasData ? buildAnalyticsHero(analytics, totalTokens, totalCost, activePeriod) : '<p class="empty">No data</p>'}
    ${hasData ? buildAnalyticsTrendPanels(analytics) : ""}
    ${hasData ? buildAnalyticsValueMatrix(analytics) : ""}
    ${hasData ? buildAnalyticsComposition(analytics) : ""}
  </main>
  ${buildThemeScript()}
</body></html>`;
}
