export const UTILITIES = `
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
`;