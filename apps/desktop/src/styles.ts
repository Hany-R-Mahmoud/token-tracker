export const PAGE_STYLES = `
  :root {
    --bg-primary: #f9fafb;
    --bg-secondary: #ffffff;
    --bg-nav: #111827;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-muted: #9ca3af;
    --border: #e5e7eb;
    --border-light: #f3f4f6;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --success: #22c55e;
    --success-bg: #dcfce7;
    --success-text: #166534;
    --warning: #f59e0b;
    --warning-bg: #fef3c7;
    --warning-text: #92400e;
    --critical: #ef4444;
    --critical-bg: #fee2e2;
    --critical-text: #991b1b;
    --code-bg: #f3f4f6;
    --table-header-bg: #f9fafb;
    --table-row-hover: #f9fafb;
    --table-row-even: #fafbfc;
    --table-row-even-hover: #f3f4f6;
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-full: 9999px;
    --transition-fast: 0.15s ease;
  }
  [data-theme="dark"] {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --bg-nav: #030712;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
    --text-muted: #6b7280;
    --border: #374151;
    --border-light: #1f2937;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --code-bg: #1f2937;
    --table-header-bg: #1f2937;
    --table-row-hover: #1f2937;
    --table-row-even: #1a2332;
    --table-row-even-hover: #1f2937;
    --success-bg: #064e3b;
    --success-text: #6ee7b7;
    --warning-bg: #78350f;
    --warning-text: #fcd34d;
    --critical-bg: #7f1d1d;
    --critical-text: #fca5a5;
  }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 960px; margin: 0 auto; padding: 0 16px; color: var(--text-primary); background: var(--bg-primary); }
  .nav { background: var(--bg-nav); padding: 10px 16px; margin: 0 -16px 24px; display: flex; align-items: center; gap: 16px; }
  .nav-brand { color: #fff; font-weight: 600; font-size: 14px; margin-right: auto; }
  .nav a { color: var(--text-muted); text-decoration: none; font-size: 13px; padding: 4px 8px; border-radius: var(--radius-sm); transition: background var(--transition-fast), color var(--transition-fast); }
  .nav a:hover, .nav a.active { color: #fff; background: rgba(255,255,255,0.1); }
  h1 { margin-bottom: 4px; font-size: 22px; }
  .subtitle { color: var(--text-secondary); margin-bottom: 20px; font-size: 13px; }
  .stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 12px 16px; flex: 1; min-width: 140px; transition: border-color var(--transition-fast); }
  .stat-card:hover { border-color: var(--accent); }
  .stat-value { font-size: 22px; font-weight: 700; color: var(--text-primary); }
  .stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }
  .section { margin-top: 24px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; }
  .section h2 { font-size: 15px; font-weight: 600; margin: 0 0 12px; color: var(--text-primary); }

  /* Fixed table layout with column widths and ellipsis */
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border-light); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  th { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; background: var(--table-header-bg); }
  tbody tr { transition: background var(--transition-fast); }
  tbody tr:hover { background: var(--table-row-hover); }
  tbody tr:nth-child(even) { background: var(--table-row-even); }
  tbody tr:nth-child(even):hover { background: var(--table-row-even-hover); }

  /* Column widths for provider table */
  .col-provider { width: 15%; }
  .col-sessions { width: 10%; }
  .col-tokens { width: 12%; }
  .col-cost { width: 20%; }
  .col-reset { width: 18%; }
  .col-efficiency { width: 10%; }

  /* Column widths for session table */
  .col-session { width: 25%; }
  .col-provider-sm { width: 12%; }
  .col-model { width: 15%; }
  .col-tokens-sm { width: 12%; }
  .col-cost-sm { width: 12%; }
  .col-outcome { width: 12%; }

  a { color: var(--accent); text-decoration: none; transition: color var(--transition-fast); }
  a:hover { text-decoration: underline; }
  code { background: var(--code-bg); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 12px; }
  .pricing-warn { color: var(--warning-text); font-size: 11px; }
  .reset-cell { font-size: 12px; color: var(--text-secondary); }
  .empty { color: var(--text-secondary); font-size: 13px; text-align: center; }
  .error { color: var(--critical); }
  .badge { display: inline-block; padding: 2px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 500; }
  .badge-ok { background: var(--success-bg); color: var(--success-text); }
  .badge-warn { background: var(--warning-bg); color: var(--warning-text); }
  .badge-unknown { background: var(--code-bg); color: var(--text-secondary); }
  .detail-grid { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; margin-top: 16px; }
  .detail-label { font-size: 13px; color: var(--text-secondary); }
  .detail-value { font-size: 14px; }
  .back-link { margin-bottom: 16px; display: inline-block; font-size: 13px; }
  .factor-list { list-style: none; padding: 0; margin: 8px 0; }
  .factor-item { padding: 4px 0; font-size: 13px; }
  .bar { height: 18px; background: var(--accent); border-radius: var(--radius-sm); transition: opacity var(--transition-fast); }
  .bar:hover { opacity: 0.85; }
  .bar-label { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }

  /* Proper filter form labels */
  .filter-form { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
  .filter-label { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: var(--text-secondary); font-weight: 500; }
  .filter-label select, .filter-label input { font-size: 13px; }
  .filter-section { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 12px 16px; margin-bottom: 24px; }
  .filter-form select { padding: 4px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); transition: border-color var(--transition-fast); }
  .filter-form select:focus { border-color: var(--accent); outline: none; }
  .filter-form input { flex: 1; min-width: 160px; padding: 4px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); transition: border-color var(--transition-fast); }
  .filter-form input:focus { border-color: var(--accent); outline: none; }
  .filter-form button { padding: 4px 16px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 13px; cursor: pointer; transition: background var(--transition-fast); }
  .filter-form button:hover { background: var(--accent-hover); }

  /* Focus indicators */
  .clear-link:focus-visible, .pagination a:focus-visible, .window-btn:focus-visible,
  .mb-action-btn:focus-visible, .theme-toggle:focus-visible, .btn-primary:focus-visible, .btn-secondary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .clear-link { padding: 4px 8px; color: var(--text-secondary); text-decoration: underline; font-size: 12px; }
  .active-filters { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
  .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light); }
  .pagination a { padding: 4px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; transition: background var(--transition-fast), border-color var(--transition-fast); }
  .pagination a:hover { background: var(--table-row-hover); text-decoration: none; }
  .pagination .disabled { padding: 4px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 12px; color: #d1d5db; pointer-events: none; }
  .pagination .page-info { font-size: 12px; color: var(--text-secondary); }
  .pagination-nav { display: flex; gap: 8px; align-items: center; }

  /* Button hierarchy */
  .footer-note { margin-top: 24px; color: var(--text-secondary); font-size: 13px; display: flex; align-items: center; gap: 8px; }
  .btn-primary { padding: 4px 12px; background: #16a34a; color: #fff; border: none; border-radius: var(--radius-sm); font-size: 11px; cursor: pointer; text-decoration: none; transition: background var(--transition-fast); }
  .btn-primary:hover { background: #15803d; text-decoration: none; }
  .btn-secondary { padding: 4px 12px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 11px; cursor: pointer; transition: background var(--transition-fast); }
  .btn-secondary:hover { background: var(--accent-hover); }

  .chart-row { margin-bottom: 4px; }
  .chart-label { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
  .chart-bar { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px; }
  .menubar-label { color: var(--text-muted); font-size: 10px; }
  .detail-tokens { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 4px 12px; }
  .detail-token-item { font-size: 13px; }
  .detail-token-label { color: var(--text-secondary); }
  .back-link-spaced { margin-bottom: 16px; display: inline-block; font-size: 13px; }
  .unpriced-text { color: var(--warning-text); font-size: 10px; margin-left: 4px; }
  .factor-positive { color: var(--success-text); }
  .factor-negative { color: var(--critical); }
  .factor-neutral { color: var(--text-secondary); }
  .dist-section { margin-bottom: 6px; }
  .meter { height: 6px; background: var(--border); border-radius: var(--radius-sm); overflow: hidden; margin-top: 4px; }
  .meter-fill { height: 100%; border-radius: var(--radius-sm); transition: width 0.3s ease; }
  .meter-fill-healthy { background: var(--success); }
  .meter-fill-warn { background: var(--warning); }
  .meter-fill-critical { background: var(--critical); }

  /* Improved refresh indicator */
  .refresh-indicator { font-size: 11px; color: var(--text-muted); margin-left: auto; display: flex; align-items: center; gap: 4px; }
  .refresh-indicator::before { content: "↻"; color: var(--refresh-color, var(--success)); font-size: 12px; }

  .window-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 8px 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-lg); }
  .window-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
  .window-btn { padding: 4px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; color: var(--text-primary); text-decoration: none; transition: background var(--transition-fast), border-color var(--transition-fast); }
  .window-btn:hover { background: var(--table-row-hover); text-decoration: none; }
  .window-btn-active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .window-btn-active:hover { background: var(--accent-hover); }
  .window-hint { font-size: 11px; color: var(--text-muted); margin-left: auto; }
  .theme-toggle { background: none; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 2px 6px; border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; line-height: 1; transition: background var(--transition-fast); }
  .theme-toggle:hover { background: rgba(255,255,255,0.1); }
  .mode-toggle { font-size: 14px; cursor: pointer; padding: 2px 4px; color: #fff; opacity: 0.7; transition: opacity var(--transition-fast); }
  .mode-toggle:hover { opacity: 1; }
  .heatmap-grid { display: flex; gap: 2px; flex-wrap: wrap; }
  .heatmap-cell { width: 14px; height: 14px; background: var(--accent); border-radius: 2px; transition: opacity var(--transition-fast); }
  .heatmap-cell:hover { opacity: 0.8; }
  .incident-badge { font-size: 10px; margin-left: 2px; }
`;

