// html-validate rules for the stories' rendered HTML (#127), run per story by the test-runner
// hook (.storybook/test-runner.js). Starts from the recommended preset; every rule turned off
// carries its reason. The input is a story's rendered root (what "Show code" displays), a
// fragment serialized by the browser, not a hand-written document.
export default {
  extends: ['html-validate:recommended'],
  elements: [
    'html5',
    {
      // The two opt-in Web Components (src/elements/). Both sit in running text or a block.
      'cf-loader': { flow: true, phrasing: true, permittedContent: ['@phrasing'] },
      // Its text content is the char-grid source, read by the element and drawn to a canvas.
      'cf-canvas': { flow: true, permittedContent: [] },
    },
  ],
  rules: {
    // Valid HTML: stories lay out their demos and set custom properties with style="".
    'no-inline-style': 'off',
    // The browser serializes every boolean attribute as name="", so its style isn't the story's.
    'attribute-boolean-style': 'off',
    // The table's scroll region is a <div role="region"> by contract (README "The contract").
    'prefer-native-element': ['error', { exclude: ['region'] }],
  },
};
