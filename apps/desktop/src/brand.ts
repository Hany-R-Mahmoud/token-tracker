export function buildBrandMarkSvg(className = 'brand-mark', title = 'Token Tracker'): string {
  return `<svg class="${className}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <title>${title}</title>
    <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M32 8 52 28 32 48 12 28 32 8Z"></path>
      <path d="M20 24H44"></path>
      <path d="M17 32H47"></path>
      <path d="M24 40H40"></path>
    </g>
  </svg>`;
}

export function buildBrandLockup(label = 'Token Tracker', compact = false): string {
  return `<span class="brand-lockup${compact ? ' brand-lockup-compact' : ''}">
    ${buildBrandMarkSvg(compact ? 'brand-mark brand-mark-compact' : 'brand-mark', label)}
    <span class="brand-wordmark">${label}</span>
  </span>`;
}