export const MENUBAR_STYLES = `
  :root {
    --mb-bg: #ffffff;
    --mb-text: #111827;
    --mb-text-secondary: #6b7280;
    --mb-text-muted: #9ca3af;
    --mb-border: #f3f4f6;
    --mb-bg-secondary: #f9fafb;
    --mb-border-color: #e5e7eb;
    --mb-success: #22c55e;
    --mb-warning: #f59e0b;
    --mb-critical: #ef4444;
    --mb-success-bg: #dcfce7;
    --mb-success-text: #166534;
    --mb-warning-bg: #fef3c7;
    --mb-warning-text: #92400e;
    --mb-critical-bg: #fee2e2;
    --mb-critical-text: #991b1b;
    --mb-accent: #2563eb;
    --mb-accent-hover: #1d4ed8;
    --mb-radius-sm: 4px;
    --mb-radius-md: 6px;
    --mb-transition: 0.15s ease;
  }
  [data-theme="dark"] {
    --mb-bg: #1f2937;
    --mb-text: #f9fafb;
    --mb-text-secondary: #9ca3af;
    --mb-text-muted: #6b7280;
    --mb-border: #1f2937;
    --mb-bg-secondary: #111827;
    --mb-border-color: #374151;
    --mb-success-bg: #064e3b;
    --mb-success-text: #6ee7b7;
    --mb-warning-bg: #78350f;
    --mb-warning-text: #fcd34d;
    --mb-critical-bg: #7f1d1d;
    --mb-critical-text: #fca5a5;
  }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; width: 340px; margin: 0; padding: 0; color: var(--mb-text); background: var(--mb-bg); font-size: 12px; line-height: 1.3; overflow-x: hidden; }
  .mb-header { display: flex; align-items: center; gap: 6px; padding: 10px 12px 8px; border-bottom: 1px solid var(--mb-border); }
  .mb-health-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .mb-health-dot-healthy { background: var(--mb-success); }
  .mb-health-dot-warn { background: var(--mb-warning); }
  .mb-health-dot-critical { background: var(--mb-critical); }
  .mb-title { font-size: 13px; font-weight: 600; flex: 1; }
  .mb-mode-toggle { font-size: 12px; cursor: pointer; padding: 2px 4px; color: var(--mb-text-muted); transition: color var(--mb-transition); }
  .mb-mode-toggle:hover { color: var(--mb-text); }

  /* Hero section */
  .mb-hero { padding: 12px; border-bottom: 1px solid var(--mb-border); }
  .mb-hero-cost { font-size: 22px; font-weight: 700; color: var(--mb-text); }
  .mb-hero-meta { display: flex; gap: 12px; margin-top: 4px; font-size: 11px; color: var(--mb-text-secondary); }
  .mb-effectiveness { display: inline-flex; align-items: center; gap: 4px; margin-top: 6px; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
  .mb-effectiveness-efficient { background: var(--mb-success-bg); color: var(--mb-success-text); }
  .mb-effectiveness-mixed { background: var(--mb-warning-bg); color: var(--mb-warning-text); }
  .mb-effectiveness-waste-heavy { background: var(--mb-critical-bg); color: var(--mb-critical-text); }

  /* Consumption bars */
  .mb-section { padding: 8px 12px; border-bottom: 1px solid var(--mb-border); }
  .mb-section-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mb-text-muted); margin-bottom: 6px; }
  .mb-provider-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .mb-provider-bar-name { width: 50px; font-size: 11px; font-weight: 500; color: var(--mb-text); flex-shrink: 0; }
  .mb-provider-bar-track { flex: 1; height: 6px; background: var(--mb-border); border-radius: 3px; overflow: hidden; }
  .mb-provider-bar-fill { height: 100%; border-radius: 3px; transition: width var(--mb-transition); }
  .mb-provider-bar-cost { width: 52px; text-align: right; font-size: 11px; font-weight: 500; color: var(--mb-text); flex-shrink: 0; }

  /* Effectiveness */
  .mb-outcome-row { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; font-size: 11px; }
  .mb-outcome-label { width: 60px; color: var(--mb-text-secondary); flex-shrink: 0; }
  .mb-outcome-bar { flex: 1; height: 4px; background: var(--mb-border); border-radius: 2px; overflow: hidden; }
  .mb-outcome-fill { height: 100%; border-radius: 2px; transition: width var(--mb-transition); }
  .mb-outcome-fill-success { background: var(--mb-success); }
  .mb-outcome-fill-mixed { background: var(--mb-warning); }
  .mb-outcome-fill-waste { background: var(--mb-critical); }
  .mb-outcome-count { width: 20px; text-align: right; color: var(--mb-text); font-weight: 500; flex-shrink: 0; }
  .mb-efficiency-summary { display: flex; gap: 12px; margin-top: 6px; font-size: 11px; color: var(--mb-text-secondary); }
  .mb-efficiency-summary span { display: flex; align-items: center; gap: 3px; }

  /* Provider status */
  .mb-provider-row { display: flex; align-items: center; gap: 4px; padding: 3px 0; font-size: 11px; }
  .mb-provider-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .mb-provider-dot-healthy { background: var(--mb-success); }
  .mb-provider-dot-warn { background: var(--mb-warning); }
  .mb-provider-dot-critical { background: var(--mb-critical); }
  .mb-provider-name { flex: 1; color: var(--mb-text); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .mb-provider-cost { font-weight: 500; color: var(--mb-text); white-space: nowrap; }
  .mb-provider-reset { color: var(--mb-text-muted); font-size: 10px; white-space: nowrap; }
  .mb-reset-bar { margin: 2px 0 4px 10px; height: 3px; background: var(--mb-border); border-radius: 2px; overflow: hidden; }
  .mb-reset-bar-fill { height: 100%; border-radius: 2px; transition: width var(--mb-transition); }
  .mb-reset-bar-healthy { background: var(--mb-success); }
  .mb-reset-bar-warn { background: var(--mb-warning); }
  .mb-reset-bar-critical { background: var(--mb-critical); }

  /* Recent activity */
  .mb-recent-item { display: flex; justify-content: space-between; align-items: baseline; padding: 2px 0; font-size: 11px; }
  .mb-recent-title { color: var(--mb-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; }
  .mb-recent-cost { color: var(--mb-text-secondary); font-size: 10px; margin-left: 6px; white-space: nowrap; }
  .mb-recent-time { color: var(--mb-text-muted); font-size: 10px; margin-left: 4px; white-space: nowrap; }

  /* Team preview */
  .mb-team-row { display: flex; align-items: center; gap: 6px; font-size: 11px; padding: 2px 0; }
  .mb-team-rank { font-weight: 600; color: var(--mb-accent); width: 20px; }
  .mb-team-label { color: var(--mb-text-secondary); }

  /* Quick actions */
  .mb-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 8px 12px 12px; }
  .mb-action-btn { display: block; text-align: center; padding: 6px 8px; background: var(--mb-bg-secondary); border: 1px solid var(--mb-border-color); border-radius: var(--mb-radius-md); color: var(--mb-text); text-decoration: none; font-size: 11px; font-weight: 500; transition: background var(--mb-transition), border-color var(--mb-transition); }
  .mb-action-btn:hover { background: var(--mb-border); text-decoration: none; }
  .mb-action-btn:focus-visible { outline: 2px solid var(--mb-accent); outline-offset: 2px; }
  .mb-action-btn-primary { background: var(--mb-accent); color: #fff; border-color: var(--mb-accent); }
  .mb-action-btn-primary:hover { background: var(--mb-accent-hover); }

  /* States */
  .mb-empty { padding: 24px 12px; text-align: center; color: var(--mb-text-muted); font-size: 12px; }
  .mb-empty-icon { font-size: 24px; margin-bottom: 8px; }
`;
