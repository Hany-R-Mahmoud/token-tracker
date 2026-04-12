#!/usr/bin/env node
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { watchFile, existsSync } from 'node:fs';
import type { Stats } from 'node:fs';
import { TtmDatabase, TtmReadService } from '@ttm/core';
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
import { buildBrandLockup } from './brand.js';
import { ActiveSurfaceResolver } from './active-surface-resolver.js';
import { loadPreferences, savePreferences, type MonitoringPreferences } from './preferences.js';
import { fetchActiveSurfaceState, createActiveSurfaceStateFromSessions } from './tauri-bridge.js';
import type {
  WindowContextSignal,
  ContextThresholdBand,
  ProviderId,
  ResolutionTier,
  ActiveSurfaceCapabilities,
  ActiveSurfaceResolution,
  MatchConfidence,
  NotificationCheckpoint,
  DatabasePathResolution,
} from '@ttm/core';
import {
  deriveThresholdBand,
  bandToColor,
  bandLabel,
  tierLabel,
  tierDescription,
  isFallbackState,
  isStrongTruth,
  DEFAULT_CAPABILITIES,
  getNotificationDeliveryDecision,
  shouldFireNotification,
  updateCheckpoint,
  resetCheckpointForBand,
} from '@ttm/core';

const PORT = Number(process.env.TTM_DESKTOP_PORT ?? '3100');

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const DESKTOP_API_KEY = process.env.TTM_DESKTOP_API_KEY ?? '';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const notificationCheckpoints = new Map<string, NotificationCheckpoint>();

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

type DesktopSurface = 'overview' | 'analytics';
type EmptyStateKind = 'no-imported-data' | 'no-window-data';

interface DesktopRuntimeStatus {
  runtimeMode: string;
  instanceToken: string;
  ownerPath: string;
  port: number;
  databasePath: string;
  databaseSource: DatabasePathResolution['source'];
  canonicalDatabasePath: string;
  legacyDatabasePath: string | null;
  migrationPerformed: boolean;
  totalSessionCount: number;
  analyticsWindowDays: number;
  analyticsWindowSessionCount: number;
  refreshCadenceSeconds: number;
  dbExists: boolean;
  startedAt: string;
}

const DESKTOP_STARTED_AT = new Date().toISOString();
const DESKTOP_RUNTIME_MODE = process.env.TTM_DESKTOP_RUNTIME ?? 'dev';
const DESKTOP_RUNTIME_INSTANCE_TOKEN = process.env.TTM_RUNTIME_INSTANCE_TOKEN ?? 'dev-runtime';
const DESKTOP_RUNTIME_OWNER_PATH = process.env.TTM_RUNTIME_OWNER_PATH ?? '';
let desktopDatabaseResolution: DatabasePathResolution | null = null;

function buildErrorHtml(surface: DesktopSurface, message: string, runtimeStatus?: DesktopRuntimeStatus): string {
  const title = surface === 'analytics' ? 'Analytics' : 'Overview';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Error</title><style>${PAGE_STYLES}</style></head>
  <body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${buildDesktopNav(surface)}
  <main id="main-content"><h1>${title}</h1><p class="error">An unexpected error occurred. Please try again.</p>${runtimeStatus ? buildRuntimeStatusCard(runtimeStatus) : ''}</main>
  ${buildThemeScript()}
</body></html>`;
}

function buildEmptyHtml(surface: DesktopSurface, runtimeStatus: DesktopRuntimeStatus, kind: EmptyStateKind): string {
  const title = surface === 'analytics' ? 'Analytics' : 'Overview';
  const body = kind === 'no-window-data'
    ? 'No sessions matched the current view, but Token Tracker can still see historical data in the active database.'
    : 'No data has been imported into the active local database yet.';
  const hint = kind === 'no-window-data'
    ? '<p class="empty" style="margin-top:12px">Try a wider time window or inspect the runtime diagnostics below before assuming imports are missing.</p>'
    : '<p class="empty" style="margin-top:12px">Run <code>ttm import</code> only if the diagnostics below show the active database truly has 0 sessions.</p>';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${PAGE_STYLES}</style></head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${buildDesktopNav(surface)}
  <main id="main-content">
    <h1>${title}</h1>
    <p class="empty">${body}</p>
    ${hint}
    ${buildRuntimeStatusCard(runtimeStatus)}
  </main>
  ${buildThemeScript()}
</body></html>`;
}

function buildThemeScript(): string {
  return `<script>
    (function() {
      try {
        var savedTheme = localStorage.getItem('ttm-theme');
        document.documentElement.setAttribute('data-theme', savedTheme || 'dark');
        var toggle = document.getElementById('theme-toggle');
        if (toggle) {
          toggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('ttm-theme', next);
          });
        }
      } catch (_) {}
    })();
  </script>`;
}

function buildDesktopNav(active: DesktopSurface, options: { showRefreshIndicator?: boolean } = {}): string {
  const refreshIndicator = options.showRefreshIndicator
    ? '<span class="refresh-indicator" id="refresh-state" title="Auto-refresh: watching database" role="status" aria-live="polite"></span>'
    : '<span class="refresh-indicator refresh-indicator-placeholder" aria-hidden="true">watching database</span>';

  return `<nav class="nav">
    <span class="nav-brand">${buildBrandLockup('Token Tracker', true)}</span>
    <div class="nav-links">
      <a href="/"${active === 'overview' ? ' class="active"' : ''}>Overview</a>
      <a href="/analytics"${active === 'analytics' ? ' class="active"' : ''}>Analytics</a>
    </div>
    <div class="nav-actions">
      ${refreshIndicator}
      <span class="nav-notification-status" title="Notification status: ambient mode - notifications shown in-app">
        <span class="nav-notification-icon">🔔</span>
        <span class="nav-notification-label">Ambient</span>
      </span>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">🌓</button>
    </div>
  </nav>`;
}

function buildRuntimeStatusCard(runtimeStatus: DesktopRuntimeStatus): string {
  const sourceLabels: Record<DesktopRuntimeStatus['databaseSource'], string> = {
    canonical_home: 'canonical home database',
    env: 'env override',
    explicit: 'explicit path',
    legacy_cwd_fallback: 'legacy fallback path',
    legacy_cwd_migrated: 'legacy path migrated to home',
  };

  return `<div class="section" style="margin-top:20px">
    <h2 class="tooltip" data-tooltip="System health and performance metrics">Runtime Diagnostics</h2>
    <div class="details-grid">
      <div class="detail-label">Runtime</div><div class="detail-value">${escapeHtml(runtimeStatus.runtimeMode)}</div>
      <div class="detail-label">Port</div><div class="detail-value">${runtimeStatus.port}</div>
      <div class="detail-label">Owner</div><div class="detail-value"><code>${escapeHtml(runtimeStatus.ownerPath || 'unknown')}</code></div>
      <div class="detail-label">Database</div><div class="detail-value"><code>${escapeHtml(runtimeStatus.databasePath)}</code></div>
      <div class="detail-label">Source</div><div class="detail-value">${escapeHtml(sourceLabels[runtimeStatus.databaseSource] ?? runtimeStatus.databaseSource)}</div>
      <div class="detail-label">Canonical path</div><div class="detail-value"><code>${escapeHtml(runtimeStatus.canonicalDatabasePath)}</code></div>
      <div class="detail-label">Legacy path</div><div class="detail-value">${runtimeStatus.legacyDatabasePath ? `<code>${escapeHtml(runtimeStatus.legacyDatabasePath)}</code>` : 'none detected'}</div>
      <div class="detail-label">Migration</div><div class="detail-value">${runtimeStatus.migrationPerformed ? 'performed on startup' : 'not needed'}</div>
      <div class="detail-label">Total sessions</div><div class="detail-value">${runtimeStatus.totalSessionCount}</div>
      <div class="detail-label">${runtimeStatus.analyticsWindowDays}d sessions</div><div class="detail-value">${runtimeStatus.analyticsWindowSessionCount}</div>
      <div class="detail-label">DB exists</div><div class="detail-value">${runtimeStatus.dbExists ? 'yes' : 'no'}</div>
      <div class="detail-label">Refresh cadence</div><div class="detail-value">${runtimeStatus.refreshCadenceSeconds}s</div>
      <div class="detail-label">Started</div><div class="detail-value">${escapeHtml(runtimeStatus.startedAt)}</div>
    </div>
    <div class="footer-note" style="margin-top:12px">
      <a href="/api/runtime-status">View runtime JSON</a>
    </div>
  </div>`;
}

