import type { SessionSummary } from '@ttm/core';
import { auditSessionContext, getContextPressureColor, getContextPressureLabel, type ContextAuditResult, type ContextPressureState } from '@ttm/core';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;');
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

export function buildCountdownStr(resetsAt: string): string {
  const now = Date.now();
  const resetTime = new Date(resetsAt).getTime();
  const diffMs = resetTime - now;
  if (diffMs < 0) return 'passed';
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function menubarRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return 'now';
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  return `${Math.floor(diffHr / 24)}d`;
}

export function menubarProviderHealth(summary: SessionSummary): 'healthy' | 'warn' | 'critical' {
  if (summary.resetWindowRemainingPercent !== null) {
    if (summary.resetWindowRemainingPercent < 0.20) return 'critical';
    if (summary.resetWindowRemainingPercent < 0.50) return 'warn';
  }
  if (summary.unpricedSessions > 0) return 'warn';
  return 'healthy';
}

export function menubarOverallHealth(summaries: SessionSummary[]): 'healthy' | 'warn' | 'critical' {
  if (summaries.length === 0) return 'warn';
  const statuses = summaries.map(menubarProviderHealth);
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warn')) return 'warn';
  return 'healthy';
}

export function buildContextAuditHtml(audit: ContextAuditResult): string {
  const pressureColor = getContextPressureColor(audit.contextPressureState);
  const pressureLabel = getContextPressureLabel(audit.contextPressureState);
  const breakdownBars = audit.contextBreakdown.map(b => {
    const width = b.percent !== null ? Math.max(2, b.percent) : 0;
    let barColor = 'var(--accent)';
    if (b.kind === 'user') barColor = '#3b82f6';
    else if (b.kind === 'assistant') barColor = '#8b5cf6';
    else if (b.kind === 'tool') barColor = '#f59e0b';
    else if (b.kind === 'cache') barColor = '#10b981';
    else if (b.kind === 'reasoning') barColor = '#ec4899';
    else barColor = '#6b7280';
    return `<div class="context-bar-row"><span class="context-bar-label">${b.label}</span><div class="context-bar-track"><div class="context-bar-fill" style="width:${width}%;background:${barColor}"></div></div><span class="context-bar-value">${b.percent !== null ? b.percent.toFixed(1) + '%' : 'n/a'}</span></div>`;
  }).join('');
  
  const warningsHtml = audit.contextWarnings.length > 0 
    ? `<div class="context-warnings">${audit.contextWarnings.map(w => `<div class="context-warning-item">⚠️ ${escapeHtml(w)}</div>`).join('')}</div>`
    : '';
  
  const limitHtml = audit.hasContextLimit && audit.contextUsagePercent !== null
    ? `<div class="context-limit-row"><span class="context-limit-label">Context Usage</span><span class="context-limit-value" style="color:${pressureColor}">${audit.contextUsagePercent.toFixed(1)}% (${pressureLabel})</span></div>`
    : '<div class="context-limit-row"><span class="context-limit-label">Context Limit</span><span class="context-limit-value">Unknown for this model</span></div>';
  
  return `
    <div class="context-audit-section">
      <h3>Context Audit</h3>
      <div class="context-facts-grid">
        ${limitHtml}
        <div class="context-limit-row"><span class="context-limit-label">Input</span><span class="context-limit-value">${formatNumber(audit.inputTokens)}</span></div>
        <div class="context-limit-row"><span class="context-limit-label">Output</span><span class="context-limit-value">${formatNumber(audit.outputTokens)}</span></div>
        <div class="context-limit-row"><span class="context-limit-label">Reasoning</span><span class="context-limit-value">${formatNumber(audit.reasoningTokens)}</span></div>
        <div class="context-limit-row"><span class="context-limit-label">Tool Calls</span><span class="context-limit-value">${audit.toolCallCount}</span></div>
      </div>
      <div class="context-breakdown-section">
        <h4 style="font-size:13px;color:var(--text-secondary);margin:16px 0 8px">Context Composition</h4>
        ${breakdownBars}
      </div>
      ${warningsHtml}
    </div>
  `;
}

export function getSessionContextHealth(session: { tokenInput: number; tokenOutput: number; tokenCachedInput: number; tokenReasoning: number; toolCallCount?: number; cacheHitRate: number | null; model: string | null; successScore: number | null; valueDensityScore?: number | null }): ContextAuditResult {
  return auditSessionContext(
    session.tokenInput,
    session.tokenOutput,
    session.tokenReasoning,
    session.tokenCachedInput,
    0,
    session.model,
    session.toolCallCount ?? 0,
    null,
    session.cacheHitRate,
    session.successScore,
    session.valueDensityScore ?? null
  );
}
