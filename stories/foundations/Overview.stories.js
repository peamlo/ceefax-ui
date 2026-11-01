import { page, heading } from './_tokens.js';

export default { title: 'Foundations/Overview' };

export const Overview = () => {
  const root = page();

  // Teletext masthead for the library name: the title is text on a mosaic band (cf-mosaic), between
  // two mosaic rows that round its corners. Those are decorative, so hidden. Each row is a block,
  // so the three stack one em apart with no line-height gap.
  const header = document.createElement('div');
  header.style.cssText = 'font-size:var(--cf-text-display-lg);width:fit-content;margin-bottom:8px';
  const edge = (cells) =>
    `<span class="cf-mosaic" aria-hidden="true" data-variant="blue" style="display:block">${cells}</span>`;
  header.innerHTML =
    edge('🬞' + '🬭'.repeat(9) + '🬏') +
    '<h1 style="margin:0;font-size:inherit">' +
    '<span class="cf-mosaic" data-band="blue" data-variant="yellow" style="display:block"> CEEFAX-UI </span></h1>' +
    edge('🬁' + '🬂'.repeat(9) + '🬀');
  root.appendChild(header);

  const ul = 'max-width:60ch;line-height:1.7;color:var(--cf-fg-dim)';
  const key = 'color:var(--cf-info)';

  const intro = document.createElement('div');
  intro.innerHTML =
    '<div style="font-family:Space Mono,monospace;font-size:15px;color:var(--cf-info);margin:4px 0 16px">' +
    'A lightweight, CSS-first design system — teletext for the web.</div>' +
    '<p style="max-width:60ch;line-height:1.7">A framework-agnostic component library inspired by ' +
    'Ceefax / teletext. It ships design tokens, semantic CSS classes, and self-hosted fonts — ' +
    '<strong style="color:var(--cf-accent)">no framework, no JS runtime</strong>. Consume it as plain ' +
    '<code>class="…"</code> in Astro, Svelte, or plain HTML: one stylesheet, zero lock-in. The ' +
    'eight-colour broadcast palette is fixed and never remapped; components only reference the ' +
    'semantic aliases. Square corners, flat black canvas, monospaced type.</p>';
  root.appendChild(intro);

  const foundations = document.createElement('ul');
  foundations.style.cssText = ul;
  foundations.innerHTML =
    `<li><strong style="${key}">Colors</strong> — the fixed palette and the semantic aliases on top of it.</li>` +
    `<li><strong style="${key}">Typography</strong> — Bedstead display, Space Mono body, and the type scale.</li>` +
    `<li><strong style="${key}">Spacing</strong> — a ch-based scale that tracks the monospaced grid.</li>` +
    `<li><strong style="${key}">Layout</strong> — page widths, borders, and header/footer bands.</li>`;
  root.appendChild(heading('Foundations'));
  root.appendChild(foundations);

  const components = document.createElement('ul');
  components.style.cssText = ul;
  components.innerHTML =
    `<li><strong style="${key}">Buttons, links, cards, fastext</strong> — one semantic class on a native element; state from native/ARIA attributes.</li>` +
    `<li><strong style="${key}">Mosaics</strong> — teletext block graphics written as text (<code>cf-mosaic</code>), on the same row as the words around them.</li>` +
    `<li><strong style="${key}">Optional element</strong> — one standard Web Component under the opt-in <code>./elements</code> export (<code>&lt;cf-loader&gt;</code>) for what CSS can't do alone.</li>`;
  root.appendChild(heading('Components'));
  root.appendChild(components);

  return root;
};
