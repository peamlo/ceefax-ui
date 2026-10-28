// Stylelint encodes the contract's mechanical rules (issue #48). It is an early echo of
// the Foundations/Token layering guard story (ADR-0008), not a replacement: if the two
// ever disagree, the story wins (ADR-0016).
const ALIAS = 'use a --cf-* semantic alias (ADR-0008)';

export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // Off: house style the contract doesn't care about, or that fights the source —
    // grouped token blocks, the authentic 6-digit broadcast hex, exact 1/64 fractions.
    'at-rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'color-hex-length': null,
    'number-max-precision': null,
    'import-notation': null,
    'font-family-name-quotes': null,
    'media-feature-range-notation': null,
    // One semantic class: cf-<block> or cf-<block>__<element>. No --modifier — state
    // comes from native/ARIA attributes, presentational variants from data-*.
    'selector-class-pattern': [
      '^cf-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message: (c) =>
          `"${c}" breaks the contract: use cf-<block> or cf-<block>__<element>; state goes in native/ARIA attributes, variants in data-*`,
      },
    ],
    // Public tokens are --cf-*, component-private ones --_*.
    'custom-property-pattern': [
      '^(cf-|_)[a-z0-9-]+$',
      { message: (p) => `"${p}": custom properties are --cf-* (public) or --_* (private)` },
    ],
    // Colours only through semantic aliases (token layer excepted, below).
    'color-no-hex': [true, { message: `Raw hex colour: ${ALIAS}` }],
    'color-named': ['never', { message: `Named colour: ${ALIAS}` }],
    'function-disallowed-list': [
      ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'],
      { message: (f) => `Raw ${f}() colour: ${ALIAS}` },
    ],
    'declaration-property-value-disallowed-list': [
      { '/.*/': ['/--cf-base-/'] },
      { message: `--cf-base-* is the token layer only: ${ALIAS}` },
    ],
  },
  overrides: [
    {
      // The token layer is where raw colours and the base tier live.
      files: ['src/tokens/**/*.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'function-disallowed-list': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};
