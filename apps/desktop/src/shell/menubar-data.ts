import type { SessionSummary, StoredSessionListItem } from '@ttm/core';

export interface MenubarHeroData {
  totalCost: number;
  totalSessions: number;
  totalTokens: number;
  effectivenessLabel: string;
  effectivenessColor: string;
  avgEfficiency: number | null;
  avgWaste: number | null;
  successRate: number | null;
}

export interface MenubarOutcomeData {
  successCount: number;
  mixedCount: number;
  wasteCount: number;
  unknownCount: number;
  totalSessions: number;
}

export interface MenubarProviderData {
  provider: string;
  cost: number;
  sessions: number;
  health: 'healthy' | 'warn' | 'critical';
  resetPct: number | null;
  resetKind: string | null;
  countdown: string | null;
  unpricedSessions: number;
}

export interface MenubarRecentData {
  title: string;
  cost: string;
  time: string;
  outcome: string;
  efficiency: number | null;
}

export interface MenubarTeamPreview {
  available: boolean;
  myRank: number | null;
  totalMembers: number | null;
  topCost: string;
}

export interface MenubarData {
  hasData: boolean;
  hero: MenubarHeroData;
  outcome: MenubarOutcomeData;
  providers: MenubarProviderData[];
  recent: MenubarRecentData[];
  team: MenubarTeamPreview;
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

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatNumberShort(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function computeMenubarHero(providerSummaries: SessionSummary[], recentSessions: StoredSessionListItem[]): MenubarHeroData {
  const totalCost = providerSummaries.reduce((sum, p) => sum + p.totalCostUsd, 0);
  const totalSessions = providerSummaries.reduce((sum, p) => sum + p.sessions, 0);
  const totalTokens = providerSummaries.reduce((sum, p) => sum + p.totalTokens, 0);

  // Compute average efficiency and waste from provider summaries
  const providersWithEfficiency = providerSummaries.filter(p => p.averageEfficiency !== null);
  const avgEfficiency = providersWithEfficiency.length > 0
    ? providersWithEfficiency.reduce((sum, p) => sum + (p.averageEfficiency ?? 0), 0) / providersWithEfficiency.length
    : null;

  const providersWithWaste = providerSummaries.filter(p => p.averageEfficiency !== null);
  const avgWaste = providersWithWaste.length > 0
    ? providersWithWaste.reduce((sum, p) => sum + (1 - (p.averageEfficiency ?? 0)), 0) / providersWithWaste.length
    : null;

  // Compute success rate from recent sessions
  const sessionsWithOutcome = recentSessions.filter(s => s.outcome !== 'unknown');
  const successCount = sessionsWithOutcome.filter(s => s.outcome === 'success').length;
  const successRate = sessionsWithOutcome.length > 0 ? successCount / sessionsWithOutcome.length : null;

  // Determine effectiveness label
  let effectivenessLabel = 'mixed';
  let effectivenessColor = '#f59e0b';

  if (avgEfficiency !== null) {
    if (avgEfficiency >= 0.7) {
      effectivenessLabel = 'efficient';
      effectivenessColor = '#22c55e';
    } else if (avgEfficiency >= 0.4) {
      effectivenessLabel = 'mixed';
      effectivenessColor = '#f59e0b';
    } else {
      effectivenessLabel = 'waste-heavy';
      effectivenessColor = '#ef4444';
    }
  }

  return {
    totalCost,
    totalSessions,
    totalTokens,
    effectivenessLabel,
    effectivenessColor,
    avgEfficiency,
    avgWaste,
    successRate,
  };
}

export function computeMenubarOutcome(recentSessions: StoredSessionListItem[]): MenubarOutcomeData {
  let successCount = 0;
  let mixedCount = 0;
  let wasteCount = 0;
  let unknownCount = 0;

  for (const s of recentSessions) {
    if (s.outcome === 'success') successCount++;
    else if (s.outcome === 'waste' || s.outcome === 'failed') wasteCount++;
    else if (s.outcome === 'mixed' || s.outcome === 'partial') mixedCount++;
    else unknownCount++;
  }

  return {
    successCount,
    mixedCount,
    wasteCount,
    unknownCount,
    totalSessions: successCount + mixedCount + wasteCount + unknownCount,
  };
}

export function computeMenubarProviders(providerSummaries: SessionSummary[]): MenubarProviderData[] {
  return providerSummaries.map((p) => {
    let health: 'healthy' | 'warn' | 'critical' = 'healthy';
    if (p.resetWindowRemainingPercent !== null) {
      if (p.resetWindowRemainingPercent < 0.20) health = 'critical';
      else if (p.resetWindowRemainingPercent < 0.50) health = 'warn';
    } else if (p.unpricedSessions > 0) {
      health = 'warn';
    }

    let countdown: string | null = null;
    if (p.resetWindowResetsAt) {
      const now = Date.now();
      const resetTime = new Date(p.resetWindowResetsAt).getTime();
      const diffMs = resetTime - now;
      if (diffMs < 0) countdown = 'passed';
      else {
        const totalSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        if (hours > 24) countdown = `${Math.floor(hours / 24)}d ${hours % 24}h`;
        else if (hours > 0) countdown = `${hours}h ${minutes}m`;
        else countdown = `${minutes}m`;
      }
    }

    return {
      provider: p.provider,
      cost: p.totalCostUsd,
      sessions: p.sessions,
      health,
      resetPct: p.resetWindowRemainingPercent,
      resetKind: p.resetWindowKind,
      countdown,
      unpricedSessions: p.unpricedSessions,
    };
  });
}

export function computeMenubarRecent(recentSessions: StoredSessionListItem[]): MenubarRecentData[] {
  return recentSessions.slice(0, 5).map((s) => ({
    title: s.title ?? '<untitled>',
    cost: s.pricingSnapshotId === null ? '?' : formatCurrency(s.costTotalUsd),
    time: menubarRelativeTime(s.startedAt),
    outcome: s.outcome,
    efficiency: s.efficiencyScore,
  }));
}

export function computeMenubarTeamPreview(myRank: { rank: number; totalMembers: number } | null, providerSummaries: SessionSummary[]): MenubarTeamPreview {
  if (!myRank) {
    return { available: false, myRank: null, totalMembers: null, topCost: '-' };
  }

  const totalCost = providerSummaries.reduce((sum, p) => sum + p.totalCostUsd, 0);
  return {
    available: true,
    myRank: myRank.rank,
    totalMembers: myRank.totalMembers,
    topCost: formatCurrency(totalCost),
  };
}

export function buildMenubarData(
  providerSummaries: SessionSummary[],
  recentSessions: StoredSessionListItem[],
  myRank: { rank: number; totalMembers: number } | null,
): MenubarData {
  const hasData = providerSummaries.length > 0 && providerSummaries.some(p => p.sessions > 0);

  return {
    hasData,
    hero: computeMenubarHero(providerSummaries, recentSessions),
    outcome: computeMenubarOutcome(recentSessions),
    providers: computeMenubarProviders(providerSummaries),
    recent: computeMenubarRecent(recentSessions),
    team: computeMenubarTeamPreview(myRank, providerSummaries),
  };
}
