import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { HtmlValidate } from 'html-validate';
import htmlValidateConfig from './.htmlvalidate.js';

// The story test gate (ADR-0006): every story in Vitest browser mode (Playwright, Chromium),
// through the Storybook Vitest addon. play() carries each story's checks, real input included;
// the preview's beforeEach/afterEach run the story-agnostic passes (axe, html-validate).

// Browser commands run in Node with the Playwright page; a story calls them through
// `commands` from vitest/browser. Storybook's plugin switches off Vitest's own CDP access
// (api.allowWrite/allowExec), and commands need no opt-in. Coordinates a story passes are its
// own viewport's: the test iframe's offset and scale are applied here.
const toPage = async (ctx, { x, y, width = 0, height = 0 }) => {
  const frame = await ctx.frame();
  const box = await (await frame.frameElement()).boundingBox();
  const scale = box.width / (await frame.evaluate(() => globalThis.innerWidth));
  return { x: box.x + x * scale, y: box.y + y * scale, width: width * scale, height: height * scale };
};

// The frame's CDP id, for the calls that take one (Chrome's accessibility tree).
const cdpFrameId = async (cdp, url) => {
  const find = ({ frame, childFrames = [] }) => (frame.url === url ? frame.id : childFrames.map(find).find(Boolean));
  return find((await cdp.send('Page.getFrameTree')).frameTree);
};

const htmlValidate = new HtmlValidate(htmlValidateConfig);

const commands = {
  // Emulated media: forced colours, reduced motion.
  emulateMedia: (ctx, media) => ctx.page.emulateMedia(media),
  // Park the pointer off the page, so nothing in the story is hovered.
  movePointerAway: (ctx) => ctx.page.mouse.move(-1, -1),
  // A real click at a point, for targets with no element of their own (a backdrop, a
  // browser-drawn spinner).
  clickAt: async (ctx, x, y) => {
    const p = await toPage(ctx, { x, y });
    await ctx.page.mouse.click(p.x, p.y);
  },
  // A PNG of a region, base64: what the screen shows where layout can't tell (a glyph's ink).
  screenshot: async (ctx, clip) => (await ctx.page.screenshot({ clip: await toPage(ctx, clip) })).toString('base64'),
  // Chrome's own accessibility tree for the first node with `role`: Playwright's aria snapshot
  // doesn't model <summary>.
  axNode: async (ctx, role) => {
    const cdp = await ctx.context.newCDPSession(ctx.page);
    try {
      const frameId = await cdpFrameId(cdp, (await ctx.frame()).url());
      const { nodes } = await cdp.send('Accessibility.getFullAXTree', { frameId });
      const node = nodes.find((n) => n.role?.value === role);
      return (
        node && { name: node.name?.value, ...Object.fromEntries(node.properties.map((p) => [p.name, p.value.value])) }
      );
    } finally {
      await cdp.detach();
    }
  },
  // The font families Chrome's renderer drew an element's ::after with.
  pseudoFonts: async (ctx, selector) => {
    const cdp = await ctx.context.newCDPSession(ctx.page);
    try {
      await cdp.send('DOM.enable');
      await cdp.send('CSS.enable');
      const url = (await ctx.frame()).url();
      const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
      const findDoc = (n) =>
        n.documentURL === url
          ? n
          : [n.contentDocument, ...(n.children ?? [])].filter(Boolean).map(findDoc).find(Boolean);
      const doc = findDoc(root);
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.nodeId, selector });
      const { node } = await cdp.send('DOM.describeNode', { nodeId, depth: 0 });
      const after = node.pseudoElements?.find((p) => p.pseudoType === 'after');
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: after.nodeId });
      return fonts.map((f) => f.familyName);
    } finally {
      await cdp.detach();
    }
  },
  // html-validate over a story's rendered markup, with .htmlvalidate.js (#127).
  validateHtml: async (_ctx, markup) => {
    const { valid, results } = await htmlValidate.validateString(markup);
    return valid ? [] : results[0].messages.map((m) => `${m.ruleId}: ${m.message} (${m.selector ?? 'document'})`);
  },
};

export default defineConfig({
  plugins: [storybookTest()],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      commands,
    },
  },
});
