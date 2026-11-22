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
  beforeEach: async ({ parameters }) => {
    if (globalThis.__vitest_browser__) {
      // Storybook's own iframe gives <body> `sb-show-main` (the backgrounds decorator paints it)
      // and `sb-main-<layout>` (the padding). Vitest's page has neither: every story would sit
      // flush on white, and axe would report false contrast failures.
      document.body.className = `sb-show-main sb-main-${parameters.layout ?? 'padded'}`;
      // The pointer stays where the last story left it, often on this story's first control,
      // which then renders hovered. Park it off the page before the story renders.
      await (await import('vitest/browser')).commands.movePointerAway();
    }
  },
  // html-validate and the accessible-theme AAA pass, once per story, under Vitest only.
  afterEach: async (context) => {
    if (globalThis.__vitest_browser__) await (await import('./vitest-checks.js')).default(context);
  },
  decorators: [
    (story, { globals }) => {
      if (globals.theme === 'accessible') document.documentElement.dataset.theme = 'accessible';
      else delete document.documentElement.dataset.theme;
      return story();
    },
  ],
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
    // axe fails the build on every story (ADR-0006). A story that shows the raw palette, with
    // its known contrast tradeoffs, on purpose opts out in its own file with `test: 'todo'`.
    // target-size (WCAG 2.2 AA, 24px pointer targets, #171) is off by default in axe.
    a11y: { test: 'error', options: { rules: { 'target-size': { enabled: true } } } },
    options: {
      // Foundations before Components; within each, follow this explicit order.
      storySort: {
        order: [
          'Foundations',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Layout', 'Brand'],
          'Layout',
          ['Stack', 'Cluster', 'Grid', 'Center', 'Sidebar', 'Page'],
          'Components',
          [
            'Button',
            'Link',
            'Card',
            'Stat',
            'Fastext bar',
            'Header row',
            'Table',
            'Form',
            ['Field', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio'],
            'Mosaic',
            'Dialog',
            'Reveal',
          ],
        ],
      },
    },
  },
};
