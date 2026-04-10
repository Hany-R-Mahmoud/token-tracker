export const PAGE_STYLES = `
  :root {
    --bg-primary: #0b1326;
    --bg-secondary: #171f33;
    --bg-tertiary: #131b2e;
    --bg-panel-strong: #222a3d;
    --bg-nav: #060e20;
    --bg-elevated: rgba(11, 19, 38, 0.9);
    --text-primary: #dae2fd;
    --text-secondary: #bac9cc;
    --text-muted: #849396;
    --border: #2d3449;
    --border-strong: #3b494c;
    --border-light: #222a3d;
    --accent: #a3ffd9;
    --accent-hover: #36ffc4;
    --accent-soft: rgba(163, 255, 217, 0.12);
    --secondary-signal: #b9c8de;
    --success: #36ffc4;
    --success-bg: rgba(54, 255, 196, 0.12);
    --success-text: #a3ffd9;
    --warning: #f0c674;
    --warning-bg: rgba(240, 198, 116, 0.15);
    --warning-text: #f0c674;
    --critical: #b01522;
    --critical-bg: rgba(176, 21, 34, 0.16);
    --critical-text: #ffc1bd;
    --code-bg: #131b2e;
    --table-header-bg: #131b2e;
    --table-row-hover: #1b2438;
    --table-row-even: #151d31;
    --table-row-even-hover: #1d263a;
    --radius-sm: 3px;
    --radius-md: 4px;
    --radius-lg: 6px;
    --radius-full: 9999px;
    --transition-fast: 0.15s ease;
    --shadow-elevated: 0 24px 56px rgba(4, 10, 25, 0.42);
    --hash-pattern: repeating-linear-gradient(
      -45deg,
      rgba(107, 114, 128, 0.18) 0,
      rgba(107, 114, 128, 0.18) 6px,
      rgba(107, 114, 128, 0) 6px,
      rgba(107, 114, 128, 0) 12px
    );
  }
  [data-theme="light"] {
    --bg-primary: #eef2fb;
    --bg-secondary: #ffffff;
    --bg-tertiary: #e3ebf7;
    --bg-panel-strong: #f6f9ff;
    --bg-nav: #ffffff;
    --bg-elevated: rgba(255, 255, 255, 0.92);
    --text-primary: #162031;
    --text-secondary: #4e6078;
    --text-muted: #6e7f96;
    --border: #d5e4fb;
    --border-strong: #b9c8de;
    --border-light: #e3ebf7;
    --accent: #006c50;
    --accent-hover: #00a77a;
    --accent-soft: rgba(0, 108, 80, 0.1);
    --secondary-signal: #4e6078;
    --success: #006c50;
    --success-bg: rgba(0, 108, 80, 0.1);
    --success-text: #00513c;
    --warning: #3c4a5d;
    --warning-bg: rgba(60, 74, 93, 0.18);
    --warning-text: #1a2a3d;
    --critical: #930015;
    --critical-bg: rgba(147, 0, 21, 0.1);
    --critical-text: #68000c;
    --code-bg: #eef2fb;
    --table-header-bg: #eef2fb;
    --table-row-hover: #f4f7fc;
    --table-row-even: #fafcff;
    --table-row-even-hover: #eef2fb;
    --shadow-elevated: 0 18px 42px rgba(20, 20, 20, 0.08);
    --hash-pattern: repeating-linear-gradient(
      -45deg,
      rgba(107, 114, 128, 0.2) 0,
      rgba(107, 114, 128, 0.2) 6px,
      rgba(107, 114, 128, 0) 6px,
      rgba(107, 114, 128, 0) 12px
    );
  }
  * { box-sizing: border-box; }
  html {
    background:
      radial-gradient(circle at top right, rgba(163, 255, 217, 0.08), transparent 28%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
      var(--bg-primary);
  }
  body {
    font-family: "Instrument Sans", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    max-width: 1180px;
    margin: 0 auto;
    padding: 0 20px 28px;
    color: var(--text-primary);
    background: transparent;
    letter-spacing: -0.01em;
  }
  main { padding-bottom: 24px; }
  h1 {
    margin: 22px 0 6px;
    font-size: clamp(28px, 4vw, 42px);
    line-height: 0.96;
    letter-spacing: -0.04em;
    text-transform: uppercase;
  }
  h2, h3 {
    font-family: "Instrument Sans", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: -0.02em;
  }
  .subtitle {
    color: var(--text-secondary);
    margin: 0 0 22px;
    font-size: 12px;
    line-height: 1.5;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .nav {
    position: sticky;
    top: 0;
    z-index: 20;
    background:
      linear-gradient(180deg, rgba(163, 255, 217, 0.08), rgba(163, 255, 217, 0)),
      var(--bg-elevated);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    padding: 12px 16px;
    margin: 0 -20px 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(190px, 1fr);
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-elevated);
  }
  .nav-brand {
    color: var(--text-primary);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    justify-self: start;
  }
  .brand-lockup {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .brand-lockup-compact { gap: 8px; }
  .brand-mark {
    width: 20px;
    height: 20px;
    color: var(--accent);
    flex-shrink: 0;
  }
  .brand-mark-compact {
    width: 16px;
    height: 16px;
  }
  .brand-wordmark {
    display: inline-block;
    color: var(--accent);
    font-size: 12px;
    font-style: italic;
    font-weight: 800;
    letter-spacing: -0.04em;
    text-transform: uppercase;
  }
  .nav-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 0;
  }
  .nav-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    min-width: 190px;
  }
  .nav a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 6px 10px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    transition: border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
  }
  .nav a:hover,
  .nav a.active {
    color: var(--text-primary);
    background: var(--accent-soft);
    border-color: var(--border-strong);
  }
  .stats-row,
  .analytics-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
  }
  .stat-card,
  .section,
  .filter-section,
  .context-audit-section,
  .window-controls {
    position: relative;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0)),
      var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-elevated);
  }
  .stat-card {
    padding: 14px 16px;
    min-width: 0;
    overflow: hidden;
  }
  .stat-card::before,
  .section::before,
  .filter-section::before,
  .context-audit-section::before,
  .window-controls::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(163, 255, 217, 0.08), transparent 42%);
    opacity: 0.8;
  }
  .stat-card:hover,
  .section:hover,
  .filter-section:hover,
  .context-audit-section:hover {
    border-color: var(--border-strong);
  }
  .stat-value,
  .detail-value,
  .mb-hero-cost,
  .mb-provider-cost,
  .mb-provider-reset,
  .mb-team-rank,
  .chart-bar span:last-child,
  .bar-label,
  .window-btn,
  th,
  td,
  code {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", "SF Mono", monospace;
    font-variant-numeric: tabular-nums;
  }
  .stat-value {
    font-size: clamp(24px, 3vw, 34px);
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }
  .stat-label {
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 8px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
  }
  .section,
  .filter-section,
  .context-audit-section {
    padding: 16px;
  }
  .section { margin-top: 24px; }
  .section h2,
  .section h3,
  .context-audit-section h3 {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 14px;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .table-wrapper { overflow-x: auto; }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  th, td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  th {
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    background: var(--table-header-bg);
  }
  tbody tr { transition: background var(--transition-fast); }
  tbody tr:hover { background: var(--table-row-hover); }
  tbody tr:nth-child(even) { background: var(--table-row-even); }
  tbody tr:nth-child(even):hover { background: var(--table-row-even-hover); }
  .col-provider { width: 15%; }
  .col-sessions { width: 10%; }
  .col-tokens { width: 12%; }
  .col-cost { width: 20%; }
  .col-reset { width: 18%; }
  .col-efficiency { width: 10%; }
  .col-session { width: 25%; }
  .col-provider-sm { width: 12%; }
  .col-model { width: 15%; }
  .col-tokens-sm { width: 12%; }
  .col-cost-sm { width: 12%; }
  .col-outcome { width: 12%; }
  a {
    color: var(--accent);
    text-decoration: none;
    transition: color var(--transition-fast);
  }
  a:hover { color: var(--accent-hover); text-decoration: underline; }
  code {
    background: var(--code-bg);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    border: 1px solid var(--border);
  }
  .pricing-warn { color: var(--warning-text); font-size: 11px; }
  .reset-cell { font-size: 11px; color: var(--text-secondary); }
  .empty { color: var(--text-secondary); font-size: 13px; text-align: center; }
  .error { color: var(--critical); }
  .badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: var(--radius-full);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    border: 1px solid transparent;
  }
  .badge-ok { background: var(--success-bg); color: var(--success-text); border-color: rgba(16, 185, 129, 0.28); }
  .badge-warn { background: var(--warning-bg); color: var(--warning-text); border-color: rgba(234, 179, 8, 0.28); }
  .badge-unknown {
    color: var(--text-secondary);
    border-color: var(--border-strong);
    background:
      var(--hash-pattern),
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
      var(--bg-tertiary);
  }
  .detail-grid {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 10px 18px;
    margin-top: 18px;
    padding: 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-elevated);
  }
  .detail-label {
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
  }
  .detail-value { font-size: 14px; }
  .back-link,
  .back-link-spaced {
    margin-bottom: 16px;
    display: inline-block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .factor-list { list-style: none; padding: 0; margin: 8px 0; }
  .factor-item {
    padding: 5px 0;
    font-size: 13px;
    border-bottom: 1px dashed var(--border);
  }
  .bar {
    height: 10px;
    background: linear-gradient(90deg, rgba(163, 255, 217, 0.68), var(--accent));
    border-radius: 2px;
    border: 1px solid rgba(163, 255, 217, 0.22);
    transition: opacity var(--transition-fast);
  }
  .bar:hover { opacity: 0.85; }
  .bar-label { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
  .filter-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
    align-items: end;
  }
  .filter-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .filter-label select,
  .filter-label input {
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-panel-strong);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 9px 10px;
  }
  .filter-label select:focus,
  .filter-label input:focus {
    border-color: var(--accent);
    outline: none;
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .filter-form button,
  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 14px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
  }
  .filter-form button,
  .btn-secondary {
    background: var(--accent-soft);
    color: var(--text-primary);
    border-color: rgba(163, 255, 217, 0.28);
  }
  .filter-form button:hover,
  .btn-secondary:hover {
    background: rgba(163, 255, 217, 0.2);
    text-decoration: none;
  }
  .btn-primary {
    background: var(--accent);
    color: #003828;
    border-color: rgba(163, 255, 217, 0.46);
  }
  .btn-primary:hover { background: var(--accent-hover); text-decoration: none; }
  .clear-link {
    padding: 8px 10px;
    color: var(--text-secondary);
    text-decoration: underline;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .clear-link:focus-visible,
  .pagination a:focus-visible,
  .window-btn:focus-visible,
  .mb-action-btn:focus-visible,
  .theme-toggle:focus-visible,
  .btn-primary:focus-visible,
  .btn-secondary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .active-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  .pagination a,
  .pagination .disabled {
    padding: 7px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .pagination a:hover { background: var(--table-row-hover); text-decoration: none; }
  .pagination .disabled { color: var(--text-muted); pointer-events: none; }
  .pagination .page-info { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.12em; }
  .pagination-nav { display: flex; gap: 8px; align-items: center; }
  .footer-note {
    margin-top: 24px;
    color: var(--text-secondary);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .chart-row { margin-bottom: 8px; }
  .chart-label { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }
  .chart-bar {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
    margin-bottom: 4px;
    color: var(--text-secondary);
  }
  .chart-bar span:first-child {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .menubar-label { color: var(--text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; }
  .detail-tokens { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 6px 12px; }
  .detail-token-item { font-size: 13px; }
  .detail-token-label { color: var(--text-secondary); }
  .unpriced-text { color: var(--warning-text); font-size: 10px; margin-left: 4px; }
  .factor-positive { color: var(--success-text); }
  .factor-negative { color: var(--critical); }
  .factor-neutral { color: var(--text-secondary); }
  .dist-section { margin-bottom: 8px; }
  .meter {
    height: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 6px;
  }
  .meter-fill { height: 100%; border-radius: 2px; transition: width 0.3s ease; }
  .meter-fill-healthy { background: var(--success); }
  .meter-fill-warn { background: var(--warning); }
  .meter-fill-critical { background: var(--critical); }
  .refresh-indicator {
    font-size: 10px;
    color: var(--text-muted);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 154px;
    justify-content: flex-end;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .refresh-indicator::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--refresh-color, var(--success));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--refresh-color, var(--success)) 18%, transparent);
  }
  .refresh-indicator-placeholder { visibility: hidden; }
  .window-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 10px 12px;
  }
  .window-label,
  .window-hint {
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .window-btn {
    padding: 7px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 11px;
    color: var(--text-primary);
    text-decoration: none;
    background: var(--bg-panel-strong);
    transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
  }
  .window-btn:hover { background: var(--table-row-hover); text-decoration: none; }
  .window-btn-active {
    background: var(--accent);
    color: #003828;
    border-color: rgba(163, 255, 217, 0.46);
  }
  .window-btn-active:hover { background: var(--accent-hover); }
  .window-hint { margin-left: auto; }
  .theme-toggle {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    transition: background var(--transition-fast), border-color var(--transition-fast);
  }
  .theme-toggle:hover { background: var(--accent-soft); border-color: var(--border-strong); }
  .mode-toggle {
    font-size: 14px;
    cursor: pointer;
    padding: 2px 4px;
    color: var(--text-primary);
    opacity: 0.7;
    transition: opacity var(--transition-fast);
  }
  .mode-toggle:hover { opacity: 1; }
  .heatmap-grid { display: flex; gap: 4px; flex-wrap: wrap; }
  .heatmap-cell {
    width: 14px;
    height: 14px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0)),
      rgba(95, 208, 181, 0.85);
    border: 1px solid rgba(95, 208, 181, 0.16);
    border-radius: 2px;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }
  .heatmap-cell:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  .incident-badge { font-size: 10px; margin-left: 2px; }
  .context-facts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 8px;
  }
  .context-limit-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid var(--border-light);
    font-size: 12px;
  }
  .context-limit-label { color: var(--text-secondary); }
  .context-limit-value { color: var(--text-primary); font-weight: 600; }
  .context-breakdown-section { margin-top: 12px; }
  .context-bar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 12px;
  }
  .context-bar-label {
    width: 90px;
    color: var(--text-secondary);
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 10px;
    font-weight: 700;
  }
  .context-bar-track {
    flex: 1;
    height: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .context-bar-fill { height: 100%; border-radius: 2px; }
  .context-bar-value {
    width: 54px;
    text-align: right;
    color: var(--text-primary);
    font-weight: 600;
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
  }
  .context-warnings {
    margin-top: 12px;
    padding: 10px 12px;
    background:
      linear-gradient(180deg, rgba(234, 179, 8, 0.08), rgba(234, 179, 8, 0)),
      var(--warning-bg);
    border: 1px solid rgba(234, 179, 8, 0.24);
    border-radius: var(--radius-sm);
  }
  .context-warning-item { font-size: 12px; color: var(--warning-text); margin: 4px 0; }
  .eyebrow {
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.16em;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .cockpit-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.85fr);
    gap: 16px;
    padding: 18px;
    margin-bottom: 20px;
    background:
      radial-gradient(circle at top right, rgba(163, 255, 217, 0.14), transparent 34%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0)),
      var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-elevated);
  }
  .analytics-hero { margin-bottom: 16px; }
  .hero-copy h2,
  .chart-panel h2,
  .comparison-panel h2,
  .section-heading h2 {
    margin: 0;
    font-size: 21px;
    line-height: 1.05;
    text-transform: none;
    letter-spacing: -0.03em;
  }
  .hero-copy p,
  .chart-panel p,
  .comparison-panel p,
  .kpi-card p {
    margin: 10px 0 0;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.55;
  }
  .hero-metric-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }
  .hero-metric,
  .kpi-card,
  .chart-panel,
  .comparison-panel {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0)),
      var(--bg-panel-strong);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-elevated);
  }
  .hero-metric {
    padding: 12px;
    min-width: 0;
  }
  .hero-metric-label {
    display: block;
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 10px;
    font-weight: 700;
  }
  .hero-metric strong,
  .kpi-value,
  .hero-radar-value {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
    font-size: 28px;
    line-height: 1;
    display: block;
  }
  .hero-strip {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .signal-pill {
    display: inline-flex;
    align-items: center;
    padding: 5px 9px;
    border-radius: var(--radius-sm);
    background:
      linear-gradient(180deg, rgba(163, 255, 217, 0.08), rgba(163, 255, 217, 0)),
      var(--bg-panel-strong);
    border: 1px solid var(--border);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
    color: var(--text-secondary);
  }
  .hero-radar {
    padding: 14px;
    background:
      linear-gradient(180deg, rgba(163, 255, 217, 0.08), rgba(163, 255, 217, 0)),
      var(--bg-panel-strong);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .hero-panel-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--text-secondary);
    font-weight: 700;
    margin-bottom: 12px;
  }
  .hero-radar-label,
  .hero-radar-meta {
    font-size: 12px;
    color: var(--text-secondary);
  }
  .hero-radar-meta {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 10px;
  }
  .kpi-deck,
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  .analytics-grid-strong { grid-template-columns: 1.2fr 0.8fr; }
  .kpi-deck { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .kpi-card,
  .chart-panel,
  .comparison-panel {
    padding: 16px;
    min-width: 0;
  }
  .kpi-value {
    font-size: 30px;
    margin-bottom: 10px;
  }
  .mini-bars,
  .mini-chart-meta {
    display: flex;
    align-items: end;
    gap: 4px;
    height: 64px;
    margin-top: 10px;
  }
  .mini-bar {
    flex: 1;
    border-radius: 2px 2px 0 0;
    min-height: 10px;
    opacity: 0.95;
    background: var(--accent);
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
  }
  .comparison-panel,
  .chart-panel { height: 100%; }
  .section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .provider-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .provider-meter {
    padding: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
  }
  .provider-meter-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }
  .provider-meter-head strong {
    display: block;
    font-size: 13px;
    margin-bottom: 4px;
  }
  .provider-meter-head span,
  .provider-meter-values span {
    display: block;
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .provider-meter-values {
    text-align: right;
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
  }
  .provider-meter-track {
    height: 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .provider-meter-track span {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: var(--accent);
  }
  .terminal-feed {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .feed-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    text-decoration: none;
  }
  .feed-row:hover {
    border-color: var(--border-strong);
    background: var(--table-row-hover);
    text-decoration: none;
  }
  .feed-main strong {
    display: block;
    color: var(--text-primary);
    margin-bottom: 4px;
    font-size: 13px;
  }
  .feed-main span,
  .feed-meta span {
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .feed-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
  }
  .feed-status-ok { color: var(--success-text) !important; }
  .feed-status-warn { color: var(--warning-text) !important; }
  .feed-status-muted { color: var(--text-muted) !important; }
  .step-chart {
    width: 100%;
    height: 190px;
    display: block;
    margin-top: 14px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
      var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px;
  }
  .value-matrix {
    position: relative;
    min-height: 320px;
    margin-top: 14px;
    background:
      linear-gradient(to right, transparent 49.7%, var(--border) 49.7%, var(--border) 50.3%, transparent 50.3%),
      linear-gradient(to bottom, transparent 49.7%, var(--border) 49.7%, var(--border) 50.3%, transparent 50.3%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
      var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .matrix-point {
    position: absolute;
    transform: translate(-50%, -50%);
    border-radius: 9999px;
    opacity: 0.88;
    border: 2px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.06);
  }
  .matrix-axis {
    position: absolute;
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
  }
  .matrix-axis-y {
    left: 12px;
    top: 16px;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }
  .matrix-axis-x {
    right: 16px;
    bottom: 12px;
  }
  .matrix-quadrant-label {
    position: absolute;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-secondary);
    font-weight: 700;
  }
  .quadrant-a { left: 48px; top: 18px; }
  .quadrant-b { right: 18px; top: 18px; }
  .quadrant-c { left: 48px; bottom: 18px; }
  .quadrant-d { right: 18px; bottom: 18px; }
  .segmented-bar {
    display: flex;
    height: 18px;
    margin-top: 14px;
    border-radius: 2px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--bg-tertiary);
  }
  .segmented-bar span { display: block; height: 100%; }
  .segment-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }
  .segment-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    font-weight: 700;
  }
  .segment-legend i {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    display: inline-block;
  }
  .operational-band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 24px 28px;
    margin-bottom: 16px;
    background: var(--bg-tertiary);
    border-left: 4px solid var(--accent);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-elevated);
  }
  .operational-copy {
    display: grid;
    gap: 8px;
  }
  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 9999px;
    background: var(--accent);
    box-shadow: 0 0 18px rgba(163, 255, 217, 0.34);
  }
  .operational-copy h2 {
    font-size: clamp(28px, 4vw, 42px);
    margin: 0;
    line-height: 1;
    text-transform: none;
    letter-spacing: -0.02em;
  }
  .operational-copy p {
    margin: 0;
    max-width: 64ch;
    color: var(--text-secondary);
    font-size: 14px;
  }
  .operational-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 4px;
  }
  .operational-meta span,
  .signal-window-chip {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .signal-window-chips {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px;
    background: var(--bg-panel-strong);
    border: 1px solid var(--border);
    border-radius: 6px;
  }
  .signal-window-chip {
    padding: 10px 14px;
    color: var(--text-secondary);
    border-radius: 3px;
    text-decoration: none;
    font-weight: 700;
  }
  .signal-window-chip:hover { background: var(--accent-soft); text-decoration: none; }
  .signal-window-chip-active {
    background: var(--accent);
    color: #003828;
  }
  .kinetic-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }
  .kinetic-kpi-card,
  .kinetic-panel,
  .analytics-hero-main,
  .analytics-side-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-elevated);
  }
  .kinetic-kpi-card {
    padding: 18px;
    min-width: 0;
  }
  .kinetic-kpi-card-hatched {
    background:
      var(--hash-pattern),
      linear-gradient(180deg, rgba(176, 21, 34, 0.06), rgba(176, 21, 34, 0)),
      var(--bg-secondary);
  }
  .kinetic-kpi-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 12px;
  }
  .kinetic-kpi-head span,
  .kinetic-kpi-head b {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .kinetic-kpi-head span { color: var(--text-secondary); }
  .kinetic-kpi-head b { color: var(--accent); }
  .kinetic-kpi-value {
    font-family: "Space Grotesk", "Instrument Sans", sans-serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.06em;
    line-height: 0.95;
  }
  .kinetic-kpi-value small {
    margin-left: 6px;
    font-size: 12px;
    color: var(--text-secondary);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .line-meter {
    position: relative;
    width: 100%;
    height: 14px;
    margin-top: 18px;
    display: flex;
    align-items: center;
  }
  .line-meter::before {
    content: "";
    width: 100%;
    height: 2px;
    background: var(--border-strong);
  }
  .line-meter span {
    position: absolute;
    left: 0;
    top: 6px;
    height: 2px;
    background: var(--accent);
  }
  .line-meter span::after {
    content: "";
    position: absolute;
    right: -5px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: 9999px;
    background: var(--accent);
    border: 2px solid var(--bg-secondary);
    box-shadow: 0 0 10px rgba(163, 255, 217, 0.35);
  }
  .line-meter-critical span,
  .line-meter-critical span::after {
    background: var(--critical);
    box-shadow: none;
  }
  .capsule-grid {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 6px;
    align-items: end;
    height: 52px;
    margin-top: 16px;
  }
  .capsule-grid span {
    display: block;
    background: rgba(185, 200, 222, 0.32);
    border: 1px solid rgba(185, 200, 222, 0.16);
  }
  .fault-line {
    height: 52px;
    margin-top: 16px;
    display: grid;
    place-items: center;
  }
  .fault-line::before {
    content: "";
    width: 100%;
    border-top: 1px dashed var(--critical);
    opacity: 0.7;
  }
  .analytics-grid-featured {
    grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.9fr);
  }
  .analytics-grid-split {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .kinetic-panel {
    padding: 18px;
    min-width: 0;
    height: 100%;
  }
  .kinetic-panel-head {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 18px;
  }
  .kinetic-panel-head h2 {
    margin: 0;
    font-size: 22px;
    letter-spacing: -0.04em;
  }
  .kinetic-panel-head p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .legend-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  .legend-inline span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .legend-inline i {
    width: 14px;
    height: 2px;
    display: inline-block;
  }
  .legend-primary { background: var(--accent); }
  .legend-secondary { background: var(--secondary-signal); }
  .trend-mesh {
    width: 100%;
    height: 320px;
    display: block;
    color: var(--border-strong);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)), var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px;
  }
  .trend-subcharts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }
  .trend-subcharts span,
  .legend-floor span {
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .provider-integrity-list {
    display: grid;
    gap: 18px;
  }
  .provider-integrity-row {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    gap: 14px;
    align-items: center;
  }
  .provider-integrity-row span {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    letter-spacing: 0.08em;
  }
  .provider-integrity-bars {
    display: grid;
    gap: 6px;
  }
  .provider-integrity-output,
  .provider-integrity-cost {
    min-height: 12px;
  }
  .provider-integrity-output { background: var(--accent); }
  .provider-integrity-cost { background: var(--secondary-signal); min-height: 6px; }
  .integrity-footer {
    margin-top: 20px;
    font-size: 11px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .topology-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
  }
  .topology-cell {
    display: block;
    aspect-ratio: 1;
    background: rgba(163, 255, 217, 0.08);
    border: 1px solid rgba(163, 255, 217, 0.06);
  }
  .topology-cell-success { background: rgba(163, 255, 217, 0.78); }
  .topology-cell-muted { background: rgba(163, 255, 217, 0.32); }
  .topology-cell-critical { background: rgba(176, 21, 34, 0.54); }
  .topology-cell-hatched { background-image: var(--hash-pattern); }
  .topology-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .topology-stats strong {
    display: block;
    font-family: "Geist Mono", "JetBrains Mono", monospace;
    font-size: 18px;
  }
  .topology-stats span {
    display: block;
    margin-top: 4px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-secondary);
  }
  .signal-trace-cluster {
    display: grid;
    gap: 10px;
    margin-bottom: 14px;
  }
  .signal-trace-row { display: grid; gap: 6px; }
  .signal-trace-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-family: "Geist Mono", "JetBrains Mono", monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
  }
  .signal-trace-track {
    height: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
  }
  .signal-trace-track span {
    display: block;
    height: 100%;
  }
  .terminal-feed-tight .feed-row {
    border-radius: 0;
    background: transparent;
    border-left: 0;
    border-right: 0;
    padding-inline: 0;
  }
  .analytics-hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.8fr);
    gap: 16px;
    margin-bottom: 18px;
  }
  .analytics-hero-main {
    padding: 18px;
    position: relative;
    overflow: hidden;
  }
  .analytics-hero-main::before {
    content: "";
    position: absolute;
    inset: -80px -100px auto auto;
    width: 220px;
    height: 220px;
    background: rgba(163, 255, 217, 0.08);
    filter: blur(80px);
  }
  .analytics-hero-main label,
  .analytics-side-card label {
    display: block;
    font-size: 10px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-weight: 700;
  }
  .analytics-hero-value {
    margin-top: 10px;
    font-family: "Space Grotesk", "Instrument Sans", sans-serif;
    font-size: clamp(44px, 7vw, 68px);
    font-weight: 800;
    line-height: 0.92;
    letter-spacing: -0.06em;
  }
  .analytics-hero-value span {
    font-size: 20px;
    margin-left: 8px;
    color: var(--accent);
  }
  .analytics-hero-delta {
    margin-top: 8px;
    font-size: 11px;
    color: var(--accent);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .analytics-hero-side {
    display: grid;
    gap: 16px;
  }
  .analytics-side-card {
    padding: 16px;
    border-left: 2px solid var(--accent);
  }
  .analytics-side-card-critical { border-left-color: var(--critical); }
  .analytics-side-card strong {
    display: block;
    margin-top: 8px;
    font-family: "Space Grotesk", "Instrument Sans", sans-serif;
    font-size: 26px;
    letter-spacing: -0.04em;
  }
  .provider-integrity-list-large .provider-integrity-row {
    grid-template-columns: 120px minmax(0, 1fr);
  }
  .asset-volatility-row {
    display: grid;
    gap: 10px;
    padding: 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    margin-bottom: 10px;
  }
  .asset-volatility-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }
  .asset-volatility-meta strong {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .asset-volatility-meta span,
  .asset-volatility-meta b {
    font-family: "Geist Mono", "JetBrains Mono", monospace;
    font-size: 11px;
  }
  .asset-delta-positive { color: var(--accent); }
  .asset-delta-negative { color: var(--critical-text); }
  .asset-volatility-bars {
    display: flex;
    align-items: end;
    gap: 3px;
    height: 34px;
  }
  .asset-volatility-bars span {
    flex: 1;
    background: rgba(163, 255, 217, 0.22);
  }
  .legend-floor {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
  }
  .legend-scale {
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .legend-step {
    width: 10px;
    height: 10px;
    display: inline-block;
    background: rgba(163, 255, 217, 0.12);
  }
  .legend-step-1 { background: rgba(163, 255, 217, 0.12); }
  .legend-step-2 { background: rgba(163, 255, 217, 0.32); }
  .legend-step-3 { background: rgba(163, 255, 217, 0.58); }
  .legend-step-4 { background: rgba(163, 255, 217, 0.92); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  @media (prefers-contrast: more) {
    :root {
      --border: #000000;
      --border-strong: #000000;
      --text-secondary: #1a1a1a;
      --text-muted: #333333;
    }
    .section, .stat-card, .kinetic-panel, .kinetic-kpi-card {
      border-width: 2px;
    }
  }
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--accent);
    color: #003828;
    padding: 8px 16px;
    z-index: 1000;
    font-size: 12px;
    text-decoration: none;
    border-radius: 0 0 var(--radius-sm) 0;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
  }
  .skip-link:focus { top: 0; }
  @media print {
    .nav, .theme-toggle, .refresh-indicator, .btn-primary, .btn-secondary, .filter-form, .window-controls { display: none !important; }
    body { max-width: none; background: #fff; color: #000; }
    .section, .stat-card { break-inside: avoid; border: 1px solid #ccc; box-shadow: none; background: #fff; }
  }
  @media (max-width: 900px) {
    .cockpit-hero,
    .analytics-grid,
    .analytics-grid-strong,
    .kpi-deck,
    .kinetic-kpi-grid,
    .analytics-hero-grid,
    .analytics-grid-featured,
    .analytics-grid-split {
      grid-template-columns: 1fr;
    }
    .operational-band {
      flex-direction: column;
      align-items: flex-start;
    }
    .window-controls {
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    .window-hint { width: 100%; margin-left: 0; }
  }
  @media (max-width: 720px) {
    body { padding: 0 14px 20px; }
    h1 { font-size: clamp(22px, 4vw, 32px); }
    .kinetic-kpi-value { font-size: 28px; }
    .kinetic-panel-head h2 { font-size: 18px; }
    .stat-value { font-size: 24px; }
    .operational-copy h2 { font-size: clamp(24px, 5vw, 32px); }
    .nav {
      margin: 0 -14px 20px;
      grid-template-columns: 1fr;
      justify-items: stretch;
    }
    .nav-brand, .nav-links, .nav-actions { justify-self: stretch; }
    .nav-links { justify-content: flex-start; flex-wrap: wrap; }
    .nav-actions {
      justify-content: space-between;
      min-width: 0;
    }
    .signal-window-chips,
    .trend-subcharts,
    .topology-stats {
      width: 100%;
      grid-template-columns: 1fr;
    }
    .refresh-indicator {
      min-width: 0;
      justify-content: flex-start;
    }
    .detail-grid { grid-template-columns: 1fr; }
    .hero-metric-row { grid-template-columns: 1fr; }
    .feed-row { grid-template-columns: 1fr; }
    .feed-meta { flex-wrap: wrap; }
  }
`;

