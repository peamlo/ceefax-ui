/** @type { import('@storybook/html-vite').StorybookConfig } */
export default {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.stories.@(js|mjs|ts)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',        // live WCAG checks — flags the known contrast failures
    '@storybook/addon-interactions', // play() functions to script Tab/focus
  ],
};
