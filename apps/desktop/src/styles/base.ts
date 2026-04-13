export const BASE = `
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
  .pricing-warn { color: var(--warning-text); font-size: 11px; }
  .reset-cell { font-size: 11px; color: var(--text-secondary); }
  .empty { color: var(--text-secondary); font-size: 13px; text-align: center; }
  .error { color: var(--critical); }
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
  .tooltip {
    position: relative;
    display: inline-block;
    cursor: help;
  }
  .tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 12px;
    background: var(--bg-panel-strong);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    font-size: 11px;
    color: var(--text-primary);
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--transition-fast), visibility var(--transition-fast);
    z-index: 100;
    box-shadow: var(--shadow-elevated);
    pointer-events: none;
  }
  .tooltip:hover::after {
    opacity: 1;
    visibility: visible;
  }
  .tooltip-wide::after {
    white-space: normal;
    max-width: 220px;
    text-align: left;
  }
  .tooltip-top::after {
    bottom: auto;
    top: calc(100% + 8px);
  }
  .analytics-hero-main .tooltip::after {
    background: var(--bg-secondary);
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
  @media print {
    .nav, .theme-toggle, .refresh-indicator, .btn-primary, .btn-secondary, .filter-form, .window-controls { display: none !important; }
    body { max-width: none; background: #fff; color: #000; }
    .section, .stat-card { break-inside: avoid; border: 1px solid #ccc; box-shadow: none; background: #fff; }
  }
`;