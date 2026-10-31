import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// The story test gate (ADR-0006): the stories tagged `contract`, run in Vitest browser mode
// (Playwright, Chromium). Each story's play() carries its assertions; addon-a11y's afterEach
// runs axe. Two projects, one per theme: `authentic` audits as authored, `accessible` audits
// the same stories again under data-theme="accessible" at AAA contrast (#12) — the `axeTheme`
// global it sets is read by the afterEach in .storybook/preview.js.
const project = (name, initialGlobals) => ({
  extends: true,
  plugins: [storybookTest({ tags: { include: ['contract'] }, initialGlobals })],
  test: { name },
});

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      // Playwright calls Vitest has no built-in for: emulated media (the notice blink under
      // reduced motion), and parking the pointer off the page so nothing is hovered.
      commands: {
        emulateMedia: ({ page }, options) => page.emulateMedia(options),
        movePointerAway: ({ page }) => page.mouse.move(-1, -1),
      },
    },
    setupFiles: ['.storybook/vitest.setup.js'],
    projects: [project('authentic', {}), project('accessible', { axeTheme: 'accessible' })],
  },
});
