import { html as beautifyHtml } from 'js-beautify';
import '../src/index.css';
import '../src/elements/cf-loader.js';

// Autodocs generates each story's "Show code" snippet from the rendered
// element's outerHTML, which arrives as a single unbroken line. Re-indent it
// with js-beautify so the markup is readable in the docs source block.
const formatHtml = (code) =>
  beautifyHtml(code, { indent_size: 2, wrap_line_length: 0, preserve_newlines: false });

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
          'Components', ['Button', 'Link', 'Card', 'Fastext bar', 'Pixel canvas'],
        ],
      },
    },
  },
};