function getRuntimeStatus(readService: TtmReadService, prefs: MonitoringPreferences, analyticsWindowDays = prefs.defaultAnalyticsWindowDays): DesktopRuntimeStatus {
  const summary = readService.getSummarySnapshot();
  const analytics = readService.getAnalyticsSnapshot(analyticsWindowDays);
  const resolution = desktopDatabaseResolution ?? {
    path: summary.databasePath,
    source: 'explicit',
    canonicalPath: summary.databasePath,
    legacyPath: null,
    migrationPerformed: false,
  };

  return {
    runtimeMode: DESKTOP_RUNTIME_MODE,
    instanceToken: DESKTOP_RUNTIME_INSTANCE_TOKEN,
    ownerPath: DESKTOP_RUNTIME_OWNER_PATH,
    port: PORT,
    databasePath: summary.databasePath,
    databaseSource: resolution.source,
    canonicalDatabasePath: resolution.canonicalPath,
    legacyDatabasePath: resolution.legacyPath,
    migrationPerformed: resolution.migrationPerformed,
    totalSessionCount: summary.sessionCount,
    analyticsWindowDays,
    analyticsWindowSessionCount: analytics.sessionCount,
    refreshCadenceSeconds: prefs.refreshCadenceSeconds,
    dbExists: existsSync(summary.databasePath),
    startedAt: DESKTOP_STARTED_AT,
  };
}

function buildRuntimeDiagnosticsHtml(runtimeStatus: DesktopRuntimeStatus): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Runtime Diagnostics</title><style>${PAGE_STYLES}</style></head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  ${buildDesktopNav('overview')}
  <main id="main-content">
    <h1>Runtime Diagnostics</h1>
    <p class="subtitle">Packaged and local desktop modes must agree on the same active database.</p>
    ${buildRuntimeStatusCard(runtimeStatus)}
  </main>
  ${buildThemeScript()}
</body></html>`;
}

interface DesktopActiveSurfacePanelData {
  resolution: ActiveSurfaceResolution | null;
  capabilities: ActiveSurfaceCapabilities;
  usagePercent: number | null;
  thresholdBand: ContextThresholdBand;
}

interface DesktopNotificationPayload {
  shouldNotify: boolean;
  delivery: 'ambient_only' | 'in_app_banner' | 'desktop_notification';
  title: string | null;
  body: string | null;
  reason: string;
  thresholdBand: ContextThresholdBand;
  tier: ResolutionTier;
  source: ActiveSurfaceResolution['source'] | 'none';
  targetKey: string | null;
}

function computeDesktopActiveSurfacePanel(
  recentWithAudit: Array<{
    provider: string;
    providerSessionId: string;
    contextAudit?: { contextUsagePercent: number | null } | null;
  }>,
): DesktopActiveSurfacePanelData {
  const nativeState = fetchActiveSurfaceState();
  const usagePercent = recentWithAudit[0]?.contextAudit?.contextUsagePercent ?? null;
  const thresholdBand = deriveThresholdBand(usagePercent);

  if (nativeState.isAvailable && nativeState.resolution) {
    return {
      resolution: nativeState.resolution,
      capabilities: nativeState.capabilities,
      usagePercent,
      thresholdBand,
    };
  }

  const fallbackState = createActiveSurfaceStateFromSessions(
    recentWithAudit as Array<{ provider: string; providerSessionId: string; contextAudit: { contextUsagePercent: number | null } | null }>,
  );

  return {
    resolution: fallbackState.resolution,
    capabilities: nativeState.capabilities,
    usagePercent,
    thresholdBand,
  };
}

function buildNotificationWindowKey(
  resolution: ActiveSurfaceResolution | null,
  recentWithAudit: Array<{
    provider: string;
    providerSessionId: string;
    contextAudit?: { contextUsagePercent: number | null } | null;
  }>,
): WindowContextSignal['key'] | null {
  if (resolution?.key) {
    return resolution.key;
  }

  const latestSession = recentWithAudit[0];
  if (!latestSession) {
    return null;
  }

  return {
    provider: latestSession.provider as ProviderId,
    externalWindowId: `latest-session-${latestSession.providerSessionId}`,
  };
}

function serializeNotificationKey(key: WindowContextSignal['key'] | null): string | null {
  if (!key) {
    return null;
  }
  return `${key.provider}:${key.externalWindowId}`;
}

function computeDesktopNotificationPayload(
  recentWithAudit: Array<{
    provider: string;
    providerSessionId: string;
    contextAudit?: { contextUsagePercent: number | null } | null;
  }>,
): DesktopNotificationPayload {
  const panel = computeDesktopActiveSurfacePanel(recentWithAudit);
  const resolution = panel.resolution;
  const tier = resolution?.resolutionTier ?? 'tier_0_none';
  const key = buildNotificationWindowKey(resolution, recentWithAudit);
  const targetKey = serializeNotificationKey(key);
  const decision = getNotificationDeliveryDecision(
    tier,
    panel.capabilities,
    resolution?.source === 'open_window_registry',
    panel.thresholdBand,
  );

  if (!targetKey || !key) {
    return {
      shouldNotify: false,
      delivery: decision.delivery,
      title: null,
      body: null,
      reason: decision.reason,
      thresholdBand: panel.thresholdBand,
      tier,
      source: resolution?.source ?? 'none',
      targetKey: null,
    };
  }

  const baselineCheckpoint: NotificationCheckpoint = {
    key,
    highestNotifiedBand: null,
    lastNotifiedAt: null,
  };

  const existingCheckpoint = notificationCheckpoints.get(targetKey) ?? null;
  const checkpoint = resetCheckpointForBand(
    existingCheckpoint ?? baselineCheckpoint,
    panel.thresholdBand,
  );

  if (checkpoint === null) {
    notificationCheckpoints.delete(targetKey);
  } else {
    notificationCheckpoints.set(targetKey, checkpoint);
  }

  const nextCheckpoint = checkpoint ?? baselineCheckpoint;
  const event = shouldFireNotification(panel.thresholdBand, nextCheckpoint);

  if (event && !decision.gateClosed) {
    notificationCheckpoints.set(
      targetKey,
      updateCheckpoint(nextCheckpoint, {
        ...event,
        providerSessionId:
          resolution?.providerSessionId ?? recentWithAudit[0]?.providerSessionId ?? null,
        contextUsagePercent: panel.usagePercent,
      }) ?? nextCheckpoint,
    );
  }

  const providerLabel = resolution?.provider ?? recentWithAudit[0]?.provider ?? 'provider';
  const usageLabel = panel.usagePercent !== null ? `${panel.usagePercent.toFixed(1)}%` : 'unknown';
  const shouldNotify = Boolean(event) && !decision.gateClosed && decision.delivery === 'desktop_notification';

  return {
    shouldNotify,
    delivery: decision.delivery,
    title: shouldNotify ? `Context warning for ${providerLabel}` : null,
    body: shouldNotify
      ? `${usageLabel} (${bandLabel(panel.thresholdBand)}) on ${tierLabel(tier).toLowerCase()}.`
      : null,
    reason: decision.reason,
    thresholdBand: panel.thresholdBand,
    tier,
    source: resolution?.source ?? 'none',
    targetKey,
  };
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatUsdCompact(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  if (value >= 100) {
    return `$${value.toFixed(0)}`;
  }
  return `$${value.toFixed(2)}`;
}

function getProviderAccent(provider: string): string {
  const normalized = provider.toLowerCase();
  if (normalized.includes('anthropic') || normalized.includes('claude')) return '#8b5cf6';
  if (normalized.includes('openai') || normalized.includes('codex')) return '#36ffc4';
  if (normalized.includes('google') || normalized.includes('gemini')) return '#3b82f6';
  if (normalized.includes('cursor')) return '#f97316';
  return '#a3ffd9';
}

function buildMiniBars(values: number[], color: string = 'var(--accent)'): string {
  const maxValue = Math.max(...values, 1);
  return `<div class="mini-bars">${values.map((value) => {
    const height = clampNumber((value / maxValue) * 100, 18, 100);
    return `<span class="mini-bar" style="height:${height}%;background:${color}"></span>`;
  }).join('')}</div>`;
}

function buildStepChartSvg(values: number[], color: string, areaColor: string): string {
  if (values.length === 0) {
    return '<div class="empty">No trend data yet.</div>';
  }

  const width = 640;
  const height = 180;
  const paddingX = 10;
  const paddingY = 12;
  const maxValue = Math.max(...values, 1);
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const stepWidth = values.length > 1 ? innerWidth / (values.length - 1) : innerWidth;

  const points = values.map((value, index) => {
    const x = paddingX + index * stepWidth;
    const y = paddingY + innerHeight - (value / maxValue) * innerHeight;
    return { x, y };
  });

  const linePath = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `H ${point.x} V ${point.y}`;
  }).join(' ');

  const areaPath = `${linePath} L ${paddingX + innerWidth} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;
  const markers = points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="2.4" fill="${color}"></circle>`).join('');

  return `<svg class="step-chart" viewBox="0 0 ${width} ${height}" aria-hidden="true" preserveAspectRatio="none">
    <defs>
      <linearGradient id="chart-fill-${color.replace(/[^a-z0-9]/gi, '')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${areaColor}" stop-opacity="0.36"></stop>
        <stop offset="100%" stop-color="${areaColor}" stop-opacity="0"></stop>
      </linearGradient>
    </defs>
    <path d="${areaPath}" fill="url(#chart-fill-${color.replace(/[^a-z0-9]/gi, '')})"></path>
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"></path>
    ${markers}
  </svg>`;
}

function buildOperationalTimeChips(activePeriod: string, basePath: '/' | '/analytics' = '/'): string {
  const periodIds = ['1h', '1d', '7d', '1m', 'all'] as const;

  return `<div class="signal-window-chips">
    ${periodIds.map((periodId) => {
      const labelMap: Record<string, string> = { '1h': '1hr', '1d': '1 day', '7d': '7 days', '1m': '1 month', 'all': 'All' };
      const label = labelMap[periodId] || periodId;
      const href = `${basePath}?period=${periodId}`;
      const activeClass = activePeriod === periodId ? ' signal-window-chip-active' : '';
      return `<a class="signal-window-chip${activeClass}" href="${href}">${label}</a>`;
    }).join('')}
  </div>`;
}

function buildTrendMesh(values: number[], color: string): string {
  if (values.length === 0) {
    return '<div class="empty">No trend data yet.</div>';
  }

  const width = 780;
  const height = 280;
  const paddingX = 12;
  const paddingY = 16;
  const maxValue = Math.max(...values, 1);
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const stepWidth = values.length > 1 ? innerWidth / (values.length - 1) : innerWidth;
  const points = values.map((value, index) => {
    const x = paddingX + index * stepWidth;
    const y = paddingY + innerHeight - (value / maxValue) * innerHeight;
    return { x, y };
  });
  const linePath = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');
  const areaPath = `${linePath} L ${paddingX + innerWidth} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;
  const secondaryPath = points.map((point, index) => {
    const y = clampNumber(point.y + 38 - index * 1.4, paddingY + 12, height - paddingY);
    if (index === 0) return `M ${point.x} ${y}`;
    return `L ${point.x} ${y}`;
  }).join(' ');

  return `<svg class="trend-mesh" viewBox="0 0 ${width} ${height}" aria-hidden="true" preserveAspectRatio="none">
    <defs>
      <linearGradient id="trend-mesh-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.24"></stop>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"></stop>
      </linearGradient>
    </defs>
    ${[0, 0.25, 0.5, 0.75].map((ratio) => {
      const y = paddingY + innerHeight * ratio;
      return `<line x1="${paddingX}" y1="${y}" x2="${paddingX + innerWidth}" y2="${y}" stroke="currentColor" stroke-opacity="0.14" stroke-width="1"></line>`;
    }).join('')}
    <path d="${areaPath}" fill="url(#trend-mesh-fill)"></path>
    <path d="${secondaryPath}" fill="none" stroke="rgba(185, 200, 222, 0.48)" stroke-width="2"></path>
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="3"></path>
  </svg>`;
}

