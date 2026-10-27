import { expect, within } from '@storybook/test';

// cf-notice (#19): a thick-bordered alert whose flag flashes like teletext flash text for
// ~5s, then holds solid. The flag's word is always repeated in the body, so neither the
// flash nor the colour is the only cue. Only one blinking notice per screen.
// The blink itself needs emulated media, so it is asserted in .storybook/test-runner.js.
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
  const flag = el.querySelector('.cf-notice__flag').textContent.trim().toLowerCase();
  const body = el.textContent.replace(el.querySelector('.cf-notice__flag').textContent, '').toLowerCase();
  await expect(body).toContain(flag);
};
const border = (canvasElement) => getComputedStyle(canvasElement.querySelector('.cf-notice')).borderTopColor;

export default {
  title: 'Components/Notice',
  tags: ['autodocs'],
  render: notice,
  argTypes: {
    variant: { control: 'select', options: ['', 'red', 'yellow'] },
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
    await expect(border(ctx.canvasElement)).toBe('rgb(255, 0, 0)'); // --cf-danger, no attribute
  },
};

export const Warning = {
  args: { variant: 'yellow', flag: 'NEW', body: '<p>New target: €75,000, up from €70,000.</p>' },
  play: async (ctx) => {
    await assertNote(ctx);
    await expect(border(ctx.canvasElement)).toBe('rgb(255, 255, 0)'); // --cf-warning
  },
};

export const BlinkOff = {
  name: 'Blink off (data-blink="off")',
  args: { blink: 'off', flag: 'DEADLINE', body: '<p>Deadline: send the form by 31 October.</p>' },
  play: assertNote,
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
  play: assertNote,
};
