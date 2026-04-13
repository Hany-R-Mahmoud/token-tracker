import { TOKENS } from './tokens.js';
import { BASE } from './base.js';
import { LAYOUT_NAV } from './layout.js';
import { SURFACE_SECTIONS } from './surface.js';
import { DATA_DISPLAY } from './data-display.js';
import { UTILITIES } from './utilities.js';
import {
  MENUBAR_TOKENS,
  MENUBAR_BASE,
  MENUBAR_LAYOUT,
  MENUBAR_SURFACE
} from './menubar.js';

export const PAGE_STYLES = `
${TOKENS}
${BASE}
${LAYOUT_NAV}
${SURFACE_SECTIONS}
${DATA_DISPLAY}
${UTILITIES}
`;

export const MENUBAR_STYLES = `
${MENUBAR_TOKENS}
${MENUBAR_BASE}
${MENUBAR_LAYOUT}
${MENUBAR_SURFACE}
`;

export { TOKENS, BASE, LAYOUT_NAV, SURFACE_SECTIONS, DATA_DISPLAY, UTILITIES };
export { MENUBAR_TOKENS, MENUBAR_BASE, MENUBAR_LAYOUT, MENUBAR_SURFACE };