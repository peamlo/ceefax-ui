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
