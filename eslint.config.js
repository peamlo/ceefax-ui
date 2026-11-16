import js from '@eslint/js';
import globals from 'globals';
import wc from 'eslint-plugin-wc';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import tseslint from 'typescript-eslint';

// ESLint for the custom elements, stories and Storybook config (issue #48). Formatting is
// Prettier's job, so only correctness rules here.
export default [
  { ignores: ['dist/', 'storybook-static/', '.agents/', '.claude/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'stories/**/*.js', '.storybook/preview.js', 'docs/courses/**/*.js'],
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
  // The scripts are TypeScript, run by Node's type stripping (spike #191): parse them, and
  // let tsc (in `npm run lint`) own the types.
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ['scripts/**/*.ts'] })),
  {
    files: ['*.js', '*.mjs', 'scripts/**', '.storybook/main.js', '.storybook/test-runner.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright page.evaluate() callbacks run in the browser; the test-runner hook runs
    // under Jest.
    files: ['scripts/assert-package.ts', '.storybook/test-runner.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.jest } },
  },
];