export const MENUBAR_STYLES = `
  :root {
    --mb-bg: #0b1326;
    --mb-text: #dae2fd;
    --mb-text-secondary: #bac9cc;
    --mb-text-muted: #849396;
    --mb-border: #1b2438;
    --mb-border-color: #2d3449;
    --mb-bg-secondary: #171f33;
    --mb-bg-tertiary: #131b2e;
    --mb-surface-strong: #222a3d;
    --mb-success: #36ffc4;
    --mb-warning: #b9c8de;
    --mb-critical: #ef4444;
    --mb-success-bg: rgba(54, 255, 196, 0.12);
    --mb-success-text: #a3ffd9;
    --mb-warning-bg: rgba(185, 200, 222, 0.14);
    --mb-warning-text: #d5e4fb;
    --mb-critical-bg: rgba(239, 68, 68, 0.12);
    --mb-critical-text: #ffc1bd;
    --mb-accent: #a3ffd9;
    --mb-accent-hover: #36ffc4;
    --mb-accent-soft: rgba(163, 255, 217, 0.12);
    --mb-radius-sm: 3px;
    --mb-radius-md: 4px;
    --mb-transition: 0.15s ease;
    --mb-shadow: 0 18px 42px rgba(20, 20, 20, 0.12);
    --mb-hash-pattern: repeating-linear-gradient(
      -45deg,
      rgba(107, 114, 128, 0.18) 0,
      rgba(107, 114, 128, 0.18) 5px,
      rgba(107, 114, 128, 0) 5px,
      rgba(107, 114, 128, 0) 10px
    );
  }
  [data-theme="light"] {
    --mb-bg: #eef2fb;
    --mb-text: #162031;
    --mb-text-secondary: #4e6078;
    --mb-text-muted: #6e7f96;
    --mb-border: #e3ebf7;
    --mb-border-color: #d5e4fb;
    --mb-bg-secondary: #ffffff;
    --mb-bg-tertiary: #f6f9ff;
    --mb-surface-strong: #ffffff;
    --mb-success-bg: rgba(0, 108, 80, 0.1);
    --mb-success-text: #00664b;
    --mb-warning-bg: rgba(60, 74, 93, 0.12);
    --mb-warning-text: #233143;
    --mb-critical-bg: rgba(176, 21, 34, 0.12);
    --mb-critical-text: #930015;
    --mb-accent: #006c50;
    --mb-accent-hover: #00a77a;
    --mb-accent-soft: rgba(0, 108, 80, 0.1);
    --mb-shadow: 0 18px 42px rgba(20, 20, 20, 0.12);
  }
  * { box-sizing: border-box; }
  body {
    font-family: "Instrument Sans", "Geist Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    width: 340px;
    margin: 0;
    padding: 0;
    color: var(--mb-text);
    background:
      radial-gradient(circle at top right, rgba(163, 255, 217, 0.12), transparent 34%),
      var(--mb-bg);
    font-size: 12px;
    line-height: 1.35;
    overflow-x: hidden;
    letter-spacing: -0.01em;
  }
  .mb-header,
  .mb-hero,
  .mb-section,
  .mb-actions {
    position: relative;
  }
  .mb-header,
  .mb-section,
  .mb-actions {
    border-bottom: 1px solid var(--mb-border);
  }
  .mb-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 12px 10px;
    background: rgba(255, 255, 255, 0.02);
  }
  .mb-health-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
  }
  .mb-health-dot-healthy { background: var(--mb-success); }
  .mb-health-dot-warn { background: var(--mb-warning); }
  .mb-health-dot-critical { background: var(--mb-critical); }
  .mb-title {
    font-size: 11px;
    font-weight: 700;
    flex: 1;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }
  .mb-title .brand-lockup {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .mb-title .brand-mark {
    width: 14px;
    height: 14px;
    color: var(--mb-accent);
    flex-shrink: 0;
  }
  .mb-title .brand-wordmark {
    display: inline-block;
    color: var(--mb-accent);
    font-size: 11px;
    font-style: italic;
    font-weight: 800;
    letter-spacing: -0.04em;
    text-transform: uppercase;
  }
  .mb-mode-toggle {
    font-size: 12px;
    cursor: pointer;
    padding: 2px 4px;
    color: var(--mb-text-muted);
    transition: color var(--mb-transition);
  }
  .mb-mode-toggle:hover { color: var(--mb-text); }
  .mb-hero {
    padding: 14px 12px 12px;
    border-top: 1px solid rgba(163, 255, 217, 0.08);
  }
  .mb-hero::before,
  .mb-section::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(163, 255, 217, 0.08), transparent 42%);
  }
  .mb-hero-cost,
  .mb-provider-cost,
  .mb-provider-reset,
  .mb-outcome-count,
  .mb-team-rank {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
  }
  .mb-hero-cost {
    font-size: 28px;
    line-height: 0.94;
    font-weight: 700;
    color: var(--mb-text);
  }
  .mb-hero-period {
    font-size: 10px;
    color: var(--mb-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }
  .mb-hero-meta {
    display: flex;
    gap: 10px;
    margin-top: 6px;
    font-size: 10px;
    color: var(--mb-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .mb-mini-bars {
    display: flex;
    align-items: end;
    gap: 4px;
    height: 46px;
    margin-top: 10px;
    padding: 8px;
    background: var(--mb-bg-tertiary);
    border: 1px solid var(--mb-border);
    border-radius: 2px;
  }
  .mb-mini-bar {
    flex: 1;
    min-height: 8px;
    border-radius: 2px 2px 0 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0)), var(--mb-accent);
  }
  .mb-effectiveness,
  .mb-context-signal,
  .mb-active-surface {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    margin-right: 6px;
    padding: 4px 8px;
    border-radius: var(--mb-radius-sm);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    border: 1px solid transparent;
  }
  .mb-effectiveness-efficient { background: var(--mb-success-bg); color: var(--mb-success-text); border-color: rgba(16, 185, 129, 0.22); }
  .mb-effectiveness-mixed { background: var(--mb-warning-bg); color: var(--mb-warning-text); border-color: rgba(234, 179, 8, 0.22); }
  .mb-effectiveness-waste-heavy { background: var(--mb-critical-bg); color: var(--mb-critical-text); border-color: rgba(239, 68, 68, 0.22); }
  .mb-context-signal,
  .mb-active-surface {
    background: var(--mb-bg-tertiary);
    color: var(--mb-text-secondary);
    border-color: var(--mb-border-color);
  }
  .mb-active-surface-strong {
    background: var(--mb-success-bg);
    color: var(--mb-success-text);
    border-color: rgba(16, 185, 129, 0.22);
  }
  .mb-active-surface-fallback {
    background:
      var(--mb-hash-pattern),
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
      var(--mb-bg-tertiary);
    color: var(--mb-warning-text);
    border-color: rgba(234, 179, 8, 0.26);
  }
  .mb-section {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.01);
  }
  .mb-section-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--mb-text-muted);
    margin-bottom: 8px;
  }
  .mb-provider-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .mb-provider-bar-name {
    width: 58px;
    font-size: 10px;
    font-weight: 700;
    color: var(--mb-text);
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .mb-provider-bar-track {
    flex: 1;
    height: 8px;
    background: var(--mb-bg-tertiary);
    border: 1px solid var(--mb-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .mb-provider-bar-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, rgba(163, 255, 217, 0.68), var(--mb-accent));
    transition: width var(--mb-transition);
  }
  .mb-provider-bar-cost {
    width: 58px;
    text-align: right;
    font-size: 10px;
    font-weight: 600;
    color: var(--mb-text);
    flex-shrink: 0;
  }
  .mb-outcome-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
    font-size: 10px;
  }
  .mb-outcome-label {
    width: 58px;
    color: var(--mb-text-secondary);
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .mb-outcome-bar {
    flex: 1;
    height: 6px;
    background: var(--mb-bg-tertiary);
    border: 1px solid var(--mb-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .mb-outcome-fill { height: 100%; border-radius: 2px; transition: width var(--mb-transition); }
  .mb-outcome-fill-success { background: var(--mb-success); }
  .mb-outcome-fill-mixed { background: var(--mb-warning); }
  .mb-outcome-fill-waste { background: var(--mb-critical); }
  .mb-outcome-count {
    width: 20px;
    text-align: right;
    color: var(--mb-text);
    font-weight: 600;
    flex-shrink: 0;
  }
  .mb-efficiency-summary {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    font-size: 10px;
    color: var(--mb-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .mb-efficiency-summary span { display: flex; align-items: center; gap: 4px; }
  .mb-provider-row {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 0;
    font-size: 10px;
  }
  .mb-provider-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .mb-provider-dot-healthy { background: var(--mb-success); }
  .mb-provider-dot-warn { background: var(--mb-warning); }
  .mb-provider-dot-critical { background: var(--mb-critical); }
  .mb-provider-name {
    flex: 1;
    color: var(--mb-text);
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .mb-provider-cost { font-weight: 600; color: var(--mb-text); white-space: nowrap; font-size: 10px; }
  .mb-provider-reset { color: var(--mb-text-muted); font-size: 9px; white-space: nowrap; }
  .mb-reset-bar {
    margin: 2px 0 5px 11px;
    height: 4px;
    background: var(--mb-bg-tertiary);
    border: 1px solid var(--mb-border);
    border-radius: 2px;
    overflow: hidden;
  }
  .mb-reset-bar-fill { height: 100%; border-radius: 2px; transition: width var(--mb-transition); }
  .mb-reset-bar-healthy { background: var(--mb-success); }
  .mb-reset-bar-warn { background: var(--mb-warning); }
  .mb-reset-bar-critical { background: var(--mb-critical); }
  .mb-recent-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    padding: 3px 0;
    font-size: 10px;
  }
  .mb-recent-title {
    color: var(--mb-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    flex: 1;
  }
  .mb-recent-cost { color: var(--mb-text-secondary); font-size: 9px; white-space: nowrap; }
  .mb-recent-time {
    color: var(--mb-text-muted);
    font-size: 9px;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .mb-team-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    padding: 2px 0;
  }
  .mb-team-rank { font-weight: 700; color: var(--mb-accent); width: 24px; }
  .mb-team-label {
    color: var(--mb-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .mb-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding: 10px 12px 12px;
  }
  .mb-action-btn {
    display: block;
    text-align: center;
    padding: 8px 8px;
    background: var(--mb-bg-secondary);
    border: 1px solid var(--mb-border-color);
    border-radius: var(--mb-radius-md);
    color: var(--mb-text);
    text-decoration: none;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    transition: background var(--mb-transition), border-color var(--mb-transition), color var(--mb-transition);
  }
  .mb-action-btn:hover {
    background: var(--mb-accent-soft);
    border-color: rgba(163, 255, 217, 0.28);
    text-decoration: none;
  }
  .mb-action-btn:focus-visible { outline: 2px solid var(--mb-accent); outline-offset: 2px; }
  .mb-action-btn-primary {
    background: var(--mb-accent);
    color: #003828;
    border-color: rgba(163, 255, 217, 0.44);
  }
  .mb-action-btn-primary:hover { background: var(--mb-accent-hover); }
  .mb-empty {
    padding: 28px 12px;
    text-align: center;
    color: var(--mb-text-muted);
    font-size: 12px;
  }
  .mb-empty-icon { font-size: 24px; margin-bottom: 8px; }
`;