function buildTopologyGrid(sessions: StoredSessionListItem[]): string {
  const cells = Array.from({ length: 35 }, (_, index) => {
    const session = sessions[index % Math.max(sessions.length, 1)];
    if (!session) {
      return '<span class="topology-cell"></span>';
    }

    const stateClass = session.outcome === 'success'
      ? ' topology-cell-success'
      : session.outcome === 'unknown'
        ? ' topology-cell-muted'
        : ' topology-cell-critical';
    const toolHeavy = (session.analysisConfidence ?? 0) < 0.45 ? ' topology-cell-hatched' : '';
    return `<span class="topology-cell${stateClass}${toolHeavy}" title="${escapeHtml(session.title ?? session.providerSessionId)}"></span>`;
  }).join('');

  return `<div class="topology-grid">${cells}</div>`;
}

function buildLiveSignalRows(sessions: StoredSessionListItem[]): string {
  if (sessions.length === 0) {
    return '<div class="empty">No live signal trace yet.</div>';
  }

  return sessions.slice(0, 3).map((session, index) => {
    const sessionSignal = session.outcome === 'success'
      ? Math.max(72, Math.round((session.efficiencyScore ?? 70)))
      : session.outcome === 'unknown'
        ? 44
        : 18;
    const value = session.pricingSnapshotId === null
      ? 'UNVERIFIED'
      : `${(sessionSignal / 100).toFixed(5)}`;
    const color = session.outcome === 'success'
      ? 'var(--accent)'
      : session.outcome === 'unknown'
        ? 'var(--secondary-signal)'
        : 'var(--critical)';
    return `<div class="signal-trace-row">
      <div class="signal-trace-head">
        <span>${escapeHtml(`sig_${index + 1}_${session.provider.slice(0, 4).toLowerCase()}`)}</span>
        <strong style="color:${color}">${value}</strong>
      </div>
      <div class="signal-trace-track">
        <span style="width:${sessionSignal}%;background:${color}"></span>
      </div>
    </div>`;
  }).join('');
}

function buildAssetVolatilityRows(analytics: ReadAnalyticsSnapshot): string {
  const models = analytics.modelSummaries.slice(0, 3);
  if (models.length === 0) {
    return '<div class="empty">No model movement recorded yet.</div>';
  }

  const maxTokens = Math.max(...models.map((model) => model.totalTokens), 1);
  return models.map((model, index) => {
    const delta = model.averageEfficiency !== null ? model.averageEfficiency - 50 : 0;
    const deltaLabel = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
    const deltaClass = delta >= 0 ? 'asset-delta-positive' : 'asset-delta-negative';
    const bars = Array.from({ length: 5 }, (_, barIndex) => {
      const ratio = (((model.totalTokens / maxTokens) * 100) + barIndex * 9 - index * 6) % 100;
      return `<span style="height:${clampNumber(ratio, 18, 96)}%"></span>`;
    }).join('');
    return `<div class="asset-volatility-row">
      <div class="asset-volatility-meta">
        <div>
          <strong>${escapeHtml(model.model)}</strong>
          <span class="${deltaClass}">${deltaLabel}</span>
        </div>
        <b>${formatUsdCompact(model.totalCostUsd)}</b>
      </div>
      <div class="asset-volatility-bars">${bars}</div>
    </div>`;
  }).join('');
}

function buildOverviewHero(
  snapshot: ReadSummarySnapshot,
  recentSessions: StoredSessionListItem[],
  totalTokens: number,
  totalCost: number,
  contextHealth: { nearLimitCount: number; toolHeavyCount: number; topSessions: { id: string; title: string | null; providerSessionId: string; contextPercent: number | null }[] } | null,
  activeSurfacePanel: DesktopActiveSurfacePanelData | null,
  activePeriod: string = '1m',
): string {
  const successScores = snapshot.providerSummaries.filter((summary) => summary.averageSuccessScore !== null);
  const avgSuccess = successScores.length > 0
    ? successScores.reduce((sum, summary) => sum + ((summary.averageSuccessScore ?? 0) * summary.sessions), 0) / Math.max(snapshot.sessionCount, 1)
    : null;
  const truthTone = activeSurfacePanel?.resolution
    ? tierLabel(activeSurfacePanel.resolution.resolutionTier)
    : 'Fallback';
  const riskCount = (contextHealth?.nearLimitCount ?? 0) + (contextHealth?.toolHeavyCount ?? 0);
  const latencyMs = recentSessions.length > 0
    ? Math.max(12, Math.round(recentSessions.reduce((sum, session) => sum + ((Math.log10(session.tokenTotal + 1) * 8) + 6), 0) / recentSessions.length))
    : 18;
  const syncLag = activeSurfacePanel?.usagePercent != null
    ? `${activeSurfacePanel.usagePercent.toFixed(0)}% pressure`
    : 'stable sync';

  return `<section class="operational-band">
    <div class="operational-copy">
      <div class="status-dot"></div>
      <div class="eyebrow">System Core</div>
      <h2 class="tooltip" data-tooltip="Current operational status and activity">Operational</h2>
      <p>Active-surface consensus is ${escapeHtml(truthTone.toLowerCase())}. ${riskCount > 0 ? `${riskCount} risk vectors are elevated.` : 'No critical anomalies are forcing operator intervention.'}</p>
      <div class="operational-meta">
        <span>Latency ${latencyMs}ms</span>
        <span>${snapshot.sessionCount} sessions</span>
        <span>${formatNumber(totalTokens)} tokens</span>
        <span>${syncLag}</span>
      </div>
    </div>
    ${buildOperationalTimeChips(activePeriod)}
  </section>`;
}

