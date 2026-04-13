import { TTM_PRIVACY_POLICY } from "@ttm/core";
import type { GitHubUser, Membership } from "../routes.js";

export const STYLES = `
  * { box-sizing: border-box; }
  :root {
    --bg: #0b1326;
    --bg-panel: #171f33;
    --bg-panel-strong: #131b2e;
    --text: #dae2fd;
    --text-secondary: #bac9cc;
    --text-muted: #849396;
    --border: #2d3449;
    --border-strong: #3b494c;
    --accent: #a3ffd9;
    --accent-strong: #36ffc4;
    --accent-soft: rgba(163, 255, 217, 0.12);
    --critical: #b01522;
    --critical-soft: rgba(176, 21, 34, 0.14);
    --success-soft: rgba(54, 255, 196, 0.12);
  }
  body {
    font-family: "Manrope", "Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif;
    max-width: 1060px;
    margin: 0 auto;
    padding: 0 18px 32px;
    color: var(--text);
    background:
      radial-gradient(circle at top right, rgba(163, 255, 217, 0.08), transparent 32%),
      var(--bg);
  }
  .nav {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(6, 14, 32, 0.92);
    backdrop-filter: blur(18px);
    padding: 12px 18px;
    margin: 0 -18px 28px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .nav-brand { margin-right: auto; }
  .brand-lockup { display: inline-flex; align-items: center; gap: 10px; }
  .brand-mark { width: 18px; height: 18px; color: var(--accent); flex-shrink: 0; }
  .brand-wordmark { color: var(--accent); font-family: "Space Grotesk", "Instrument Sans", sans-serif; font-style: italic; font-weight: 800; letter-spacing: -0.04em; text-transform: uppercase; }
  .nav a { color: var(--text-muted); text-decoration: none; font-size: 11px; padding: 6px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 700; }
  .nav a:hover, .nav a.active { color: var(--text); background: var(--accent-soft); }
  h1 { margin: 0 0 6px; font-family: "Space Grotesk", "Instrument Sans", sans-serif; font-size: clamp(28px, 5vw, 44px); line-height: 0.95; letter-spacing: -0.05em; text-transform: uppercase; }
  .subtitle { color: var(--text-secondary); margin-bottom: 22px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; }
  .card {
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 18px;
    margin-bottom: 16px;
  }
  .card h2 { font-family: "Space Grotesk", "Instrument Sans", sans-serif; font-size: 16px; font-weight: 700; margin: 0 0 14px; letter-spacing: -0.03em; }
  .btn { display: inline-block; padding: 9px 16px; background: var(--accent); color: #003828; border: 1px solid rgba(163,255,217,0.3); border-radius: 4px; font-size: 11px; cursor: pointer; text-decoration: none; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; }
  .btn:hover { background: var(--accent-strong); text-decoration: none; }
  .btn-secondary { background: var(--accent-soft); color: var(--text); }
  .btn-secondary:hover { background: rgba(163,255,217,0.2); }
  .btn-danger { background: var(--critical-soft); color: #ffc1bd; border-color: rgba(176,21,34,0.32); }
  .btn-danger:hover { background: rgba(176,21,34,0.22); }
  .opt-in-card { border-left: 3px solid var(--accent); }
  .opt-out-card { border-left: 3px solid var(--critical); }
  .privacy-list { margin: 8px 0; padding-left: 20px; font-size: 13px; color: var(--text-secondary); }
  .privacy-list li { margin-bottom: 4px; }
  .status-badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
  .status-connected, .status-opted-in { background: var(--success-soft); color: var(--accent); }
  .status-disconnected { background: rgba(185, 200, 222, 0.14); color: var(--text-secondary); }
  .status-opted-out { background: var(--critical-soft); color: #ffc1bd; }
  .empty { color: var(--text-secondary); font-size: 13px; text-align: center; padding: 24px 0; }
  .error { color: #ffc1bd; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid rgba(59,73,76,0.4); font-size: 13px; }
  th { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; background: var(--bg-panel-strong); }
  .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(59,73,76,0.4); }
  .detail-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.12em; }
  .detail-value { font-size: 13px; font-weight: 600; color: var(--text); }
  .drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 100; display: none; }
  .drawer-overlay.open { display: block; }
  .drawer-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 360px; max-width: 90vw; background: var(--bg-panel); box-shadow: -4px 0 20px rgba(0,0,0,0.24); z-index: 101; padding: 24px; overflow-y: auto; display: none; border-left: 1px solid var(--border); }
  .drawer-panel.open { display: block; }
  .drawer-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-secondary); }
  .drawer-close:hover { color: var(--text); }
  .leaderboard-row { cursor: pointer; }
  .leaderboard-row:hover { background: rgba(163,255,217,0.06); }
  .leaderboard-row:focus { outline: 2px solid var(--accent); outline-offset: -2px; }
  code, pre { font-family: "Geist Mono", "JetBrains Mono", monospace; font-variant-numeric: tabular-nums; }
`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/`/g, "&#x60;");
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function encodeMemberPayload(value: object): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

export function buildBrandLockup(label = "Token Tracker"): string {
  return `<span class="brand-lockup">
    <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M32 8 52 28 32 48 12 28 32 8Z"></path>
        <path d="M20 24H44"></path>
        <path d="M17 32H47"></path>
        <path d="M24 40H40"></path>
      </g>
    </svg>
    <span class="brand-wordmark">${escapeHtml(label)}</span>
  </span>`;
}

export function buildWebNav(active: "home" | "settings" | "leaderboard"): string {
  return `<nav class="nav">
    <span class="nav-brand">${buildBrandLockup("Token Tracker")}</span>
    <a href="/"${active === "home" ? ' class="active"' : ""}>Home</a>
    <a href="/settings"${active === "settings" ? ' class="active"' : ""}>Settings</a>
    <a href="/leaderboard"${active === "leaderboard" ? ' class="active"' : ""}>Leaderboard</a>
  </nav>`;
}

export function renderStatusBadge(status: "connected" | "opted-in" | "disconnected" | "opted-out"): string {
  const className = `status-badge status-${status}`;
  const label = {
    connected: "Connected",
    "opted-in": "Opted In",
    disconnected: "Disconnected",
    "opted-out": "Opted Out",
  }[status];
  return `<span class="${className}">${label}</span>`;
}

export function buildPrivacyPolicyCard(): string {
  return `<div class="card">
    <h2>Privacy Policy</h2>
    <p style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">Version ${escapeHtml(TTM_PRIVACY_POLICY.version)}</p>
    <h3 style="font-size:13px;font-weight:600;margin:8px 0 4px">What is shared when you opt in:</h3>
    <ul class="privacy-list">${TTM_PRIVACY_POLICY.sharedData.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3 style="font-size:13px;font-weight:600;margin:8px 0 4px">What is NEVER shared:</h3>
    <ul class="privacy-list">${TTM_PRIVACY_POLICY.neverSharedData.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <p style="font-size:12px;color:var(--text-secondary);margin-top:8px">Admins cannot override your visibility choice.</p>
  </div>`;
}

export function wrapWithDoctype(html: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Token Tracker — Team Leaderboard</title><style>${STYLES}</style></head>
<body>
${html}
</body></html>`;
}

export function buildLeaderboardDrawerScript(): string {
  return `
  <div class="drawer-overlay" id="drawer-overlay" onclick="closeDrawer()"></div>
  <div class="drawer-panel" id="drawer-panel" role="dialog" aria-modal="true" aria-label="Member detail">
    <button class="drawer-close" onclick="closeDrawer()" aria-label="Close drawer">&times;</button>
    <h2 id="drawer-title" style="margin-bottom:16px"></h2>
    <div id="drawer-content"></div>
  </div>
  <script>
    (function() {
      var overlay = document.getElementById('drawer-overlay');
      var panel = document.getElementById('drawer-panel');
      var title = document.getElementById('drawer-title');
      var content = document.getElementById('drawer-content');

      function decodeMemberPayload(encoded) {
        var binary = window.atob(encoded);
        var bytes = Uint8Array.from(binary, function(char) {
          return char.charCodeAt(0);
        });
        return JSON.parse(new TextDecoder().decode(bytes));
      }

      function openDrawer(data) {
        title.textContent = data.displayName;
        while (content.firstChild) content.removeChild(content.firstChild);
        var rows = [
          { label: 'Username', value: '@' + data.username },
          { label: 'Efficiency Score', value: data.efficiencyScore.toFixed(0) },
          { label: 'Sessions', value: String(data.sessionCount) },
          { label: 'Total Tokens', value: formatNum(data.totalTokens) },
          { label: 'Total Cost', value: '$' + data.totalCostUsd.toFixed(2) },
          { label: 'Cache Hit Rate', value: data.averageCacheHitRate !== null ? (data.averageCacheHitRate * 100).toFixed(0) + '%' : '\\u2014' },
          { label: 'Outcome Success Rate', value: data.outcomeSuccessRate !== null ? (data.outcomeSuccessRate * 100).toFixed(0) + '%' : '\\u2014' },
          { label: 'Period', value: data.period + ' (' + data.windowDays + ' days)' },
        ];
        rows.forEach(function(r) {
          var row = document.createElement('div');
          row.className = 'detail-row';
          var label = document.createElement('span');
          label.className = 'detail-label';
          label.textContent = r.label;
          var value = document.createElement('span');
          value.className = 'detail-value';
          value.textContent = r.value;
          row.appendChild(label);
          row.appendChild(value);
          content.appendChild(row);
        });
        overlay.classList.add('open');
        panel.classList.add('open');
        panel.querySelector('.drawer-close').focus();
      }

      window.closeDrawer = function() {
        overlay.classList.remove('open');
        panel.classList.remove('open');
      };

      window.formatNum = function(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return String(n);
      };

      document.querySelectorAll('.leaderboard-row').forEach(function(row) {
        row.addEventListener('click', function() {
          var data = decodeMemberPayload(this.getAttribute('data-member-b64'));
          openDrawer(data);
        });
        row.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var data = decodeMemberPayload(this.getAttribute('data-member-b64'));
            openDrawer(data);
          }
        });
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
          closeDrawer();
        }
      });
    })();
  </script>`;
}