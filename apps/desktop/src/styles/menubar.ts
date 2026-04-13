export const MENUBAR_TOKENS = `
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
`;

export const MENUBAR_BASE = `
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
  .mb-hero-cost,
  .mb-provider-cost,
  .mb-provider-reset,
  .mb-outcome-count,
  .mb-team-rank {
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
    font-variant-numeric: tabular-nums;
  }
`;

export const MENUBAR_LAYOUT = `
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
`;

export const MENUBAR_SURFACE = `
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
  }
  .mb-provider-bar-fill {
    height: 100%;
    background: var(--mb-accent);
    border-radius: 2px;
  }
  .mb-provider-cost {
    font-size: 10px;
    color: var(--mb-text);
    font-weight: 700;
  }
  .mb-provider-reset {
    font-size: 10px;
    color: var(--mb-text-muted);
  }
  .mb-team-rank-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--mb-border);
  }
  .mb-team-rank-row {
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