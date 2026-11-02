// html-validate rules for the stories' rendered HTML (#127), run per story by the test-runner
// hook (.storybook/test-runner.js). Starts from the recommended preset; every rule turned off
// carries its reason. The input is a story's rendered root (what "Show code" displays), a
// fragment serialized by the browser, not a hand-written document.
export default {
  extends: ['html-validate:recommended'],
  elements: [
    'html5',
    {
      // The opt-in Web Component (src/elements/): the loader sits in running text.
      'cf-loader': { flow: true, phrasing: true, permittedContent: ['@phrasing'] },
    },
  ],
  rules: {
    // Document-level: a story is a fragment, with no doctype or <title> to judge.
    'doctype-html': 'off',
    'doctype-style': 'off',
    'empty-title': 'off',
    'long-title': 'off',
    // Valid HTML: stories lay out their demos and set custom properties with style="".
    'no-inline-style': 'off',
    // A cf-mosaic row may end in empty cells, and an empty cell is a space (README "Mosaic"), so
    // trailing whitespace is part of the picture there: white-space: pre keeps it.
    'no-trailing-whitespace': 'off',
    // The browser serializes every boolean attribute as name="", so its style isn't the story's.
    'attribute-boolean-style': 'off',
    // Checkboxes sharing a name are one multi-value control (a group, README "Forms"), like radios.
    'form-dup-name': ['error', { shared: ['radio', 'checkbox', 'button', 'reset', 'submit'] }],
    // A group may be named by the heading above it with aria-labelledby, not a <legend>
    // (README "Forms": no repeated or hidden text). The rule only accepts a <legend>.
    'wcag/h71': 'off',
    // On, minus one role. The rule reports an element given a role that a native element already
    // has, here <div role="region"> where it wants <section>. The table's cf-table__scroll is
    // exactly that markup by contract (README "The contract"), so role="region" is exempt: every
    // other role (button, link, list, …) is still reported. A <section> region would be a
    // contract change, out of scope for #127.
    'prefer-native-element': ['error', { exclude: ['region'] }],
  },
};
