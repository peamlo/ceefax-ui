import { page, heading } from './_tokens.js';
import '../../src/elements/cf-canvas.js';
import { masthead } from '../_pixel-text.js';

export default { title: 'Foundations/Overview' };

export const Overview = () => {
  const root = page();

  // Teletext masthead for the library name. It happens to be a <cf-canvas>, but the
  // page is about the design system as a whole — not this one element.
  const header = document.createElement('cf-canvas');
  header.setAttribute('alt', 'ceefax-ui');
  header.setAttribute('data-size', 'full');
  header.style.marginBottom = '8px';
  header.textContent = masthead('CEEFAX-UI');
  root.appendChild(header);

  const ul = 'max-width:60ch;line-height:1.7;color:#b3ffb3';
  const key = 'color:#00ffff';

  const intro = document.createElement('div');
  intro.innerHTML =
    '<div style="font-family:Space Mono,monospace;font-size:15px;color:#00ffff;margin:4px 0 16px">' +
    'A lightweight, CSS-first design system — teletext for the web.</div>' +
    '<p style="max-width:60ch;line-height:1.7">A framework-agnostic component library inspired by ' +
    'Ceefax / teletext. It ships design tokens, semantic CSS classes, and self-hosted fonts — ' +
    '<strong style="color:#ffff00">no framework, no JS runtime</strong>. Consume it as plain ' +
    '<code>class="…"</code> in Astro, Svelte, or plain HTML: one stylesheet, zero lock-in. The ' +
    'eight-colour broadcast palette is fixed and never remapped; components only reference the ' +
    'semantic aliases. Square corners, flat black canvas, monospaced type.</p>';
  root.appendChild(intro);

  const foundations = document.createElement('ul');
  foundations.style.cssText = ul;
  foundations.innerHTML =
    `<li><strong style="${key}">Colors</strong> — the fixed palette and the semantic aliases on top of it.</li>` +
    `<li><strong style="${key}">Typography</strong> — VT323 display, Space Mono body, and the type scale.</li>` +
    `<li><strong style="${key}">Spacing</strong> — a ch-based scale that tracks the monospaced grid.</li>` +
    `<li><strong style="${key}">Layout</strong> — page widths, borders, and header/footer bands.</li>`;
  root.appendChild(heading('Foundations'));
  root.appendChild(foundations);

  const components = document.createElement('ul');
  components.style.cssText = ul;
  components.innerHTML =
    `<li><strong style="${key}">Buttons, links, cards, fastext</strong> — one semantic class on a native element; state from native/ARIA attributes.</li>` +
    `<li><strong style="${key}">Optional elements</strong> — a couple of standard Web Components under the opt-in <code>./elements</code> export (<code>&lt;cf-loader&gt;</code>, <code>&lt;cf-canvas&gt;</code>) for the few things CSS can't do alone.</li>`;
  root.appendChild(heading('Components'));
  root.appendChild(components);

  return root;
};
