import { page } from './_tokens.js';
import '../../src/elements/cf-canvas.js';
import { pixelText } from '../_pixel-text.js';

export default { title: 'Foundations/Overview' };

export const Overview = () => {
  const root = page();

  // Pixel-art masthead, drawn by <cf-canvas> from a 5x5 font — the library
  // rendering its own name in teletext pixels.
  const header = document.createElement('cf-canvas');
  header.setAttribute('alt', 'ceefax-ui');
  header.setAttribute('data-size', 'full');
  header.style.marginBottom = '8px';
  // Classic Ceefax masthead: yellow ink, black drop shadow, blue band.
  header.textContent = pixelText('CEEFAX-UI', { ink: 'y', shadow: 'k', bg: 'b', pad: 1 });
  root.appendChild(header);

  const body = document.createElement('div');
  body.innerHTML =
    '<div style="font-family:VT323,monospace;font-size:22px;line-height:1;color:#00ffff;margin:4px 0 16px">P100 · pixel-art headers with &lt;cf-canvas&gt;</div>' +
    '<p style="max-width:60ch;line-height:1.7">A teletext-inspired, framework-agnostic, CSS-first design system. ' +
    'The eight-colour broadcast palette is fixed and never remapped; components only ever reference the ' +
    'semantic aliases. Square corners, flat black canvas, monospaced type.</p>' +
    '<ul style="max-width:60ch;line-height:1.7;color:#b3ffb3">' +
    '<li><strong style="color:#00ffff">Colors</strong> — the fixed palette and the semantic aliases on top of it.</li>' +
    '<li><strong style="color:#00ffff">Typography</strong> — VT323 display, Space Mono body, and the type scale.</li>' +
    '<li><strong style="color:#00ffff">Spacing</strong> — a ch-based scale that tracks the monospaced grid.</li>' +
    '<li><strong style="color:#00ffff">Layout</strong> — page widths, borders, and header/footer bands.</li>' +
    '<li><strong style="color:#00ffff">Pixel canvas</strong> — the header above is a &lt;cf-canvas&gt; drawing itself in pixels.</li>' +
    '</ul>';
  root.appendChild(body);

  return root;
};
