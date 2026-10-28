import { expect, within } from 'storybook/test';

const KEYS = [
  { variant: 'red', label: 'INDEX' },
  { variant: 'green', label: 'POSTS' },
  { variant: 'yellow', label: 'ABOUT' },
  { variant: 'blue', label: 'CONTACT' },
];

export default {
  title: 'Components/Fastext bar',
  tags: ['autodocs'],
  render: () => {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Fastext');
    const ul = document.createElement('ul');
    ul.className = 'cf-fastext';
    KEYS.forEach((k) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'cf-fastext__key';
      a.dataset.variant = k.variant;
      a.href = '#';
      a.textContent = k.label; // redundant text label — colour is never the sole cue
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    return nav;
  },
};

export const FastextBar = {
  // Contract: colour is never the sole cue — every coloured key carries a
  // redundant, non-empty text label in the markup.
  play: async ({ canvasElement }) => {
    const keys = within(canvasElement).getAllByRole('link');
    await expect(keys.length).toBe(KEYS.length);
    for (const key of keys) {
      await expect(key).toHaveAttribute('data-variant'); // it is a colour key
      await expect(key.textContent.trim().length).toBeGreaterThan(0); // ...with a label
    }
  },
};
