import type { ReadAnalyticsSnapshot } from '@ttm/core';

/**
 * Generates an SVG summary card for analytics export.
 *
 * This is a server-side SVG generation approach — no browser dependencies,
 * no headless browser, no fragile rendering stack.
 *
 * The exported SVG contains only aggregated analytics data:
 * - Total sessions, tokens, cost
 * - Provider breakdown
 * - Daily activity summary
 *
 * No raw session data, prompts, transcripts, code, or file paths are included.
 */
export function buildAnalyticsSummarySvg(analytics: ReadAnalyticsSnapshot): string {
  const width = 800;
  const height = 500;
  const padding = 40;
  const titleHeight = 60;
  const statsHeight = 80;
  const providerSectionHeight = 140;
  const dailySectionHeight = 140;

  const totalTokens = analytics.providerSummaries.reduce((sum, p) => sum + p.totalTokens, 0);
  const totalCost = analytics.providerSummaries.reduce((sum, p) => sum + p.totalCostUsd, 0);

  // Format numbers for display
  const formatNum = (n: number): string => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  // Provider bars
  const maxProviderCost = Math.max(...analytics.providerSummaries.map((p) => p.totalCostUsd), 0.01);
  const barWidth = (width - padding * 2) / Math.max(analytics.providerSummaries.length, 1);
  const maxBarHeight = providerSectionHeight - 60;

  const providerBars = analytics.providerSummaries.map((p, i) => {
    const barH = Math.max(4, (p.totalCostUsd / maxProviderCost) * maxBarHeight);
    const x = padding + i * barWidth + barWidth * 0.15;
    const w = barWidth * 0.7;
    const y = padding + titleHeight + statsHeight + providerSectionHeight - barH - 20;
    return `<rect x="${x}" y="${y}" width="${w}" height="${barH}" fill="#2563eb" rx="4"/>
      <text x="${x + w / 2}" y="${y - 8}" text-anchor="middle" font-size="12" fill="#374151">$${p.totalCostUsd.toFixed(2)}</text>
      <text x="${x + w / 2}" y="${y + barH + 16}" text-anchor="middle" font-size="11" fill="#6b7280">${p.provider}</text>`;
  }).join('\n');

  // Daily activity mini bars
  const dailyBuckets = analytics.dailyBuckets.slice(-14);
  const maxDailyTokens = Math.max(...dailyBuckets.map((d) => d.totalTokens), 1);
  const dailyBarWidth = (width - padding * 2) / Math.max(dailyBuckets.length, 1);
  const dailyMaxBarHeight = dailySectionHeight - 50;

  const dailyBars = dailyBuckets.map((d, i) => {
    const barH = Math.max(2, (d.totalTokens / maxDailyTokens) * dailyMaxBarHeight);
    const x = padding + i * dailyBarWidth + dailyBarWidth * 0.1;
    const w = dailyBarWidth * 0.8;
    const y = padding + titleHeight + statsHeight + providerSectionHeight + dailySectionHeight - barH - 20;
    return `<rect x="${x}" y="${y}" width="${w}" height="${barH}" fill="#16a34a" rx="2"/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#ffffff" rx="8"/>

  <!-- Title -->
  <text x="${padding}" y="${padding + 20}" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#111827">Token Tracker — Analytics Summary</text>
  <text x="${padding}" y="${padding + 40}" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280">Last ${analytics.dailyBuckets.length} days · Generated ${new Date().toLocaleDateString()}</text>

  <!-- Stats row -->
  <g transform="translate(${padding}, ${padding + titleHeight})">
    <rect width="${width - padding * 2}" height="${statsHeight}" fill="#f9fafb" rx="8"/>
    <text x="${padding + 20}" y="30" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280" text-transform="uppercase">Sessions</text>
    <text x="${padding + 20}" y="55" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#111827">${analytics.sessionCount}</text>

    <text x="${width / 3}" y="30" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280" text-transform="uppercase">Tokens</text>
    <text x="${width / 3}" y="55" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#111827">${formatNum(totalTokens)}</text>

    <text x="${(width / 3) * 2}" y="30" font-family="system-ui, sans-serif" font-size="11" fill="#6b7280" text-transform="uppercase">Total Cost</text>
    <text x="${(width / 3) * 2}" y="55" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#111827">$${totalCost.toFixed(2)}</text>
  </g>

  <!-- Provider cost breakdown -->
  <text x="${padding}" y="${padding + titleHeight + statsHeight + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#374151">Cost by Provider</text>
  <g>
    ${providerBars}
  </g>

  <!-- Daily activity -->
  <text x="${padding}" y="${padding + titleHeight + statsHeight + providerSectionHeight + 20}" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#374151">Daily Tokens (Last ${dailyBuckets.length} Days)</text>
  <g>
    ${dailyBars}
  </g>

  <!-- Footer -->
  <text x="${width / 2}" y="${height - 15}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#9ca3af">Token Tracker · Local-first · No raw session data exported</text>
</svg>`;
}
