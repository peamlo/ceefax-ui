import '../src/index.css';
import '../src/elements/cf-loader.js';

/** @type { import('@storybook/html').Preview } */
export default {
  parameters: {
    backgrounds: {
      default: 'ceefax',
      values: [{ name: 'ceefax', value: '#000000' }, { name: 'white', value: '#ffffff' }],
    },
    controls: { expanded: true },
  },
};
