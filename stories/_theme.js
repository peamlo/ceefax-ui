// Run one step under data-theme="accessible" on <html>, as a consumer sets it, then put the
// theme back as it was (the Storybook toolbar's, or none).
export const withAccessibleTheme = async (step) => {
  const root = document.documentElement;
  const theme = root.dataset.theme;
  root.dataset.theme = 'accessible';
  try {
    await step();
  } finally {
    if (theme) root.dataset.theme = theme;
    else delete root.dataset.theme;
  }
};
