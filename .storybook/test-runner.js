import { getStoryContext } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

// The stories are the test surface (issue #8). Two mechanisms, one surface:
//  - story play() functions carry the assertions that in-page code can observe
//    (ARIA/role/text, static computed styles, the parseCharGrid pure contract);
//  - this hook carries the two that need *real* browser input — CSS :hover and
//    :focus-visible only respond to a real pointer/keyboard, which the synthetic
//    in-page userEvent cannot produce — plus the axe a11y pass.
//
// axe is gated to Components/* — the Foundations swatch/demo pages deliberately show
// the raw palette (known contrast tradeoffs), so running axe over them would fail the
// build on non-contract stories.

const BTN = '.cf-btn';
// Read the button's live colours from inside the page (runs in the browser context).
const btnColours = () => {
  const cs = getComputedStyle(document.querySelector('.cf-btn'));
  return { backgroundColor: cs.backgroundColor, color: cs.color };
};
// default button: fg=white / bg=black, so inversion => white bg + black text.
const INVERTED = { backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)' };
const RESTING = { backgroundColor: 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' };

async function assertButtonContract(page, name) {
  if (name === 'Default') {
    // Contract: keyboard focus (:focus-visible) inverts the colours. A real Tab
    // press (the button is the only focusable) makes :focus-visible match.
    await page.keyboard.press('Tab');
    expect(await page.evaluate(btnColours)).toEqual(INVERTED);
    // Contract: hover inverts too (same CSS rule as focus-visible).
    await page.hover(BTN);
    expect(await page.evaluate(btnColours)).toEqual(INVERTED);
  }
  if (name === 'Disabled') {
    // Contract: a disabled button does NOT invert on hover.
    await page.hover(BTN);
    expect(await page.evaluate(btnColours)).toEqual(RESTING);
  }
}

export default {
  async postVisit(page, context) {
    const { title, name } = await getStoryContext(page, context);
    if (!title.startsWith('Components/')) return;

    if (title === 'Components/Button') await assertButtonContract(page, name);

    await injectAxe(page);
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};
