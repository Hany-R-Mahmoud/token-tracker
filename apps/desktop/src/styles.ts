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
    --warning: #f59e0b;
    --critical: #ef4444;
    --code-bg: #f3f4f6;
    --table-header-bg: #f9fafb;
    --table-row-hover: #f9fafb;
    --table-row-even: #fafbfc;
    --table-row-even-hover: #f3f4f6;
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
  }
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 960px; margin: 0 auto; padding: 0 16px; color: var(--text-primary); background: var(--bg-primary); }
  .nav { background: var(--bg-nav); padding: 10px 16px; margin: 0 -16px 24px; display: flex; align-items: center; gap: 16px; }
  .nav-brand { color: #fff; font-weight: 600; font-size: 14px; margin-right: auto; }
  .nav a { color: var(--text-muted); text-decoration: none; font-size: 13px; padding: 4px 8px; border-radius: 4px; }
  .nav a:hover, .nav a.active { color: #fff; background: rgba(255,255,255,0.1); }
  h1 { margin-bottom: 4px; font-size: 22px; }
  .subtitle { color: var(--text-secondary); margin-bottom: 20px; font-size: 13px; }
  .stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; flex: 1; min-width: 140px; }
  .stat-value { font-size: 22px; font-weight: 700; color: var(--text-primary); }
  .stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }
  .section { margin-top: 24px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
  .section h2 { font-size: 15px; font-weight: 600; margin: 0 0 12px; color: var(--text-primary); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border-light); font-size: 13px; }
  th { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; background: var(--table-header-bg); }
  tbody tr:hover { background: var(--table-row-hover); }
  tbody tr:nth-child(even) { background: var(--table-row-even); }
  tbody tr:nth-child(even):hover { background: var(--table-row-even-hover); }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { background: var(--code-bg); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  .pricing-warn { color: #b45309; font-size: 11px; }
  .reset-cell { font-size: 12px; color: #6b7280; }
  .empty { color: #6b7280; font-size: 13px; }
  .error { color: #b91c1c; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
  .badge-ok { background: #dcfce7; color: #166534; }
  .badge-warn { background: #fef3c7; color: #92400e; }
  .badge-unknown { background: #f3f4f6; color: #6b7280; }
  .detail-grid { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; margin-top: 16px; }
  .detail-label { font-size: 13px; color: #6b7280; }
  .detail-value { font-size: 14px; }
  .back-link { margin-bottom: 16px; display: inline-block; font-size: 13px; }
  .factor-list { list-style: none; padding: 0; margin: 8px 0; }
  .factor-item { padding: 4px 0; font-size: 13px; }
  .bar { height: 18px; background: #2563eb; border-radius: 4px; transition: opacity 0.15s; }
  .bar:hover { opacity: 0.85; }
  .bar-label { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .filter-form { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
  .filter-label { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: #6b7280; font-weight: 500; }
  .filter-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; }
  .filter-form select { padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; }
  .filter-form input { flex: 1; min-width: 160px; padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; }
  .filter-form button { padding: 4px 16px; background: var(--accent); color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; }
  .filter-form button:hover { background: var(--accent-hover); }
  .clear-link { padding: 4px 8px; color: #6b7280; text-decoration: underline; font-size: 12px; }
  .active-filters { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
  .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light); }
  .pagination a { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; }
  .pagination a:hover { background: var(--table-row-hover); text-decoration: none; }
  .pagination .disabled { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; color: #d1d5db; pointer-events: none; }
  .pagination .page-info { font-size: 12px; color: var(--text-secondary); }
  .pagination-nav { display: flex; gap: 8px; align-items: center; }
  .footer-note { margin-top: 24px; color: var(--text-secondary); font-size: 13px; }
  .chart-row { margin-bottom: 4px; }
  .chart-label { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
  .chart-bar { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px; }
  .menubar-label { color: #9ca3af; font-size: 10px; }
  .detail-tokens { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 4px 12px; }
  .detail-token-item { font-size: 13px; }
  .detail-token-label { color: #6b7280; }
  .back-link-spaced { margin-bottom: 16px; display: inline-block; font-size: 13px; }
  .unpriced-text { color: #b45309; font-size: 10px; margin-left: 4px; }
  .factor-positive { color: #166534; }
  .factor-negative { color: #b91c1c; }
  .factor-neutral { color: #6b7280; }
  .dist-section { margin-bottom: 6px; }
  .meter { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .meter-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .meter-fill-healthy { background: #22c55e; }
  .meter-fill-warn { background: #f59e0b; }
  .meter-fill-critical { background: #ef4444; }
  .refresh-indicator { font-size: 10px; color: var(--text-muted); margin-left: auto; }
  .refresh-indicator::before { content: "●"; color: var(--refresh-color, #22c55e); margin-right: 4px; }
  .window-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 8px 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; }
  .window-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
  .window-btn { padding: 4px 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 12px; color: var(--text-primary); text-decoration: none; }
  .window-btn:hover { background: var(--table-row-hover); text-decoration: none; }
  .window-btn-active { background: var(--accent); color: #fff; border-color: var(--accent); }
  .window-btn-active:hover { background: var(--accent-hover); }
  .window-hint { font-size: 11px; color: var(--text-muted); margin-left: auto; }
  .theme-toggle { background: none; border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 14px; line-height: 1; }
  .theme-toggle:hover { background: rgba(255,255,255,0.1); }
  .copy-btn { padding: 2px 8px; background: var(--accent); color: #fff; border: none; border-radius: 4px; font-size: 11px; cursor: pointer; margin-left: 8px; }
  .copy-btn:hover { background: var(--accent-hover); }
  .mode-toggle { font-size: 14px; cursor: pointer; padding: 2px 4px; color: #fff; opacity: 0.7; }
  .mode-toggle:hover { opacity: 1; }
  .heatmap-grid { display: flex; gap: 2px; flex-wrap: wrap; }
  .heatmap-cell { width: 14px; height: 14px; background: var(--accent); border-radius: 2px; }
  .incident-badge { font-size: 10px; margin-left: 2px; }
`;

export const MENUBAR_STYLES = `
  body { font-family: system-ui, -apple-system, sans-serif; max-width: 320px; margin: 0; padding: 10px 12px; color: #111827; background: #ffffff; font-size: 13px; line-height: 1.4; }
  .header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
  .header-title { font-size: 14px; font-weight: 600; flex: 1; }
  .health-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .health-dot-healthy { background: #22c55e; }
  .health-dot-warn { background: #f59e0b; }
  .health-dot-critical { background: #ef4444; }
  .aggregate { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; margin-bottom: 8px; font-size: 12px; color: #6b7280; }
  .aggregate-value { font-weight: 500; color: #111827; }
  .section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; margin: 8px 0 4px; }
  .provider-row { display: flex; align-items: center; gap: 4px; padding: 3px 0; font-size: 12px; }
  .provider-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .provider-dot-healthy { background: #22c55e; }
  .provider-dot-warn { background: #f59e0b; }
  .provider-dot-critical { background: #ef4444; }
  .provider-name { flex: 1; color: #374151; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .provider-sessions { color: #9ca3af; font-size: 11px; margin-right: 4px; }
  .provider-cost { font-weight: 500; color: #111827; white-space: nowrap; }
  .reset-bar-wrap { margin: 1px 0 5px 10px; height: 3px; background: #f3f4f6; border-radius: 2px; overflow: hidden; }
  .reset-bar { height: 100%; border-radius: 2px; }
  .reset-bar-healthy { background: #22c55e; }
  .reset-bar-warn { background: #f59e0b; }
  .reset-bar-critical { background: #ef4444; }
  .unpriced-warn { color: #b45309; font-size: 10px; margin-left: 4px; }
  .recent-item { display: flex; justify-content: space-between; align-items: baseline; padding: 2px 0; font-size: 12px; }
  .recent-title { color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; }
  .recent-cost { color: #6b7280; font-size: 11px; margin-left: 8px; white-space: nowrap; }
  .recent-time { color: #9ca3af; font-size: 10px; margin-left: 4px; white-space: nowrap; }
  .action-link { display: block; text-align: center; margin-top: 10px; padding: 7px; background: #2563eb; color: #fff; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; }
  .action-link:hover { background: #1d4ed8; }
  .empty { color: #6b7280; font-size: 12px; text-align: center; padding: 16px 0; }
  .error { color: #b91c1c; font-size: 12px; }
  .unpriced-text { color: #b45309; font-size: 10px; margin-left: 4px; }
  .incident-badge { font-size: 10px; margin-left: 2px; }
  .menubar-label { color: #9ca3af; font-size: 10px; }
  .mode-toggle { font-size: 14px; cursor: pointer; padding: 2px 4px; color: #fff; opacity: 0.7; }
  .mode-toggle:hover { opacity: 1; }
`;
