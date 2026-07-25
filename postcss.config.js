// String-keyed plugin config — postcss-load-config resolves these at build time,
// so no top-level npm imports are needed.
export default {
  plugins: {
    'postcss-import': {},
    'postcss-url': { url: 'copy', assetsPath: 'fonts', useHash: false },
    autoprefixer: {},
  },
};
