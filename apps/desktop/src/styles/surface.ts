export const SURFACE_SECTIONS = `
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
  .stats-row,
  .analytics-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-bottom: 24px;
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
  .detail-tokens { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 6px 12px; }
  .detail-token-item { font-size: 13px; }
  .detail-token-label { color: var(--text-secondary); }
  .unpriced-text { color: var(--warning-text); font-size: 10px; margin-left: 4px; }
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
  .operational-meta span {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
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
    .detail-grid { grid-template-columns: 1fr; }
    .hero-metric-row { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    body { padding: 0 14px 20px; }
    h1 { font-size: clamp(22px, 4vw, 32px); }
    .stat-value { font-size: 24px; }
    .operational-copy h2 { font-size: clamp(24px, 5vw, 32px); }
  }
`;