import { page } from './_tokens.js';

export default { title: 'Foundations/Overview' };

export const Overview = () => page(
  '<div style="font-family:VT323,monospace;font-size:72px;line-height:1;color:#ffff00">P100 CEEFAX UI</div>' +
  '<p style="max-width:60ch;line-height:1.7">A teletext-inspired, framework-agnostic, CSS-first design system. ' +
  'The eight-colour broadcast palette is fixed and never remapped; components only ever reference the ' +
  'semantic aliases. Square corners, flat black canvas, monospaced type.</p>' +
  '<ul style="max-width:60ch;line-height:1.7;color:#b3ffb3">' +
  '<li><strong style="color:#00ffff">Colors</strong> — the fixed palette and the semantic aliases on top of it.</li>' +
  '<li><strong style="color:#00ffff">Typography</strong> — VT323 display, Space Mono body, and the type scale.</li>' +
  '<li><strong style="color:#00ffff">Spacing</strong> — a ch-based scale that tracks the monospaced grid.</li>' +
  '<li><strong style="color:#00ffff">Layout</strong> — page widths, borders, and header/footer bands.</li>' +
  '</ul>'
);
