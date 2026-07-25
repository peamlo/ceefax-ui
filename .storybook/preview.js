import '../src/index.css';
import '../src/elements/cf-loader.js';

// Autodocs generates each story's "Show code" snippet from the rendered
// element's outerHTML, which arrives as a single unbroken line. Re-indent it
// so the markup is readable in the docs source block.
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function formatHtml(html) {
  const tokens = html.replace(/>\s+</g, '><').match(/<[^>]+>|[^<]+/g) || [];
  const lines = [];
  let depth = 0;
  const pad = () => '  '.repeat(Math.max(0, depth));

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;

    if (token.startsWith('</')) {
      depth--;
      lines.push(pad() + token);
      continue;
    }

    if (token.startsWith('<')) {
      const tag = (token.match(/^<\s*([a-zA-Z0-9-]+)/) || [])[1]?.toLowerCase();
      const selfClosing = token.endsWith('/>') || VOID_ELEMENTS.has(tag);
      const next = tokens[i + 1]?.trim();
      const after = tokens[i + 2]?.trim();

      // Collapse `<tag>text</tag>` (single text child) onto one line.
      if (!selfClosing && next && !next.startsWith('<') && after?.startsWith('</')) {
        lines.push(pad() + token + next + after);
        i += 2;
        continue;
      }

      lines.push(pad() + token);
      if (!selfClosing) depth++;
      continue;
    }

    lines.push(pad() + token);
  }

  return lines.join('\n');
}

/** @type { import('@storybook/html').Preview } */
export default {
  parameters: {
    docs: {
      source: {
        transform: formatHtml,
      },
    },
    backgrounds: {
      default: 'ceefax',
      values: [{ name: 'ceefax', value: '#000000' }, { name: 'white', value: '#ffffff' }],
    },
    controls: { expanded: true },
    options: {
      // Foundations before Components; within each, follow this explicit order.
      storySort: {
        order: [
          'Foundations', ['Overview', 'Colors', 'Typography', 'Spacing', 'Layout', 'Brand'],
          'Components', ['Button', 'Link', 'Card', 'Fastext bar'],
        ],
      },
    },
  },
};
