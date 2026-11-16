// PROTOTYPE (#194): the stories as Vitest browser-mode tests, next to the test-runner job.
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import type { BrowserCommand } from 'vitest/node';
import { HtmlValidate } from 'html-validate';
import htmlValidateConfig from './.htmlvalidate.js';

// Commands run in Node with the Playwright page. Storybook's plugin switches off Vitest's CDP
// access (api.allowWrite/allowExec), so media emulation goes through Playwright here instead.
const emulateMedia: BrowserCommand<[{ forcedColors?: 'active' | 'none'; reducedMotion?: 'reduce' | 'no-preference' }]> = (
  ctx,
  media,
) => ctx.page.emulateMedia(media);
const htmlValidate = new HtmlValidate(htmlValidateConfig);
const validateHtml: BrowserCommand<[string]> = async (_ctx, markup) => {
  const { valid, results } = await htmlValidate.validateString(markup);
  return valid ? [] : results[0].messages.map((m) => `${m.ruleId}: ${m.message} (${m.selector ?? 'document'})`);
};

export default defineConfig({
  plugins: [storybookTest({ configDir: '.storybook' })],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      commands: { emulateMedia, validateHtml },
    },
  },
});
