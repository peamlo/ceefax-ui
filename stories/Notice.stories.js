import { expect, within } from 'storybook/test';
import { realInput } from './_real-input.js';

// cf-notice (#19): a thick-bordered note whose flag flashes like teletext flash text for
// ~5s, then holds solid. The flag's word is always repeated in the body, so neither the
// flash nor the colour is the only cue. Only one blinking notice per screen.
const notice = ({ variant, blink, flag, body }) => {
  const el = document.createElement('div');
  el.className = 'cf-notice';
  el.setAttribute('role', 'note');
  if (variant) el.dataset.variant = variant;
  if (blink) el.dataset.blink = blink;
  el.innerHTML = `<strong class="cf-notice__flag">${flag}</strong>${body}`;
  return el;
};

// Contract: a note (not an alert), and the flag's word is repeated in the body.
const assertNote = async ({ canvasElement }) => {
  const el = within(canvasElement).getByRole('note');
  const flag = el.querySelector('.cf-notice__flag').textContent;
  const body = el.textContent.replace(flag, '').toLowerCase();
  await expect(body).toContain(flag.trim().toLowerCase());
};
// Contract (#19): the flag flashes for ~5s then holds visible, never under reduced motion, and
// never with data-blink="off". Needs emulated media, so it runs where Vitest provides real input.
// Leaves the flag solid (animation finished) so axe audits the resting state.
const assertBlink = async ({ canvasElement }) => {
  const io = realInput();
  if (!io) return;
  const flag = canvasElement.querySelector('.cf-notice__flag');
  // animation-name, not just getAnimations(): a leaked animation that already finished
  // (no fill) would also leave getAnimations() empty.
  const animationName = () => getComputedStyle(flag).animationName;
  await io.commands.emulateMedia({ reducedMotion: 'reduce' });
  try {
    await expect(animationName()).toBe('none');
  } finally {
    await io.commands.emulateMedia({ reducedMotion: 'no-preference' });
  }
  if (canvasElement.querySelector('.cf-notice').dataset.blink === 'off') {
    await expect(animationName()).toBe('none');
    return;
  }
  // The animated properties too: opacity, never visibility, keeps the flag in the a11y tree.
  const animations = flag.getAnimations().map((a) => {
    const { duration, iterations } = a.effect.getComputedTiming();
    const props = [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)))].filter(
      (k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k),
    );
    return { duration, iterations, props };
  });
  await expect(animations).toEqual([{ duration: 1000, iterations: 5, props: ['opacity'] }]);
  flag.getAnimations().forEach((a) => a.finish());
  await expect(getComputedStyle(flag).opacity).toBe('1');
};
const border = (canvasElement) => getComputedStyle(canvasElement.querySelector('.cf-notice')).borderTopColor;

export default {
  title: 'Components/Notice',
  tags: ['autodocs', 'contract'],
  parameters: { a11y: { test: 'error' } }, // in the axe gate under both themes (ADR-0006)
  render: notice,
  argTypes: {
    variant: { control: 'select', options: ['', 'red', 'yellow', 'green'] },
    blink: { control: 'select', options: ['', 'off'] },
    flag: { control: 'text' },
    body: { control: 'text' },
  },
  args: {
    variant: '',
    blink: '',
    flag: 'MISMATCH',
    body: '<p>Mismatch: the plan says €75,000 but the contract says €70,000.</p>',
  },
};

export const Danger = {
  play: async (ctx) => {
    await assertNote(ctx);
    await assertBlink(ctx);
    await expect(border(ctx.canvasElement)).toBe('rgb(255, 0, 0)'); // --cf-danger, no attribute
  },
};

export const Warning = {
  args: { variant: 'yellow', flag: 'NEW', body: '<p>New target: €75,000, up from €70,000.</p>' },
  play: async (ctx) => {
    await assertNote(ctx);
    await assertBlink(ctx);
    await expect(border(ctx.canvasElement)).toBe('rgb(255, 255, 0)'); // --cf-warning
  },
};

// Good news rarely needs a flash: leave the one flashing notice to danger or a warning.
export const Success = {
  args: { variant: 'green', blink: 'off', flag: 'DONE', body: '<p>Done: your transfer of €5,000 has arrived.</p>' },
  play: async (ctx) => {
    await assertNote(ctx);
    await assertBlink(ctx);
    await expect(border(ctx.canvasElement)).toBe('rgb(0, 255, 0)'); // --cf-success
  },
};

export const BlinkOff = {
  name: 'Blink off',
  args: { blink: 'off', flag: 'DEADLINE', body: '<p>Deadline: send the form by 31 October.</p>' },
  play: async (ctx) => {
    await assertNote(ctx);
    await assertBlink(ctx);
  },
};

export const RichBody = {
  name: 'Rich body',
  args: {
    flag: 'RISK',
    body:
      '<p>Risk: the fund can lose value.</p>' +
      '<ul><li>Past returns do not predict future ones.</li><li>You may get back less than you put in.</li></ul>' +
      '<p><a class="cf-link" href="#">Read the risk guide</a></p>',
  },
  play: async (ctx) => {
    await assertNote(ctx);
    await assertBlink(ctx);
  },
};
