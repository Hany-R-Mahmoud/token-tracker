import { PAGE_STYLES } from '../styles.js';
import { buildBrandLockup } from '../brand.js';
import type { DesktopRuntimeStatus } from '../runtime-status.js';

export type DesktopSurface = 'overview' | 'analytics';
export type EmptyStateKind = 'no-imported-data' | 'no-window-data';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const sourceLabels: Record<string, string> = {
  canonical_home: 'canonical home database',
  env: 'env override',
  explicit: 'explicit path',
  legacy_cwd_fallback: 'legacy fallback path',
  legacy_cwd_migrated: 'legacy path migrated to home',
};

export function buildThemeScript(): string {
  const clientScript = buildClientTabScript();
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
  } catch (e) {}
})();
</script>${clientScript}`;
}

function buildClientTabScript(): string {
  return `<script>
(function() {
  try {
    var timeChips = document.querySelector('.time-chips');
    if (!timeChips) return;
    var basePath = timeChips.getAttribute('data-base-path') || '/';
    var chips = timeChips.querySelectorAll('.time-chip');
    chips.forEach(function(chip) {
      chip.addEventListener('click', function(e) {
        e.preventDefault();
        var period = chip.getAttribute('data-period');
        var isDefault = chip.hasAttribute('data-is-default');
        var fullPath = isDefault ? basePath : basePath + period;
        chips.forEach(function(c) {
          var selected = c.getAttribute('data-period') === period;
          c.classList.toggle('active', selected);
          c.setAttribute('aria-selected', String(selected));
        });
        if (window.history && window.history.pushState) {
          window.history.pushState({ period: period }, '', fullPath);
        }
        window.location.reload();
      });
    });
  } catch (_) {}
})();
</script>`;
}

export function buildDesktopNav(active: DesktopSurface, options: { showRefreshIndicator?: boolean } = {}): string {
  const ri = options.showRefreshIndicator
    ? '<span class="refresh-indicator" id="refresh-state" title="Auto-refresh: watching database" role="status" aria-live="polite"></span>'
    : '<span class="refresh-indicator refresh-indicator-placeholder" aria-hidden="true">watching database</span>';
  return `<nav class="nav"><span class="nav-brand">${buildBrandLockup('Token Tracker', true)}</span><div class="nav-links"><a href="/"${active === 'overview' ? ' class="active"' : ''}>Overview</a><a href="/analytics"${active === 'analytics' ? ' class="active"' : ''}>Analytics</a></div><div class="nav-actions">${ri}<button id="theme-toggle" class="btn-icon" title="Toggle theme">🌓</button></div></nav>`;
}

export function buildRuntimeStatusCard(runtimeStatus: DesktopRuntimeStatus): string {
  return `<div class="section" style="margin-top:20px"><h2 class="tooltip" data-tooltip="System health and performance metrics">Runtime Diagnostics</h2><div class="details-grid"><div class="detail-label">Runtime</div><div class="detail-value">${escapeHtml(runtimeStatus.runtimeMode)}</div><div class="detail-label">Port</div><div class="detail-value">${runtimeStatus.port}</div><div class="detail-label">Owner</div><div class="detail-value"><code>${escapeHtml(runtimeStatus.ownerPath || 'unknown')}</code></div><div class="detail-label">Database</div><div class="detail-value"><code>${escapeHtml(runtimeStatus.databasePath)}</code></div><div class="detail-label">Source</div><div class="detail-value">${escapeHtml(sourceLabels[runtimeStatus.databaseSource] ?? runtimeStatus.databaseSource)}</div><div class="detail-label">Canonical path</div><div class="detail-value"><code>${escapeHtml(runtimeStatus.canonicalDatabasePath)}</code></div><div class="detail-label">Legacy path</div><div class="detail-value">${runtimeStatus.legacyDatabasePath ? `<code>${escapeHtml(runtimeStatus.legacyDatabasePath)}</code>` : 'none detected'}</div><div class="detail-label">Migration</div><div class="detail-value">${runtimeStatus.migrationPerformed ? 'performed on startup' : 'not needed'}</div><div class="detail-label">Total sessions</div><div class="detail-value">${runtimeStatus.totalSessionCount}</div><div class="detail-label">${runtimeStatus.analyticsWindowDays}d sessions</div><div class="detail-value">${runtimeStatus.analyticsWindowSessionCount}</div><div class="detail-label">DB exists</div><div class="detail-value">${runtimeStatus.dbExists ? 'yes' : 'no'}</div><div class="detail-label">Refresh cadence</div><div class="detail-value">${runtimeStatus.refreshCadenceSeconds}s</div><div class="detail-label">Started</div><div class="detail-value">${escapeHtml(runtimeStatus.startedAt)}</div></div><div class="footer-note" style="margin-top:12px"><a href="/api/runtime-status">View runtime JSON</a></div></div>`;
}

export function buildErrorHtml(surface: DesktopSurface, _message: string, runtimeStatus?: DesktopRuntimeStatus): string {
  const title = surface === 'analytics' ? 'Analytics' : 'Overview';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Token Tracker — Error</title><style>${PAGE_STYLES}</style></head><body><a class="skip-link" href="#main-content">Skip to main content</a>${buildDesktopNav(surface)}<main id="main-content"><h1>${title}</h1><p class="error">An unexpected error occurred. Please try again.</p>${runtimeStatus ? buildRuntimeStatusCard(runtimeStatus) : ''}</main>${buildThemeScript()}</body></html>`;
}

export function buildEmptyHtml(surface: DesktopSurface, runtimeStatus: DesktopRuntimeStatus, kind: EmptyStateKind, period?: string): string {
  const title = surface === 'analytics' ? 'Analytics' : 'Overview';
  const periodText = period === '1h' ? 'the last hour' : period === '1d' ? 'the last day' : period === '7d' ? 'the last 7 days' : period === '1m' ? 'the last month' : 'the selected time window';
  const body = kind === 'no-window-data'
    ? `No sessions in ${periodText}. Token Tracker can still see ${runtimeStatus.totalSessionCount} historical sessions in the active database.`
    : 'No data has been imported into the active local database yet.';
  const hint = kind === 'no-window-data'
    ? '<p class="empty" style="margin-top:12px">Try a wider time window (7d, 1m, or all) to see historical data.</p>'
    : '<p class="empty" style="margin-top:12px">Run <code>ttm import</code> only if the diagnostics below show the active database truly has 0 sessions.</p>';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Token Tracker</title><style>${PAGE_STYLES}</style></head><body><a class="skip-link" href="#main-content">Skip to main content</a>${buildDesktopNav(surface)}<main id="main-content"><h1>${title}</h1><p class="empty">${body}</p>${hint}${buildRuntimeStatusCard(runtimeStatus)}</main>${buildThemeScript()}</body></html>`;
}

export function buildRuntimeDiagnosticsHtml(runtimeStatus: DesktopRuntimeStatus): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Token Tracker — Runtime Diagnostics</title><style>${PAGE_STYLES}</style></head><body><a class="skip-link" href="#main-content">Skip to main content</a>${buildDesktopNav('overview')}<main id="main-content"><h1>Runtime Diagnostics</h1><p class="subtitle">Packaged and local desktop modes must agree on the same active database.</p>${buildRuntimeStatusCard(runtimeStatus)}</main>${buildThemeScript()}</body></html>`;
}