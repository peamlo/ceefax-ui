import { expect } from '@storybook/test';
import { CEEFAX_PALETTE } from '../src/tokens/palette.js';

// A contract story with no visual of its own: it exists so the palette-drift guard
// runs on the CI test surface. The JS mirror (src/tokens/palette.js) must stay in
// sync with the CSS tokens (src/tokens/colors.css) — this fails the build if the
// hand-synced pair diverges. Kept in its own file (not on Foundations/Colors) so the
// CI run can include it without the heavier Colors swatch stories.
const css = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export default { title: 'Foundations/Palette drift' };

export const Guard = {
  render: () => {
    const p = document.createElement('p');
    p.style.cssText = 'color:#fff;font-family:Space Mono,monospace;font-size:14px';
    p.textContent = 'palette.js is asserted equal to the --ceefax-* tokens (see play()).';
    return p;
  },
  play: async () => {
    for (const { name, hex } of CEEFAX_PALETTE) {
      await expect(css('--ceefax-' + name).toLowerCase()).toBe(hex.toLowerCase());
    }
  },
};