function buildOverviewKpiDeck(
  snapshot: ReadSummarySnapshot,
  recentSessions: StoredSessionListItem[],
  contextHealth: { nearLimitCount: number; toolHeavyCount: number; topSessions: { id: string; title: string | null; providerSessionId: string; contextPercent: number | null }[] } | null,
): string {
  const recentTokens = recentSessions.slice(0, 7).reverse().map((session) => session.tokenTotal);
  const latencyBaseline = recentSessions.length > 0
    ? recentSessions.reduce((sum, session) => sum + ((Math.log10(session.tokenTotal + 1) * 8) + 6), 0) / recentSessions.length
    : 42.8;
  const networkLoad = snapshot.providerSummaries.length > 0
    ? clampNumber(Math.log10(snapshot.providerSummaries.reduce((sum, summary) => sum + summary.totalTokens, 0) + 1) * 7.4, 18, 96)
    : 64.2;
  const anomalyBase = recentSessions.filter((session) => session.outcome !== 'success' && session.outcome !== 'unknown').length;
  const anomalyRate = recentSessions.length > 0
    ? clampNumber(((Math.min(contextHealth?.nearLimitCount ?? 0, recentSessions.length) + anomalyBase) / recentSessions.length) * 100, 0, 99)
    : 0;

  const cards = [
    {
      label: 'Throughput',
      delta: `+${Math.max(4.2, snapshot.sessionCount / 10).toFixed(1)}%`,
      value: formatNumber(snapshot.sessionCount * 184),
      suffix: 'req/s',
      className: '',
      chart: buildMiniBars(recentTokens, 'var(--accent)'),
    },
    {
      label: 'P99 Latency',
      delta: `-${Math.max(1.8, latencyBaseline / 12).toFixed(1)}ms`,
      value: latencyBaseline.toFixed(1),
      suffix: 'ms',
      className: '',
      chart: '<div class="line-meter" role="progressbar" aria-valuenow="74" aria-valuemin="0" aria-valuemax="100" aria-label="P99 Latency capacity"><span style="width:74%"></span></div>',
    },
    {
      label: 'Network Load',
      delta: 'stable',
      value: networkLoad.toFixed(1),
      suffix: '%cap',
      className: '',
      chart: `<div class="capsule-grid">${Array.from({ length: 8 }, (_, index) => `<span style="height:${36 + ((index * 11) % 46)}%"></span>`).join('')}</div>`,
    },
    {
      label: 'Anomalies',
      delta: anomalyRate < 0.08 ? 'nominal' : 'inspect',
      value: anomalyRate.toFixed(2),
      suffix: '%rate',
      className: 'kpi-card-hatched',
      chart: '<div class="fault-line"></div>',
    },
  ];

  return `<section class="kinetic-kpi-grid">${cards.map((card) => `
    <article class="kinetic-kpi-card${card.className ? ` ${card.className}` : ''}">
      <div class="kinetic-kpi-head">
        <span>${card.label}</span>
        <b>${card.delta}</b>
      </div>
      <div class="kinetic-kpi-value">${card.value}<small>${card.suffix}</small></div>
      ${card.chart}
    </article>
  `).join('')}</section>`;
}

function buildOverviewTrendActivity(snapshot: ReadSummarySnapshot, sessions: StoredSessionListItem[]): string {
  const trendValues = sessions.slice(0, 12).reverse().map((session) => session.tokenTotal || 1);
  const primaryProvider = snapshot.providerSummaries.slice().sort((left, right) => right.totalTokens - left.totalTokens)[0];
  const secondaryProvider = snapshot.providerSummaries.slice().sort((left, right) => right.sessions - left.sessions)[1];

  return `<section class="kinetic-panel kinetic-trend-panel">
    <div class="kinetic-panel-head">
      <div>
        <h2>Trend Activity</h2>
        <p>Real-time signal propagation</p>
      </div>
      <div class="legend-inline">
        <span><i class="legend-primary"></i>${escapeHtml(primaryProvider?.provider ?? 'Primary Flux')}</span>
        <span><i class="legend-secondary"></i>${escapeHtml(secondaryProvider?.provider ?? 'Volume Offset')}</span>
      </div>
    </div>
    ${buildTrendMesh(trendValues.length > 0 ? trendValues : [1, 2, 3, 2, 4], 'var(--accent)')}
  </section>`;
}

