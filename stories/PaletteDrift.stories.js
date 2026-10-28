import { expect } from 'storybook/test';
import { CEEFAX_PALETTE } from '../src/tokens/palette.js';

// A contract story with no component of its own: it exists so the palette-drift guard
// runs on the CI test surface. The JS mirror (src/tokens/palette.js) must stay in
// sync with the CSS tokens (src/tokens/colors.css) — this fails the build if the
// hand-synced pair diverges. Kept in its own file (not on Foundations/Colors) so the
// CI run can include it without the heavier Colors swatch stories.
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Compare colours, not strings: the CSS minifier may rewrite #000000 as #000 or #ff0000
// as red. The browser resolves either spelling to the same rgb() on a probe element.
const rgb = (value) => {
  const probe = document.createElement('i');
  probe.style.color = value;
  document.body.append(probe);
  const out = getComputedStyle(probe).color;
  probe.remove();
  return out;
};

// [token, palette.js hex, live CSS value, in sync?] — read at call time, since the
// CSS side only exists once the stylesheet is applied.
const compare = () =>
  CEEFAX_PALETTE.map(({ name, hex }) => {
    const token = '--cf-base-' + name;
    const live = css(token);
    return { token, hex, live, ok: live !== '' && rgb(live) === rgb(hex) };
  });

export default { title: 'Foundations/Palette drift' };

// The canvas shows the live result of the same comparison play() asserts — never a
// static claim.
export const Guard = {
  render: () => {
    const rows = compare();
    const drift = rows.filter((r) => !r.ok).length;
    const el = document.createElement('div');
    el.style.cssText = 'background:#000;padding:1em;color:#fff;font-family:Space Mono,monospace;font-size:14px';
    const status = document.createElement('p');
    status.style.color = drift ? '#f00' : '#0f0';
    status.textContent = drift
      ? `FAIL — ${drift} colour(s) differ between palette.js and the --cf-base-* tokens:`
      : `PASS — all ${rows.length} palette.js colours match the --cf-base-* tokens`;
    const list = document.createElement('ul');
    for (const { token, hex, live, ok } of rows) {
      const li = document.createElement('li');
      li.textContent = ok ? `${token} ${hex} ✓` : `${token}: palette.js ${hex} ≠ CSS ${live || '(unset)'} ✗`;
      list.append(li);
    }
    el.append(status, list);
    return el;
  },
  play: async () => {
    for (const { token, hex, live } of compare()) {
      await expect({ token, live: live && rgb(live) }).toEqual({ token, live: rgb(hex) });
    }
  },
};
