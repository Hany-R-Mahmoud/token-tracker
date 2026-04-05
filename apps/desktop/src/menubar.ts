import type { ReadSummarySnapshot, SessionSummary, StoredSessionListItem } from '@ttm/core';
import type { ContextPressureState } from '@ttm/core';
import { MENUBAR_STYLES } from './styles.js';
import { escapeHtml, formatNumber, buildCountdownStr, menubarRelativeTime, menubarProviderHealth, menubarOverallHealth } from './helpers.js';

const WEB_APP_URL = process.env.TTM_WEB_URL ?? 'http://localhost:3200';

export function buildMenubarHtml(snapshot: ReadSummarySnapshot, recentSessions: StoredSessionListItem[], compactMode: 'detailed' | 'minimal' = 'detailed', myRank: { rank: number; totalMembers: number } | null = null, contextPressure: { low: number; medium: number; high: number; critical: number; unknown: number } | null = null): string {
  const totalCost = snapshot.providerSummaries.reduce((sum: number, p: SessionSummary) => sum + p.totalCostUsd, 0);
  const totalSessions = snapshot.providerSummaries.reduce((sum: number, p: SessionSummary) => sum + p.sessions, 0);
  const totalTokens = snapshot.providerSummaries.reduce((sum: number, p: SessionSummary) => sum + p.totalTokens, 0);
  const overallHealth = menubarOverallHealth(snapshot.providerSummaries);

  // Effectiveness summary
  const providersWithEff = snapshot.providerSummaries.filter((p: SessionSummary) => p.averageEfficiency !== null);
  const avgEfficiency = providersWithEff.length > 0
    ? providersWithEff.reduce((sum: number, p: SessionSummary) => sum + (p.averageEfficiency ?? 0), 0) / providersWithEff.length
    : null;
  const sessionsWithOutcome = recentSessions.filter((s: StoredSessionListItem) => s.outcome !== 'unknown');
  const successCount = sessionsWithOutcome.filter((s: StoredSessionListItem) => s.outcome === 'success').length;
  const successRate = sessionsWithOutcome.length > 0 ? successCount / sessionsWithOutcome.length : null;

  let effLabel = 'mixed';
  let effClass = 'mb-effectiveness-mixed';
  if (avgEfficiency !== null) {
    if (avgEfficiency >= 0.7) { effLabel = 'Efficient spend'; effClass = 'mb-effectiveness-efficient'; }
    else if (avgEfficiency >= 0.4) { effLabel = 'Mixed results'; effClass = 'mb-effectiveness-mixed'; }
    else { effLabel = 'Waste-heavy'; effClass = 'mb-effectiveness-waste-heavy'; }
  }

  // Phase 009 success analysis summary
  const providersWithSuccess = snapshot.providerSummaries.filter((p: SessionSummary) => p.averageSuccessScore !== null);
  const avgSuccessScore = providersWithSuccess.length > 0
    ? providersWithSuccess.reduce((sum: number, p: SessionSummary) => sum + (p.averageSuccessScore ?? 0), 0) / providersWithSuccess.length
    : null;
  const avgConfidence = providersWithSuccess.length > 0
    ? providersWithSuccess.reduce((sum: number, p: SessionSummary) => sum + (p.averageAnalysisConfidence ?? 0), 0) / providersWithSuccess.length
    : null;

  let successLabel = '';
  let successBg = '';
  let successText = '';
  if (avgSuccessScore !== null) {
    if (avgSuccessScore >= 70) { successLabel = 'Likely productive'; successBg = 'var(--mb-success-bg)'; successText = 'var(--mb-success-text)'; }
    else if (avgSuccessScore >= 40) { successLabel = 'Mixed results'; successBg = 'var(--mb-warning-bg)'; successText = 'var(--mb-warning-text)'; }
    else { successLabel = 'Likely wasteful'; successBg = 'var(--mb-critical-bg)'; successText = 'var(--mb-critical-text)'; }
  }

  // Outcome distribution
  let mixedCount = 0, wasteCount = 0, unknownCount = 0;
  for (const s of recentSessions) {
    if (s.outcome === 'success') continue;
    if (s.outcome === 'waste' || s.outcome === 'failed') wasteCount++;
    else if (s.outcome === 'mixed' || s.outcome === 'partial') mixedCount++;
    else unknownCount++;
  }
  const totalOutcomes = successCount + mixedCount + wasteCount + unknownCount;
  const outcomeBars = totalOutcomes > 0 ? `
    <div class="mb-outcome-row"><span class="mb-outcome-label">Success</span><div class="mb-outcome-bar"><div class="mb-outcome-fill mb-outcome-fill-success" style="width:${(successCount / totalOutcomes * 100).toFixed(0)}%"></div></div><span class="mb-outcome-count">${successCount}</span></div>
    <div class="mb-outcome-row"><span class="mb-outcome-label">Mixed</span><div class="mb-outcome-bar"><div class="mb-outcome-fill mb-outcome-fill-mixed" style="width:${(mixedCount / totalOutcomes * 100).toFixed(0)}%"></div></div><span class="mb-outcome-count">${mixedCount}</span></div>
    <div class="mb-outcome-row"><span class="mb-outcome-label">Waste</span><div class="mb-outcome-bar"><div class="mb-outcome-fill mb-outcome-fill-waste" style="width:${(wasteCount / totalOutcomes * 100).toFixed(0)}%"></div></div><span class="mb-outcome-count">${wasteCount}</span></div>
  ` : '<div class="empty" style="padding:8px 0">No outcome data yet</div>';

  // Provider bars for consumption
  const maxProviderCost = Math.max(...snapshot.providerSummaries.map((p: SessionSummary) => p.totalCostUsd), 0.01);
  const providerBars = snapshot.providerSummaries.map((p: SessionSummary) => {
    const width = Math.max(4, (p.totalCostUsd / maxProviderCost) * 100);
    return `<div class="mb-provider-bar"><span class="mb-provider-bar-name">${escapeHtml(p.provider)}</span><div class="mb-provider-bar-track"><div class="mb-provider-bar-fill" style="width:${width}%;background:#2563eb"></div></div><span class="mb-provider-bar-cost">$${p.totalCostUsd.toFixed(2)}</span></div>`;
  }).join('\n');

  // Provider status rows with reset
  const providerRows = snapshot.providerSummaries.map((p: SessionSummary) => {
    const health = menubarProviderHealth(p);
    const costStr = p.totalCostUsd > 0 ? `$${p.totalCostUsd.toFixed(2)}` : '$0';
    const resetPct = p.resetWindowRemainingPercent;
    const countdownStr = p.resetWindowResetsAt ? buildCountdownStr(p.resetWindowResetsAt) : '';
    const resetLabel = resetPct !== null ? `${(resetPct * 100).toFixed(0)}%${countdownStr ? ` · ${countdownStr}` : ''}` : '';
    const resetBar = resetPct !== null ? `<div class="mb-reset-bar"><div class="mb-reset-bar-fill mb-reset-bar-${health}" style="width:${(resetPct * 100).toFixed(0)}%"></div></div>` : '';
    return `<div class="mb-provider-row"><span class="mb-provider-dot mb-provider-dot-${health}"></span><span class="mb-provider-name">${escapeHtml(p.provider)}</span><span class="mb-provider-cost">${costStr}</span>${resetLabel ? `<span class="mb-provider-reset" title="Quota-backed reset (Codex only)">${resetLabel}</span>` : ''}</div>${resetBar}`;
  }).join('\n');

  // Recent activity
  const recentItems = recentSessions.slice(0, 5).map((s: StoredSessionListItem) => {
    const costStr = s.pricingSnapshotId === null ? '?' : `$${s.costTotalUsd.toFixed(2)}`;
    const timeStr = menubarRelativeTime(s.startedAt);
    return `<div class="mb-recent-item"><span class="mb-recent-title">${escapeHtml(s.title ?? '<untitled>')}</span><span class="mb-recent-cost">${costStr}</span><span class="mb-recent-time">${timeStr}</span></div>`;
  }).join('\n');

  // Team preview — show rank if available, otherwise show signed-out/unavailable state
  const teamSection = myRank
    ? `<div class="mb-team-row"><span class="mb-team-rank">#${myRank.rank}</span><span class="mb-team-label">of ${myRank.totalMembers} members</span></div>`
    : `<div class="mb-team-row"><span class="mb-team-label" style="color:#9ca3af">Leaderboard not connected</span></div>`;

  // Success cue HTML for hero
  const successCueHtml = successLabel
    ? `<span class="mb-effectiveness" style="background:${successBg};color:${successText}">${successLabel}${avgConfidence !== null ? ` · ${(avgConfidence * 100).toFixed(0)}% conf` : ''}</span>`
    : '';

  // Context pressure cue (compact)
  let contextCueHtml = '';
  if (contextPressure) {
    const total = contextPressure.low + contextPressure.medium + contextPressure.high + contextPressure.critical + contextPressure.unknown;
    if (total > 0 && compactMode === 'minimal') {
      const nearLimit = contextPressure.high + contextPressure.critical;
      if (nearLimit > 0) {
        contextCueHtml = `<span class="mb-effectiveness" style="background:var(--mb-warning-bg);color:var(--mb-warning-text)">${nearLimit} near limit</span>`;
      }
    }
  }

  // No data state
  if (totalSessions === 0) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${MENUBAR_STYLES}</style></head>
<body>
  <div class="mb-header">
    <span class="mb-health-dot mb-health-dot-warn"></span>
    <span class="mb-title">Token Tracker</span>
  </div>
  <div class="mb-empty">
    <div class="mb-empty-icon">📊</div>
    <div>No data imported yet</div>
    <div style="margin-top:4px;font-size:11px">Run <code>ttm import</code> to get started</div>
  </div>
  <div class="mb-actions">
    <a class="mb-action-btn mb-action-btn-primary" href="/">Dashboard</a>
    <a class="mb-action-btn" href="/analytics">Analytics</a>
  </div>
</body></html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${MENUBAR_STYLES}</style></head>
<body>
  <!-- 1. Header -->
  <div class="mb-header">
    <span class="mb-health-dot mb-health-dot-${overallHealth}" title="${overallHealth === 'healthy' ? 'All systems healthy' : overallHealth === 'warn' ? 'Attention needed' : 'Critical issue'}" role="status" aria-label="Health: ${overallHealth}"></span>
    <span class="mb-title">Token Tracker</span>
    ${compactMode === 'detailed' ? '<span class="mb-mode-toggle" id="mode-toggle" title="Toggle compact mode">▤</span>' : ''}
  </div>

  <!-- 2. Hero: spend + effectiveness + success cue -->
  <div class="mb-hero">
    <div class="mb-hero-cost">$${totalCost.toFixed(2)}</div>
    <div class="mb-hero-meta">
      <span>${totalSessions} sessions</span>
      <span>${formatNumber(totalTokens)} tokens</span>
    </div>
    <span class="mb-effectiveness ${effClass}">${effLabel}${successRate !== null ? ` · ${(successRate * 100).toFixed(0)}% success` : ''}</span>
    ${successCueHtml}
    ${contextCueHtml}
  </div>

  ${compactMode === 'detailed' ? `
  <!-- 3. Consumption visuals -->
  <div class="mb-section">
    <div class="mb-section-label">Spend by Provider</div>
    ${providerBars}
  </div>

  <!-- 4. Effectiveness block -->
  <div class="mb-section">
    <div class="mb-section-label">Outcomes</div>
    ${outcomeBars}
    <div class="mb-efficiency-summary">
      ${avgEfficiency !== null ? `<span>⚡ Efficiency: ${(avgEfficiency * 100).toFixed(0)}%</span>` : ''}
      ${totalSessions > 0 ? `<span>📈 ${totalSessions} sessions</span>` : ''}
    </div>
  </div>

  <!-- 5. Provider status with reset -->
  <div class="mb-section">
    <div class="mb-section-label">Providers</div>
    ${providerRows}
  </div>

  <!-- 6. Recent activity -->
  <div class="mb-section">
    <div class="mb-section-label">Recent</div>
    ${recentItems || '<div class="empty" style="padding:4px 0">No recent sessions</div>'}
  </div>

  <!-- 7. Team preview -->
  <div class="mb-section">
    <div class="mb-section-label">Leaderboard</div>
    ${teamSection}
  </div>
  ` : ''}

  <!-- Quick actions -->
  <div class="mb-actions">
    <a class="mb-action-btn mb-action-btn-primary" href="/">Dashboard</a>
    <a class="mb-action-btn" href="/analytics">Analytics</a>
    <a class="mb-action-btn" href="${WEB_APP_URL}/leaderboard" target="_blank" rel="noopener external-link">Leaderboard ↗</a>
    <a class="mb-action-btn" href="${WEB_APP_URL}/settings" target="_blank" rel="noopener external-link">Settings ↗</a>
  </div>

  ${compactMode === 'detailed' ? `<script>
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
  </script>` : ''}
</body></html>`;
}
