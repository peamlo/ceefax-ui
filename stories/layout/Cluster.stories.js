import { expect } from 'storybook/test';
import { el, box } from './_demo.js';

export default {
  title: 'Layout/Cluster',
  tags: ['autodocs'],
};

// cf-cluster on a <ul>: an inline group of tags that wraps.
export const Tags = {
  render: () => {
    const ul = el('ul', 'cf-cluster');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ['NEWS', 'SPORT', 'WEATHER', 'FINANCE', 'TRAVEL', 'TV GUIDE', 'LOTTERY'].forEach((t) => {
      ul.append(box(t, 'li'));
    });
    return ul;
  },
};

export const Alignment = {
  name: 'data-align="end"',
  render: () => {
    const ul = el('ul', 'cf-cluster');
    ul.dataset.align = 'end';
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    const a = box('short', 'li');
    const b = box('a taller item', 'li');
    b.style.padding = 'var(--cf-space-5) var(--cf-space-3)';
    ul.append(a, b, box('END', 'li'));
    return ul;
  },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(canvasElement.querySelector('.cf-cluster')).alignItems).toBe('flex-end');
  },
};

// A cluster without its own data-align keeps its default, even under an element
// that carries data-align for another reason (a table cell, a headless library's popover).
export const InsideAlignedParent = {
  name: 'inside a data-align parent',
  render: () => {
    const parent = el('div');
    parent.dataset.align = 'end';
    const ul = el('ul', 'cf-cluster');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    const tall = box('a taller item', 'li');
    tall.style.padding = 'var(--cf-space-5) var(--cf-space-3)';
    ul.append(box('short', 'li'), tall, box('CENTRE', 'li'));
    parent.append(ul);
    return parent;
  },
  play: async ({ canvasElement }) => {
    await expect(getComputedStyle(canvasElement.querySelector('.cf-cluster')).alignItems).toBe('center');
  },
};
