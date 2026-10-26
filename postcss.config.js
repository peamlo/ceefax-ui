// String-keyed plugin config — postcss-load-config resolves these at build time,
// so no top-level npm imports are needed.
export default {
  plugins: {
    'postcss-import': {},
    // Rebase, don't copy: every dist/*.css points at the one packed fonts/ folder
    // (copy placed assets by entry depth, so tokens.css silently missed dist/fonts).
    'postcss-url': { url: 'rebase' },
    autoprefixer: {},
  },
};