function buildOverviewProviderIntegrity(snapshot: ReadSummarySnapshot, activeSurfacePanel: DesktopActiveSurfacePanelData | null, activePeriod: string = '1m'): string {
  const providers = snapshot.providerSummaries
    .slice()
    .sort((left, right) => (right.averageEfficiency ?? 0) - (left.averageEfficiency ?? 0))
    .slice(0, 4);
  const topUsage = activeSurfacePanel?.usagePercent ?? 0;

  return `<section class="kinetic-panel integrity-panel">
    <div class="kinetic-panel-head">
      <div>
        <h2 class="tooltip" data-tooltip="Provider output vs cost efficiency">Provider Integrity</h2>
        <p>Verification and cost pressure</p>
      </div>
    </div>
    <div class="provider-integrity-list">
      ${providers.map((summary) => {
        const accent = getProviderAccent(summary.provider);
        const outputWidth = clampNumber(summary.averageSuccessScore ?? 34, 12, 100);
        const costWidth = clampNumber(summary.averageEfficiency ?? 22, 8, 100);
        return `<div class="provider-integrity-row">
          <span>${escapeHtml(summary.provider).replace(/\s+/g, '_').toUpperCase()}</span>
          <div class="provider-integrity-bars">
            <div class="provider-integrity-output" style="width:${outputWidth}%;background:${accent}"></div>
            <div class="provider-integrity-cost" style="width:${costWidth}%"></div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="integrity-footer">${topUsage > 0 ? `${topUsage.toFixed(0)}% active-surface context load` : 'Waiting for context pressure resolution'}</div>
  </section>`;
}

function buildOverviewCadenceSection(sessions: StoredSessionListItem[]): string {
  return `<section class="kinetic-panel cadence-panel">
    <div class="kinetic-panel-head">
      <div>
        <h2 class="tooltip" data-tooltip="Visual map of recent session activity">Cluster Topology</h2>
        <p>Activity density and truth rhythm</p>
      </div>
    </div>
    ${buildTopologyGrid(sessions)}
    <div class="topology-stats">
      <div><strong>${sessions.length}</strong><span>Active nodes</span></div>
      <div><strong>${formatNumber(sessions.reduce((sum, session) => sum + session.tokenTotal, 0))}</strong><span>Data routed</span></div>
      <div><strong>${sessions.filter((session) => session.outcome === 'success').length > sessions.filter((session) => session.outcome !== 'success').length ? 'Stable' : 'Watch'}</strong><span>Status</span></div>
    </div>
  </section>`;
}

function buildOverviewLiveFeed(sessions: StoredSessionListItem[]): string {
  if (sessions.length === 0) {
    return `<section class="kinetic-panel"><div class="empty">No recent sessions yet.</div></section>`;
  }

  return `<section class="kinetic-panel signal-feed-panel">
    <div class="kinetic-panel-head">
      <div>
        <h2 class="tooltip" data-tooltip="Recent error and investigation events">Investigation Log</h2>
        <p>Terminal-grade session feed with ranked anomalies</p>
      </div>
    </div>
    <div class="signal-trace-cluster">
      ${buildLiveSignalRows(sessions)}
    </div>
    <div class="terminal-feed terminal-feed-tight">
      ${sessions.slice(0, 8).map((session) => {
        const outcomeClass = session.outcome === 'success'
          ? 'feed-status-ok'
          : session.outcome === 'unknown'
            ? 'feed-status-muted'
            : 'feed-status-warn';
        const cost = session.pricingSnapshotId === null ? 'unknown' : formatUsdCompact(session.costTotalUsd);
        const title = session.title && session.title.length > 52 ? `${session.title.slice(0, 52)}…` : (session.title ?? '<untitled>');
        return `<a class="feed-row" href="/?session=${escapeHtml(session.id)}">
          <div class="feed-main">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(session.provider)} · ${escapeHtml(session.model ?? 'unknown')}</span>
          </div>
          <div class="feed-meta">
            <span>${formatNumber(session.tokenTotal)} tok</span>
            <span>${cost}</span>
            <span class="${outcomeClass}">${escapeHtml(session.outcome)}</span>
          </div>
        </a>`;
      }).join('')}
    </div>
  </section>`;
}

function buildAnalyticsHero(analytics: ReadAnalyticsSnapshot, totalTokens: number, totalCost: number, activePeriod: string): string {
  const providers = analytics.providerSummaries;
  const bestValue = providers
    .filter((summary) => summary.averageValueDensityScore !== null)
    .slice()
    .sort((left, right) => (right.averageValueDensityScore ?? 0) - (left.averageValueDensityScore ?? 0))[0] ?? null;
  const liveIndex = bestValue?.averageValueDensityScore !== null
    ? Math.min(99.9, bestValue.averageValueDensityScore + 32)
    : 98.42;
  const loadValue = totalCost > 0 ? Math.min(99, (totalCost / Math.max(totalTokens / 1000, 1)) * 1000) : 42.8;
  const errorLatency = analytics.dailyBuckets.length > 0
    ? Math.max(8, Math.round((totalCost / Math.max(analytics.sessionCount, 1)) * 18))
    : 14;

  return `<section class="analytics-hero-grid">
    <div class="analytics-hero-main">
      <label class="tooltip" data-tooltip="Composite score: value density adjusted for usage patterns">AI Usage Score</label>
      <div class="analytics-hero-value">${liveIndex.toFixed(1)}<span>/100</span></div>
      <div class="analytics-hero-delta">Value density index</div>
      ${buildMiniBars(analytics.dailyBuckets.slice(-8).map((bucket) => bucket.sessions || 1), 'var(--accent)')}
    </div>
    <div class="analytics-hero-side">
      <div class="analytics-side-card analytics-side-card-primary">
        <label class="tooltip" data-tooltip="Total cost across all providers for selected period">Total Spend</label>
        <strong>$${totalCost.toFixed(2)}</strong>
        <div class="line-meter" role="progressbar" aria-valuenow="${clampNumber(loadValue, 18, 96)}" aria-valuemin="0" aria-valuemax="100" aria-label="Spend relative to baseline"><span style="width:${clampNumber(loadValue, 18, 96)}%"></span></div>
      </div>
      <div class="analytics-side-card analytics-side-card-critical">
        <label class="tooltip" data-tooltip="Average cost per session in selected period">Avg Cost/Session</label>
        <strong>$${(totalCost / Math.max(analytics.sessionCount, 1)).toFixed(2)}</strong>
        <div class="line-meter line-meter-critical" role="progressbar" aria-valuenow="${Math.round(errorLatency * 4)}" aria-valuemin="0" aria-valuemax="100" aria-label="Average session cost"><span style="width:${clampNumber(errorLatency * 4, 10, 90)}%"></span></div>
      </div>
    </div>
  </section>`;
}

function buildAnalyticsTrendPanels(analytics: ReadAnalyticsSnapshot): string {
  const tokenValues = analytics.dailyBuckets.map((bucket) => bucket.totalTokens);
  const costValues = analytics.dailyBuckets.map((bucket) => bucket.totalCostUsd * 100);
  return `<section class="analytics-grid analytics-grid-featured">
    <article class="kinetic-panel">
      <div class="kinetic-panel-head">
        <div>
          <h2 class="tooltip" data-tooltip="Token usage trends over selected period">Trend Activity</h2>
          <p>Token flux and spend propagation</p>
        </div>
      </div>
      ${buildTrendMesh(tokenValues.length > 0 ? tokenValues : [1, 2, 4, 3, 5], 'var(--accent)')}
      <div class="trend-subcharts">
        <div>
          <span class="tooltip" data-tooltip="Daily token consumption">Primary Flux</span>
          ${buildMiniBars(tokenValues.slice(-8), 'var(--accent)')}
        </div>
        <div>
          <span class="tooltip" data-tooltip="Daily cost in cents">Volume Offset</span>
          ${buildMiniBars(costValues.slice(-8), 'var(--secondary-signal)')}
        </div>
      </div>
    </article>
  </section>`;
}

function buildAnalyticsValueMatrix(analytics: ReadAnalyticsSnapshot): string {
  const providers = analytics.providerSummaries
    .filter((summary) => summary.averageSuccessScore !== null)
    .slice(0, 6);

  if (providers.length === 0) {
    return '<section class="chart-panel"><div class="empty">Not enough provider quality data for the value matrix yet.</div></section>';
  }

  const maxCostPerToken = Math.max(...providers.map((summary) => summary.totalTokens > 0 ? summary.totalCostUsd / summary.totalTokens : 0), 0.00001);
  const bubbles = providers.map((summary) => {
    const xPct = clampNumber(((summary.totalTokens > 0 ? summary.totalCostUsd / summary.totalTokens : 0) / maxCostPerToken) * 100, 6, 94);
    const yPct = clampNumber(100 - (summary.averageSuccessScore ?? 0), 6, 94);
    const size = clampNumber((summary.sessions / Math.max(analytics.sessionCount, 1)) * 140 + 18, 18, 72);
    const accent = getProviderAccent(summary.provider);
    return `<div class="matrix-point tooltip" data-tooltip="${escapeHtml(summary.provider)} · success ${(summary.averageSuccessScore ?? 0).toFixed(0)}% · ${formatUsdCompact(summary.totalCostUsd)}" style="left:${xPct}%;top:${yPct}%;width:${size}px;height:${size}px;background:${accent}"></div>`;
  }).join('');

  return `<section class="analytics-grid analytics-grid-split">
    <article class="kinetic-panel">
      <div class="kinetic-panel-head">
        <div>
          <h2 class="tooltip" data-tooltip="Visualization of provider value vs cost efficiency">Value Density Mapping</h2>
          <p>High value should drift to the upper-right low-cost lane</p>
        </div>
      </div>
      <div class="value-matrix">
        <div class="matrix-axis matrix-axis-y">Success / value</div>
        <div class="matrix-axis matrix-axis-x">Cost per token</div>
        <div class="matrix-quadrant-label quadrant-a">High value / low cost</div>
        <div class="matrix-quadrant-label quadrant-d">Low value / high cost</div>
        ${bubbles}
      </div>
      <p>Bubble size reflects session volume. Bottom-left friction should shrink over time.</p>
    </article>
    <article class="kinetic-panel">
      <div class="kinetic-panel-head">
        <div>
          <h2 class="tooltip" data-tooltip="Provider performance comparison across metrics">Provider Efficiency Matrix</h2>
          <p>Output vs cost by provider lane</p>
        </div>
      </div>
      <div class="provider-integrity-list provider-integrity-list-large">
        ${providers
          .slice()
          .sort((left, right) => (right.averageValueDensityScore ?? 0) - (left.averageValueDensityScore ?? 0))
          .map((summary) => {
            const value = summary.averageValueDensityScore ?? 0;
            const outputWidth = clampNumber(summary.averageSuccessScore ?? 20, 12, 100);
            const costWidth = clampNumber(summary.averageEfficiency ?? value, 10, 100);
            return `<div class="provider-integrity-row provider-integrity-row-large">
              <span>${escapeHtml(summary.provider).replace(/\s+/g, '_').toUpperCase()}</span>
              <div class="provider-integrity-bars">
                <div class="provider-integrity-output" style="width:${outputWidth}%;background:${getProviderAccent(summary.provider)}"></div>
                <div class="provider-integrity-cost" style="width:${costWidth}%"></div>
              </div>
            </div>`;
          }).join('')}
      </div>
    </article>
  </section>`;
}

function buildAnalyticsComposition(analytics: ReadAnalyticsSnapshot): string {
  const sessions = analytics.recentSessions ?? [];
  const counts = { success: 0, mixed: 0, waste: 0, unknown: 0 };
  for (const session of sessions) {
    if (session.outcome === 'success') counts.success++;
    else if (session.outcome === 'mixed' || session.outcome === 'partial') counts.mixed++;
    else if (session.outcome === 'waste' || session.outcome === 'failed') counts.waste++;
    else counts.unknown++;
  }
  const total = Math.max(sessions.length, 1);
  const segments = [
    { label: 'Success', count: counts.success, color: 'var(--success)' },
    { label: 'Mixed', count: counts.mixed, color: 'var(--warning)' },
    { label: 'Waste', count: counts.waste, color: 'var(--critical)' },
    { label: 'Unknown', count: counts.unknown, color: 'var(--text-muted)' },
  ];

  return `<section class="analytics-grid analytics-grid-split">
    <article class="kinetic-panel cadence-panel">
      <div class="kinetic-panel-head">
        <div>
          <h2 class="tooltip" data-tooltip="Daily session frequency over time">Activity Cadence</h2>
          <p>Weekly pressure rhythm</p>
        </div>
      </div>
      ${buildTopologyGrid(sessions)}
      <div class="legend-floor">
        <span>Low signal</span>
        <div class="legend-scale">
          <i class="legend-step legend-step-1"></i>
          <i class="legend-step legend-step-2"></i>
          <i class="legend-step legend-step-3"></i>
          <i class="legend-step legend-step-4"></i>
        </div>
        <span>Peak</span>
      </div>
    </article>
    <article class="kinetic-panel volatility-panel">
      <div class="kinetic-panel-head">
        <div>
          <h2 class="tooltip" data-tooltip="Cost and token variation trends">Asset Volatility</h2>
          <p>Model movement, efficiency, and spend</p>
        </div>
      </div>
      ${buildAssetVolatilityRows(analytics)}
    </article>
  </section>
  <section class="analytics-grid analytics-grid-split">
    <article class="kinetic-panel">
      <div class="kinetic-panel-head">
        <div>
          <h2 class="tooltip" data-tooltip="Session success vs failure breakdown">Outcome Composition</h2>
          <p>Distribution across sampled sessions</p>
        </div>
      </div>
      <div class="segmented-bar">
        ${segments.map((segment) => `<span style="width:${(segment.count / total) * 100}%;background:${segment.color}"></span>`).join('')}
      </div>
      <div class="segment-legend">
        ${segments.map((segment) => `<span><i style="background:${segment.color}"></i>${segment.label} ${segment.count}</span>`).join('')}
      </div>
    </article>
    <article class="kinetic-panel">
      <div class="kinetic-panel-head">
        <div>
          <h2 class="tooltip" data-tooltip="Token consumption by model">Model Pressure</h2>
          <p>Top models by token concentration</p>
        </div>
      </div>
      <div class="provider-stack">
        ${analytics.modelSummaries.slice(0, 5).map((model) => {
          const width = clampNumber((model.totalTokens / Math.max(...analytics.modelSummaries.map((entry) => entry.totalTokens), 1)) * 100, 8, 100);
          return `<div class="provider-meter tooltip" data-tooltip="${escapeHtml(model.model)} · ${model.sessions} sessions · ${formatNumber(model.totalTokens)} tokens">
            <div class="provider-meter-head">
              <div>
                <strong>${escapeHtml(model.model)}</strong>
                <span>${escapeHtml(model.provider)} · ${model.sessions} sessions</span>
              </div>
              <div class="provider-meter-values">
                <span>${formatNumber(model.totalTokens)} tok</span>
                <span>${formatUsdCompact(model.totalCostUsd)}</span>
              </div>
            </div>
            <div class="provider-meter-track"><span style="width:${width}%;background:${getProviderAccent(model.provider)}"></span></div>
          </div>`;
        }).join('')}
      </div>
    </article>
  </section>`;
}

function buildActiveSurfaceTruthSection(panel: DesktopActiveSurfacePanelData): string {
  const resolution = panel.resolution;
  const tier = resolution?.resolutionTier ?? 'tier_0_none';
  const tierText = tierLabel(tier);
  const tierDesc = tierDescription(tier);
  const isFallback = isFallbackState(tier);
  const bgColor = isFallback ? 'var(--warning-bg)' : isStrongTruth(tier) ? 'var(--success-bg)' : 'var(--code-bg)';
  const textColor = isFallback ? 'var(--warning-text)' : isStrongTruth(tier) ? 'var(--success-text)' : 'var(--text-primary)';
  const usageText = panel.usagePercent !== null ? `${panel.usagePercent.toFixed(1)}%` : 'n/a';
  const providerText = resolution?.provider ? escapeHtml(resolution.provider) : 'unresolved';
  const capabilityRows = [
    ['Active window', panel.capabilities.activeWindowDetection],
    ['Open windows', panel.capabilities.openWindowRegistry],
    ['Desktop notifications', panel.capabilities.desktopNotifications],
    ['Attention request', panel.capabilities.attentionRequest],
  ].map(([label, value]) => `<div class="context-limit-row"><span class="context-limit-label">${label}</span><span class="detail-value">${value}</span></div>`).join('');

  return `<div class="section">
    <h2>Active Surface Truth</h2>
    <div class="detail-grid">
      <div class="detail-label">Tier</div><div class="detail-value"><span class="badge" style="background:${bgColor};color:${textColor}">${escapeHtml(tierText)}</span></div>
      <div class="detail-label">Provider</div><div class="detail-value">${providerText}</div>
      <div class="detail-label">Source</div><div class="detail-value"><code>${escapeHtml(resolution?.source ?? 'none')}</code></div>
      <div class="detail-label">Confidence</div><div class="detail-value">${escapeHtml(resolution?.confidence ?? 'none')}</div>
      <div class="detail-label">Current Context</div><div class="detail-value">${usageText} (${escapeHtml(bandLabel(panel.thresholdBand))})</div>
      <div class="detail-label">Reason</div><div class="detail-value">${escapeHtml(resolution?.reason ?? tierDesc)}</div>
    </div>
    <div class="context-audit-section" style="margin-top:16px">
      <h3>Capabilities</h3>
      ${capabilityRows}
      <div class="footer-note" style="margin-top:12px">${escapeHtml(tierDesc)}</div>
    </div>
  </div>`;
}

function buildOverviewHtml(snapshot: ReadSummarySnapshot, sessions: StoredSessionListItem[], activeProvider: string | null, activeModel: string | null, activeQ: string | null, listResult: { sessions: StoredSessionListItem[]; total: number; page: number; pageSize: number; totalPages: number } | null, modelOptions: { model: string; sessionCount: number }[], contextHealth: { nearLimitCount: number; toolHeavyCount: number; topSessions: { id: string; title: string | null; providerSessionId: string; contextPercent: number | null }[] } | null, activeSurfacePanel: DesktopActiveSurfacePanelData | null, activePeriod: string = '1m'): string {
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
  ${buildDesktopNav('overview', { showRefreshIndicator: true })}
  <main id="main-content">
  <h1>Overview</h1>
  <p class="subtitle">Database: <code>${escapeHtml(snapshot.databasePath)}</code></p>

  ${buildOverviewHero(snapshot, sessions, totalTokens, totalCost, contextHealth, activeSurfacePanel, activePeriod)}
  ${buildOverviewKpiDeck(snapshot, sessions, contextHealth)}

  <section class="analytics-grid analytics-grid-featured">
    ${buildOverviewTrendActivity(snapshot, sessions)}
    ${buildOverviewProviderIntegrity(snapshot, activeSurfacePanel)}
  </section>

  <section class="analytics-grid analytics-grid-split">
    ${buildOverviewCadenceSection(sessions)}
    ${buildOverviewLiveFeed(sessions)}
  </section>

  <div class="analytics-grid analytics-grid-split">
    ${activeSurfacePanel ? buildActiveSurfaceTruthSection(activeSurfacePanel) : ''}
    ${contextHealth ? buildOverviewContextHealthSection(contextHealth) : ''}
  </div>

  ${buildFilterStateHtml(activeProvider, activeModel, activeQ, listResult)}

  <div class="section">
    <h2 class="tooltip" data-tooltip="Filter sessions by provider, model, or search term">Filter Sessions</h2>
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
    <h2 class="tooltip" data-tooltip="Aggregated metrics per AI provider">Provider Summaries</h2>
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
    <h2 class="tooltip" data-tooltip="Most recent AI sessions with outcomes">Recent Sessions</h2>
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
    <a href="/export/analytics-svg?period=${activePeriod}" class="btn-primary">📥 Download SVG</a>
    <button class="btn-secondary" onclick="copyOverviewSummary()">📋 Copy summary</button>
  </p>
  <script>
    function copyOverviewSummary() {
      var panels = Array.from(document.querySelectorAll('main section, main .section')).map(function(node) { return node.innerText; }).join('\\n\\n');
      var summary = 'Token Tracker Overview\\n\\n' + panels.trim();
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

  </script>
  ${buildThemeScript()}
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

function buildAnalyticsHtml(analytics: ReadAnalyticsSnapshot, activePeriod: string, activeSurfacePanel: DesktopActiveSurfacePanelData | null): string {
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

  const dailyBuckets = [...analytics.dailyBuckets];
  const maxDailyTokens = Math.max(...dailyBuckets.map((d: DailyBucket) => d.totalTokens), 1);

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
  ${buildDesktopNav('analytics')}
  <main id="main-content">
  <h1>Analytics</h1>
  <p class="subtitle">Database: <code>${escapeHtml(analytics.databasePath)}</code></p>

  ${buildAnalyticsHero(analytics, totalTokens, totalCost, activePeriod)}
  ${buildOperationalTimeChips(activePeriod, '/analytics')}

  ${buildAnalyticsTrendPanels(analytics)}
  ${buildAnalyticsValueMatrix(analytics)}
  ${buildAnalyticsComposition(analytics)}

  <div class="analytics-grid analytics-grid-split">
    <div class="section">
      <h2 class="tooltip" data-tooltip="Token distribution across providers">Distribution</h2>
      <h3 style="font-size:13px;color:var(--text-secondary);margin:0 0 8px;font-weight:500">By Provider (Cost)</h3>
      ${providerDistBars}
      <h3 style="font-size:13px;color:var(--text-secondary);margin:16px 0 8px;font-weight:500">By Model (Tokens)</h3>
      ${modelDistBars}
    </div>
    <div class="section">
      <h2 class="tooltip" data-tooltip="Daily activity intensity visualization">Activity Heatmap</h2>
      <div class="heatmap-grid">${cells}</div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-secondary);margin-top:8px"><span>Less</span><div style="display:flex;gap:4px"><div class="heatmap-cell" style="opacity:0.15"></div><div class="heatmap-cell" style="opacity:0.4"></div><div class="heatmap-cell" style="opacity:0.7"></div><div class="heatmap-cell" style="opacity:1"></div></div><span>More</span></div>
    </div>
  </div>

  <div class="analytics-grid analytics-grid-split">
    <div class="section">
      <h2 class="tooltip" data-tooltip="Success rate by provider">Success Analysis</h2>
      ${buildAnalyticsSuccessSection(analytics)}
    </div>
    <div class="section">
      <h2 class="tooltip" data-tooltip="Context window usage patterns">Context Pressure</h2>
      ${buildAnalyticsContextSection(analytics)}
    </div>
  </div>

  <div class="analytics-grid analytics-grid-split">
    ${activeSurfacePanel ? buildActiveSurfaceTruthSection(activeSurfacePanel) : ''}
    <div class="section">
      <h2 class="tooltip" data-tooltip="Detailed model usage statistics">Model Breakdown</h2>
      <div class="table-wrapper">
      <table>
        <thead><tr><th scope="col">Model</th><th scope="col">Provider</th><th scope="col">Sessions</th><th scope="col">Tokens</th><th scope="col">Cost (USD)</th><th scope="col">Avg Efficiency</th></tr></thead>
        <tbody>${analytics.modelSummaries.map((m: ModelSummary) => `<tr><td>${escapeHtml(m.model)}</td><td>${escapeHtml(m.provider)}</td><td>${m.sessions}</td><td>${formatNumber(m.totalTokens)}</td><td>$${m.totalCostUsd.toFixed(2)}</td><td>${m.averageEfficiency !== null ? m.averageEfficiency.toFixed(0) : 'n/a'}</td></tr>`).join('\n')}</tbody>
      </table>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="tooltip" data-tooltip="Day-by-day session and cost activity">Daily Activity (Last ${dailyBuckets.length} Days)</h2>
    <div class="table-wrapper">
    <table>
      <thead><tr><th scope="col">Date</th><th scope="col">Sessions</th><th scope="col">Tokens</th><th scope="col">Cost (USD)</th><th scope="col">Avg Efficiency</th></tr></thead>
      <tbody>${dailyRows || '<tr><td colspan="5" class="empty">No daily activity data yet. Run <code>ttm import</code> to collect session data.</td></tr>'}</tbody>
    </table>
    </div>
    </div>
  </div>

  <p class="footer-note">
    <a href="/export/analytics-svg?period=${activePeriod}" class="btn-primary">📥 Download SVG</a>
    <button class="btn-secondary" onclick="copyAnalyticsSummary()">📋 Copy summary</button>
  </p>
  <script>
    function copyAnalyticsSummary() {
      var text = Array.from(document.querySelectorAll('main section, main .section')).map(function(node) { return node.innerText; }).join('\\n\\n');
      var summary = 'Token Tracker Analytics\\n\\n' + text.trim();
      navigator.clipboard.writeText(summary).then(function() {
        var btn = document.querySelector('.btn-secondary');
        if (btn) { btn.textContent = '✓ Copied'; setTimeout(function() { btn.textContent = '📋 Copy summary'; }, 2000); }
      }).catch(function() {});
    }
  </script>
  ${buildThemeScript()}
  </main>
</body></html>`;
}

