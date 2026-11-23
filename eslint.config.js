import js from '@eslint/js';
import globals from 'globals';
import wc from 'eslint-plugin-wc';
import noUnsanitized from 'eslint-plugin-no-unsanitized';

// ESLint for the custom elements, stories and Storybook config (issue #48). Formatting is
// Prettier's job, so only correctness rules here.
// The TypeScript scripts are skipped: tsc checks them (ADR-0025), and typescript-eslint
// doesn't run on TypeScript 7.
export default [
  { ignores: ['dist/', 'storybook-static/', '.agents/', '.claude/', 'scripts/**/*.ts'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'stories/**/*.js', '.storybook/{preview,vitest-checks}.js', 'docs/courses/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    // Custom elements: platform best practice, and the shadow-DOM templates stay static.
    files: ['src/elements/**/*.js'],
    ...wc.configs['flat/best-practice'],
    rules: {
      ...wc.configs['flat/best-practice'].rules,
      // Off: the elements attach their shadow root in connectedCallback, guarded by
      // `if (this.shadowRoot)`, so a constructor stays free of work.
      'wc/attach-shadow-constructor': 'off',
      'wc/guard-define-call': 'error',
      'wc/define-tag-after-class-definition': 'error',
    },
  },
  {
    files: ['src/elements/**/*.js'],
    ...noUnsanitized.configs.recommended,
  },
  {
    files: ['*.js', '.storybook/main.js'],
    languageOptions: { globals: globals.node },
  },
];
