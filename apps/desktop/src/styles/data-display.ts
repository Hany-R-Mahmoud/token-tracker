export const DATA_DISPLAY = `
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
  .chart-bar span:last-child {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
  }
  .menubar-label { color: var(--text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; }
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
  .hero-metric-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }
  .hero-metric {
    padding: 12px;
    min-width: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0)),
      var(--bg-panel-strong);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-elevated);
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
  .hero-metric strong {
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
  .hero-radar-value {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
    font-size: 28px;
    line-height: 1;
    display: block;
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
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0)),
      var(--bg-panel-strong);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-elevated);
  }
  .kpi-value {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
    font-size: 30px;
    margin-bottom: 10px;
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
`;