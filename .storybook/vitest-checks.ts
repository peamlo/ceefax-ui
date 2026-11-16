// PROTOTYPE (#194): what .storybook/test-runner.js postVisit does on every story, for the Vitest
// addon run. Called from preview.js's afterEach, which has the story's canvasElement (portable
// stories mount into an anonymous <div>, not #storybook-root, so a Vitest setup file can't find it).
import { expect } from 'storybook/test';
import { commands } from 'vitest/browser';
import axe from 'axe-core';

export default async function vitestChecks({ id, canvasElement }: { id: string; canvasElement: HTMLElement }) {
  // Contract (#127): every story renders valid HTML (html-validate runs in Node, a command).
  const problems = await commands.validateHtml(canvasElement.innerHTML);
  await expect(problems, `Invalid HTML in ${id}`).toEqual([]);
  if (!gated(id)) return;
  // The default-theme axe pass is the a11y addon's own afterEach. Here: the accessible theme at AAA (#12).
  document.documentElement.dataset.theme = 'accessible';
  try {
    const { violations } = await axe.run(canvasElement, {
      rules: { 'target-size': { enabled: true }, 'color-contrast-enhanced': { enabled: true } },
    });
    await expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  } finally {
    delete document.documentElement.dataset.theme;
  }
}

// axe is gated to Components/* and the screen-frame stories (ADR-0006).
export const gated = (id: string) =>
  id.startsWith('components-') || ['layout-page--framed', 'layout-page--crt-framed'].includes(id);
