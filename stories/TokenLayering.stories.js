import { expect } from '@storybook/test';

// A contract story with no visual of its own: it pins the token layering rule — component
// and layout stylesheets reference only `--cf-*` semantic aliases, never the `--cf-base-*`
// authentic colours (those reach components only through the variant seam in base.css).
// It reads stylesheet SOURCE because the rule is about what the source names; the
// computed colours themselves are pinned by the Variant colours stories. ADR-0008.
const SHEETS = import.meta.glob(['../src/components/*.css', '../src/layout/*.css'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

export default { title: 'Foundations/Token layering' };

export const Guard = {
  render: () => {
    const p = document.createElement('p');
    p.style.cssText = 'color:#fff;font-family:Space Mono,monospace;font-size:14px';
    p.textContent = 'No component or layout stylesheet references --cf-base-* (see play()).';
    return p;
  },
  play: async () => {
    const files = Object.keys(SHEETS);
    // A broken glob must not pass vacuously.
    await expect(files.length).toBeGreaterThan(0);
    const leaks = files.flatMap((file) =>
      (SHEETS[file].match(/--cf-base-[a-z]+/g) ?? []).map((token) => `${file}: ${token}`),
    );
    await expect(leaks, `base tier referenced:\n${leaks.join('\n')}`).toEqual([]);
  },
};
