export const LAYOUT_NAV = `
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
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-family: "Geist Mono", "JetBrains Mono", "SFMono-Regular", monospace;
  }
  .signal-window-chip:hover { background: var(--accent-soft); text-decoration: none; }
  .signal-window-chip-active {
    background: var(--accent);
    color: #003828;
  }
  @media (max-width: 900px) {
    .window-controls {
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    .window-hint { width: 100%; margin-left: 0; }
  }
  @media (max-width: 720px) {
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
    .signal-window-chips {
      width: 100%;
      flex-wrap: wrap;
    }
    .refresh-indicator {
      min-width: 0;
      justify-content: flex-start;
    }
  }
`;