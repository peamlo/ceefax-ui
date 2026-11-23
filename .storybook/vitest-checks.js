import { expect } from 'storybook/test';
import { commands } from 'vitest/browser';
import axe from 'axe-core';

// The story-agnostic passes, once per story after play(), under Vitest only (vitest/browser
// throws anywhere else): preview.js's afterEach imports this. It has the story's canvasElement;
// portable stories mount into an anonymous <div>, not #storybook-root, so a Vitest setup file
// couldn't find the story. Runs before addon-a11y's own axe pass (Storybook runs afterEach
// finalizers in reverse), which audits the gated stories under the authentic theme.
export default async function vitestChecks({ title, name, canvasElement, parameters }) {
  // Contract (#127): every story renders valid HTML, so markup a consumer copies from "Show
  // code" validates too. html-validate runs in Node (a browser command), with .htmlvalidate.js.
  const problems = await commands.validateHtml(canvasElement.innerHTML);
  await expect(problems, `Invalid HTML in story "${title} / ${name}"`).toEqual([]);

  // Contract (#12): every axe-gated story also passes axe under the accessible theme, at AAA
  // contrast. The same config and options as the addon's pass, straight from the parameters.
  const { test, config = {}, options = {} } = parameters.a11y ?? {};
  if (test !== 'error') return;
  const root = document.documentElement;
  root.dataset.theme = 'accessible';
  try {
    axe.reset();
    axe.configure(config);
    const { violations } = await axe.run(canvasElement, {
      ...options,
      rules: { ...options.rules, 'color-contrast-enhanced': { enabled: true } },
    });
    const found = violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    await expect(found, `axe (accessible theme, AAA) in story "${title} / ${name}"`).toEqual([]);
  } finally {
    delete root.dataset.theme;
  }
}
