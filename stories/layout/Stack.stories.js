import { el, box, caption } from './_demo.js';

export default {
  title: 'Layout/Stack',
  tags: ['autodocs'],
};

// cf-stack on a <section>: vertical rhythm with one consistent gap.
export const Default = {
  name: 'Default gap',
  render: () => {
    const s = el('section', 'cf-stack');
    s.append(box('First'), box('Second'), box('Third'));
    return s;
  },
};

export const GapVariants = {
  name: 'data-gap',
  render: () => {
    const frag = document.createDocumentFragment();
    ['1', '3', '5'].forEach((g) => {
      frag.append(caption('data-gap="' + g + '"'));
      const s = el('section', 'cf-stack');
      s.dataset.gap = g;
      s.append(box('First'), box('Second'), box('Third'));
      frag.append(s);
    });
    return frag;
  },
};

// Escape hatch: any continuous value via the --cf-gap custom property.
export const CustomGap = {
  name: 'Escape hatch (--cf-gap)',
  render: () => {
    const s = el('section', 'cf-stack');
    s.style.setProperty('--cf-gap', '5ch');
    s.append(box('First'), box('Second'), box('Third'));
    return s;
  },
};
