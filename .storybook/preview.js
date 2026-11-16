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
  // PROTOTYPE (#194): under the Vitest addon, the a11y addon's own axe pass fails the test only on
  // the gated stories (Components/* and the screen frame); elsewhere it reports, as the panel does.
  // Then html-validate and the accessible-theme AAA pass, Vitest only (vitest-checks.ts imports
  // vitest/browser, which throws anywhere else).
  beforeEach: ({ id, parameters }) => {
    const gated = id.startsWith('components-') || ['layout-page--framed', 'layout-page--crt-framed'].includes(id);
    parameters.a11y = { ...parameters.a11y, test: gated ? 'error' : 'todo' };
  },
  afterEach: async (context) => {
    if (!globalThis.__vitest_browser__) return;
    // Storybook's backgrounds decorator paints `.sb-show-main`, the class its own iframe gives <body>.
    // Vitest's page has none, so every story sat on white and axe flagged false contrast failures.
    document.body.classList.add('sb-show-main');
    await (await import('./vitest-checks.ts')).default(context);
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
    // target-size (WCAG 2.2 AA, 24px pointer targets, #171) is off by default in axe.
    a11y: { options: { rules: { 'target-size': { enabled: true } } } },
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
