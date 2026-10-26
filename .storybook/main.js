import postcssImport from 'postcss-import';
import autoprefixer from 'autoprefixer';

/** @type { import('@storybook/html-vite').StorybookConfig } */
export default {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.stories.@(js|mjs|ts)'],
  // Controls, interactions and play() are core since Storybook 9; docs is its own addon.
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y', // live WCAG checks — flags the known contrast failures
  ],
  // The root postcss.config.js uses postcss-url { url: 'rebase' } for the library
  // build. Vite would otherwise inherit it and run postcss-url over Storybook's
  // own injected CSS (sb-common-assets fonts), whose Vite virtual paths carry a
  // null-byte prefix that crashes fs.access. Scope Storybook to its own PostCSS
  // config so font URLs are resolved by Vite natively instead of rewritten.
  async viteFinal(config) {
    config.css = config.css || {};
    config.css.postcss = { plugins: [postcssImport(), autoprefixer()] };
    return config;
  },
};
