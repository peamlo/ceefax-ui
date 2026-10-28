import { html as beautifyHtml } from 'js-beautify';
import '../src/index.css';
import '../src/elements/cf-loader.js';

// Autodocs generates each story's "Show code" snippet from the rendered
// element's outerHTML, which arrives as a single unbroken line. Re-indent it
// with js-beautify so the markup is readable in the docs source block.
const formatHtml = (code) => beautifyHtml(code, { indent_size: 2, wrap_line_length: 0, preserve_newlines: false });

/** @type { import('@storybook/html-vite').Preview } */
export default {
  // Toolbar switch for the opt-in accessible theme (#12): the same one attribute a
  // consumer sets on <html>, so every story can be read under either theme.
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'authentic', title: 'Authentic (default)' },
          { value: 'accessible', title: 'Accessible' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'authentic', backgrounds: { value: 'ceefax' } },
  decorators: [
    (story, { globals }) => {
      if (globals.theme === 'accessible') document.documentElement.dataset.theme = 'accessible';
      else delete document.documentElement.dataset.theme;
      return story();
    },
  ],
  // The accessible-theme axe pass (#12, ADR-0006): the `accessible` Vitest project sets the
  // `axeTheme` global. play() has asserted under the authentic theme; now switch to the
  // accessible theme and enable AAA contrast for addon-a11y's audit. Storybook runs afterEach
  // finalizers in reverse, so this one (preview) runs before the addon's.
  afterEach: ({ globals, parameters }) => {
    if (globals.axeTheme !== 'accessible') return;
    document.documentElement.dataset.theme = 'accessible';
    const { a11y = {} } = parameters;
    const rules = { ...a11y.options?.rules, 'color-contrast-enhanced': { enabled: true } };
    parameters.a11y = { ...a11y, options: { ...a11y.options, rules } };
  },
  parameters: {
    docs: {
      source: {
        transform: formatHtml,
      },
    },
    backgrounds: {
      options: {
        ceefax: { name: 'ceefax', value: '#000000' },
        blue: { name: 'blue', value: '#100b8a' },
      },
    },
    controls: { expanded: true },
    options: {
      // Foundations before Components; within each, follow this explicit order.
      storySort: {
        order: [
          'Foundations',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Layout', 'Brand'],
          'Layout',
          ['Stack', 'Cluster', 'Grid', 'Center', 'Sidebar', 'Page'],
          'Components',
          ['Button', 'Link', 'Card', 'Fastext bar', 'Header row', 'Table', 'Pixel canvas'],
        ],
      },
    },
  },
};