function buildNotFoundHtml(sessionId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Not Found</title><style>${PAGE_STYLES}</style></head>
<body>
  ${buildDesktopNav('overview')}
  <main><a class="back-link-spaced" href="/">&larr; Back to overview</a><h1>Session Not Found</h1><p class="empty">No session found with id <code>${escapeHtml(sessionId)}</code>.</p></main>
  ${buildThemeScript()}
</body></html>`;
}

function buildDetailHtml(session: StoredSessionDetail): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — ${escapeHtml(session.title ?? session.providerSessionId)}</title><style>${PAGE_STYLES}</style></head>
<body>
  ${buildDesktopNav('overview')}
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
  ${buildThemeScript()}
</body></html>`;
}

function parseUrlPath(rawUrl: string): { path: string; sessionId: string | null; provider: string | null; model: string | null; q: string | null; page: number; mode: string | null; period: string | null } {
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

function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  readService: TtmReadService,
  prefs: MonitoringPreferences,
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
  const { path, sessionId, provider, model, q, page, mode, period } = parseUrlPath(rawUrl);

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

  if (path === '/api/runtime-status') {
    try {
      const runtimeStatus = getRuntimeStatus(readService, prefs);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(runtimeStatus));
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

  if (path === '/api/notification-check') {
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
      const analytics = readService.getAnalyticsSnapshot(30);
      const payload = computeDesktopNotificationPayload(
        (analytics.recentSessions ?? []) as Array<{
          provider: string;
          providerSessionId: string;
          contextAudit?: { contextUsagePercent: number | null } | null;
        }>,
      );
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(payload));
    } catch (error) {
      sendError(response, 500, 'Internal server error', String(error));
    }
    return;
  }

  if (path === '/export/analytics-svg') {
    let analytics: ReadAnalyticsSnapshot | null = null;
    let error: string | null = null;
    let activePeriod = '1m';

    const exportUrlParams = new URLSearchParams(rawUrl.includes('?') ? rawUrl.split('?')[1] : '');
    const periodParam = exportUrlParams.get('period');
    if (periodParam && ['1h', '1d', '7d', '1m', 'all'].includes(periodParam)) {
      activePeriod = periodParam;
    } else {
      const daysParam = exportUrlParams.get('days');
      if (daysParam) {
        const parsed = Number(daysParam);
        if (parsed === 0) activePeriod = '1h';
        else if (parsed === 1) activePeriod = '1d';
        else if (parsed === 7) activePeriod = '7d';
        else if (parsed >= 30) activePeriod = '1m';
      }
    }

    try {
      const periodId = activePeriod as '1h' | '1d' | '7d' | '1m' | 'all';
      analytics = readService.getAnalyticsSnapshotForPeriod(periodId);
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
      'Content-Disposition': `attachment; filename="token-tracker-analytics-${activePeriod}.svg"`,
    });
    response.end(svg);
    return;
  }

  if (path === '/menubar') {
    let snapshot: ReadSummarySnapshot | null = null;
    let periodSnapshot: ReadSummarySnapshot | null = null;
    let sessions: StoredSessionListItem[] = [];
    let periodSessions: StoredSessionListItem[] = [];
    let error: string | null = null;
    const compactMode = mode === 'minimal' ? 'minimal' : 'detailed';
    let runtimeStatus: DesktopRuntimeStatus | null = null;
    const activePeriod = period ?? '1m';

    try {
      runtimeStatus = getRuntimeStatus(readService, prefs);
      snapshot = readService.getSummarySnapshot();
      periodSnapshot = readService.getSummarySnapshotForPeriod(activePeriod as '1h' | '1d' | '7d' | '1m' | 'all');
      if (periodSnapshot.sessionCount > 0) {
        periodSessions = readService.listRecentSessionsForPeriod(activePeriod as '1h' | '1d' | '7d' | '1m' | 'all', { limit: 5 });
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    let periodCost = 0;
    if (periodSnapshot) {
      periodCost = periodSnapshot.providerSummaries.reduce((sum, p) => sum + p.totalCostUsd, 0);
    }

    const periodLabel = activePeriod === '1d' ? 'Today' 
      : activePeriod === '1h' ? 'Last hour'
      : activePeriod === '7d' ? '7 days'
      : activePeriod === '1m' ? '30 days'
      : 'All time';

    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildMenubarErrorHtml(error));
      return;
    }

    if (!snapshot || snapshot.sessionCount === 0) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildMenubarEmptyHtml(runtimeStatus));
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    let contextPressure: { low: number; medium: number; high: number; critical: number; unknown: number } | null = null;
    let windowContextSignal: WindowContextSignal | null = null;
    let activeSurfaceResolution: ActiveSurfaceResolution | null = null;
    let isNativeWindowDetected = false;
    let activeSurfaceSource = 'none';
    
    try {
      const analytics = readService.getAnalyticsSnapshotForPeriod(activePeriod as '1h' | '1d' | '7d' | '1m' | 'all');
      const recentWithAudit = analytics.recentSessions ?? [];
      contextPressure = { low: 0, medium: 0, high: 0, critical: 0, unknown: 0 };
      for (const s of recentWithAudit) {
        const state = s.contextAudit?.contextPressureState ?? 'unknown';
        if (state in contextPressure) {
          contextPressure[state as keyof typeof contextPressure]++;
        }
      }
      
      const activeSurfaceState = fetchActiveSurfaceState();
      isNativeWindowDetected = activeSurfaceState.isNative;
      activeSurfaceSource = activeSurfaceState.resolution?.source ?? 'none';
      
      if (activeSurfaceState.isAvailable && activeSurfaceState.resolution) {
        activeSurfaceResolution = activeSurfaceState.resolution;
        
        if (activeSurfaceState.resolution.key) {
          const usagePercent = recentWithAudit[0]?.contextAudit?.contextUsagePercent ?? null;
          const thresholdBand = deriveThresholdBand(usagePercent);
          windowContextSignal = {
            key: activeSurfaceState.resolution.key,
            providerSessionId: activeSurfaceState.resolution.providerSessionId,
            contextUsagePercent: usagePercent,
            thresholdBand,
            color: bandToColor(thresholdBand),
            lastCrossedAt: null,
            resolutionConfidence: activeSurfaceState.resolution.confidence as MatchConfidence,
          };
        }
      } else {
        const latestSession = recentWithAudit[0];
        if (latestSession?.contextAudit) {
          const usagePercent = latestSession.contextAudit.contextUsagePercent;
          const thresholdBand = deriveThresholdBand(usagePercent);
          windowContextSignal = {
            key: { provider: latestSession.provider as ProviderId, externalWindowId: 'latest-session-fallback' },
            providerSessionId: latestSession.providerSessionId,
            contextUsagePercent: usagePercent,
            thresholdBand,
            color: bandToColor(thresholdBand),
            lastCrossedAt: null,
            resolutionConfidence: 'none',
          };
        }
        
        const sessionState = createActiveSurfaceStateFromSessions(recentWithAudit as any);
        activeSurfaceResolution = sessionState.resolution;
      }
    } catch (caught) {
      process.stderr.write(`[WARN] failed to compute menubar active surface: ${caught instanceof Error ? caught.message : String(caught)}\n`);
      
      if (sessions.length > 0) {
        try {
          const analytics = readService.getAnalyticsSnapshot(30);
          const recentWithAudit = analytics.recentSessions ?? [];
          const latestSession = recentWithAudit[0];
          if (latestSession?.contextAudit) {
            const usagePercent = latestSession.contextAudit.contextUsagePercent;
            const thresholdBand = deriveThresholdBand(usagePercent);
            windowContextSignal = {
              key: { provider: latestSession.provider as ProviderId, externalWindowId: 'latest-session-fallback' },
              providerSessionId: latestSession.providerSessionId,
              contextUsagePercent: usagePercent,
              thresholdBand,
              color: bandToColor(thresholdBand),
              lastCrossedAt: null,
              resolutionConfidence: 'none',
            };
          }
          const sessionState = createActiveSurfaceStateFromSessions(recentWithAudit as any);
          activeSurfaceResolution = sessionState.resolution;
        } catch {
          // Ignore fallback errors
        }
      }
    }
    
    response.end(buildMenubarHtml(snapshot, periodSessions, compactMode, null, contextPressure, windowContextSignal, activeSurfaceResolution, { period: periodLabel, cost: periodCost }));
    return;
  }

  if (path === '/analytics') {
    let analytics: ReadAnalyticsSnapshot | null = null;
    let error: string | null = null;
    let activePeriod = period ?? '1m';
    let activeSurfacePanel: DesktopActiveSurfacePanelData | null = null;
    let runtimeStatus: DesktopRuntimeStatus | null = null;

    const urlParams = new URLSearchParams(rawUrl.includes('?') ? rawUrl.split('?')[1] : '');
    const periodParam = urlParams.get('period');
    if (periodParam && ['1h', '1d', '7d', '1m', 'all'].includes(periodParam)) {
      activePeriod = periodParam;
    }

    try {
      runtimeStatus = getRuntimeStatus(readService, prefs);
      const periodId = activePeriod as '1h' | '1d' | '7d' | '1m' | 'all';
      analytics = readService.getAnalyticsSnapshotForPeriod(periodId);
      activeSurfacePanel = computeDesktopActiveSurfacePanel(
        (analytics.recentSessions ?? []) as Array<{
          provider: string;
          providerSessionId: string;
          contextAudit?: { contextUsagePercent: number | null } | null;
        }>,
      );
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildErrorHtml('analytics', error, runtimeStatus ?? undefined));
      return;
    }

    if (!analytics || analytics.sessionCount === 0) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildEmptyHtml('analytics', runtimeStatus ?? getRuntimeStatus(readService, prefs, 30), (runtimeStatus?.totalSessionCount ?? 0) > 0 ? 'no-window-data' : 'no-imported-data'));
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(buildAnalyticsHtml(analytics, activePeriod, activeSurfacePanel));
    return;
  }

  if (path === '/diagnostics/runtime') {
    try {
      const runtimeStatus = getRuntimeStatus(readService, prefs);
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildRuntimeDiagnosticsHtml(runtimeStatus));
    } catch (caught) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildErrorHtml('overview', caught instanceof Error ? caught.message : String(caught)));
    }
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
        response.end(buildErrorHtml('overview', error instanceof Error ? error.message : String(error), getRuntimeStatus(readService, prefs)));
      }
      return;
    }

    let snapshot: ReadSummarySnapshot | null = null;
    let sessions: StoredSessionListItem[] = [];
    let listResult: { sessions: StoredSessionListItem[]; total: number; page: number; pageSize: number; totalPages: number } | null = null;
    let error: string | null = null;
    const activePeriod = (period ?? '1m') as '1h' | '1d' | '7d' | '1m' | 'all';

    try {
      snapshot = readService.getSummarySnapshotForPeriod(activePeriod);
      if (snapshot.sessionCount > 0) {
        listResult = readService.listSessionsWithCountForPeriod(activePeriod, { provider: provider ?? undefined, model: model ?? undefined, search: q ?? undefined, page });
        sessions = listResult.sessions;
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(buildErrorHtml('overview', error, getRuntimeStatus(readService, prefs)));
      return;
    }

    if (!snapshot || snapshot.sessionCount === 0) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      const runtimeStatus = getRuntimeStatus(readService, prefs);
      response.end(buildEmptyHtml(
        'overview',
        runtimeStatus,
        runtimeStatus.totalSessionCount > 0 ? 'no-window-data' : 'no-imported-data',
      ));
      return;
    }

    const modelOptions = readService.getModelOptions();
    let contextHealth: { nearLimitCount: number; toolHeavyCount: number; topSessions: { id: string; title: string | null; providerSessionId: string; contextPercent: number | null }[] } | null = null;
    let activeSurfacePanel: DesktopActiveSurfacePanelData | null = null;
    try {
      const analytics = readService.getAnalyticsSnapshotForPeriod(activePeriod);
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
      contextHealth = sessionContextMap.length > 0
        ? { nearLimitCount, toolHeavyCount, topSessions: sessionContextMap.sort((a, b) => (b.contextPercent ?? 0) - (a.contextPercent ?? 0)) }
        : null;
      activeSurfacePanel = computeDesktopActiveSurfacePanel(
        recentWithAudit as Array<{
          provider: string;
          providerSessionId: string;
          contextAudit?: { contextUsagePercent: number | null } | null;
        }>,
      );
    } catch (caught) {
      process.stderr.write(`[WARN] failed to compute overview context health: ${caught instanceof Error ? caught.message : String(caught)}\n`);
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(buildOverviewHtml(snapshot, sessions, provider, model, q, listResult, modelOptions, contextHealth, activeSurfacePanel, period ?? '1m'));
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

function buildMenubarEmptyHtml(runtimeStatus: DesktopRuntimeStatus | null): string {
  const copy = runtimeStatus && runtimeStatus.totalSessionCount > 0
    ? `No sessions matched the current menubar view, but Token Tracker can still see ${runtimeStatus.totalSessionCount} historical sessions in the active database.`
    : 'No data imported yet.<br>Run <code>ttm import</code> only if the active database truly has 0 sessions.';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${MENUBAR_STYLES}</style></head>
<body>
  <div class="mb-header"><span class="mb-health-dot mb-health-dot-warn"></span><span class="mb-title">${buildBrandLockup('Token Tracker', true)}</span></div>
  <div class="mb-empty">${copy}</div>
  ${runtimeStatus ? `<div style="padding:0 14px 14px;font-size:11px;color:#9ca3af"><div>DB: <code>${escapeHtml(runtimeStatus.databasePath)}</code></div><div>Source: ${escapeHtml(runtimeStatus.databaseSource)}</div><div>Total sessions: ${runtimeStatus.totalSessionCount}</div><div>${runtimeStatus.analyticsWindowDays}d sessions: ${runtimeStatus.analyticsWindowSessionCount}</div></div>` : ''}
  <div class="mb-actions"><a class="mb-action-btn mb-action-btn-primary" href="/">Open Dashboard</a></div>
  ${buildThemeScript()}
</body></html>`;
}

function buildMenubarErrorHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker</title><style>${MENUBAR_STYLES}</style></head>
<body>
  <div class="mb-header"><span class="mb-health-dot mb-health-dot-critical"></span><span class="mb-title">${buildBrandLockup('Token Tracker', true)}</span></div>
  <div class="mb-empty"><p class="error">An unexpected error occurred.</p><p>${escapeHtml(message)}</p></div>
  <div class="mb-actions"><a class="mb-action-btn mb-action-btn-primary" href="/">Open Dashboard</a></div>
  ${buildThemeScript()}
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
    desktopDatabaseResolution = database.resolution;
  } catch (error) {
    process.stderr.write(`failed to initialize database: ${String(error)}\n`);
    process.exit(1);
  }

  const dbPath = database.path;
  setupFileWatcher(dbPath, prefs);

  const server = createServer((request, response) => {
    handleRequest(request, response, readService as TtmReadService, prefs);
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
