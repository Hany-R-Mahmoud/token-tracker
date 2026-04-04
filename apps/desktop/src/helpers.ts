import type { SessionSummary } from '@ttm/core';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
