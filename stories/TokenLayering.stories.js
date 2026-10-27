import { expect } from 'storybook/test';

// A contract story with no component of its own: it pins the token layering rule — component
// and layout stylesheets — and the variant seam in base.css — reference only `--cf-*`
// semantic aliases, never the `--cf-base-*` authentic colours (the seam reaches them through
// the remappable `--cf-variant-*` tier, #12).
// It reads stylesheet SOURCE because the rule is about what the source names; the
// computed colours themselves are pinned by the Variant colours stories. ADR-0008.
const SHEETS = import.meta.glob(['../src/base.css', '../src/components/*.css', '../src/layout/*.css'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const FILES = Object.keys(SHEETS);
const LEAKS = FILES.flatMap((file) =>
  (SHEETS[file].match(/--cf-base-[a-z]+/g) ?? []).map((token) => `${file.replace('../', '')}: ${token}`),
);

export default { title: 'Foundations/Token layering' };

// The canvas shows the live result of the same check play() asserts, so a reader sees
// what was scanned and what (if anything) leaked — never a static claim.
export const Guard = {
  render: () => {
    const el = document.createElement('div');
    el.style.cssText = 'background:#000;padding:1em;color:#fff;font-family:Space Mono,monospace;font-size:14px';
    const ok = FILES.length > 0 && LEAKS.length === 0;
    const status = document.createElement('p');
    status.style.color = ok ? '#0f0' : '#f00';
    status.textContent = ok
      ? `PASS — ${FILES.length} stylesheets checked, none reference --cf-base-*`
      : FILES.length === 0
        ? 'FAIL — no stylesheets found to check'
        : `FAIL — ${LEAKS.length} --cf-base-* reference(s) found:`;
    const list = document.createElement('ul');
    for (const line of LEAKS.length ? LEAKS : FILES.map((f) => `${f.replace('../', '')} ✓`)) {
      const li = document.createElement('li');
      li.textContent = line;
      list.append(li);
    }
    el.append(status, list);
    return el;
  },
  play: async () => {
    // A broken glob must not pass vacuously.
    await expect(FILES.length).toBeGreaterThan(0);
    await expect(LEAKS, `base tier referenced:\n${LEAKS.join('\n')}`).toEqual([]);
  },
};
