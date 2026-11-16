import { expect } from 'storybook/test';
import { el, box, caption } from './_demo.js';

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
// that carries data-align for another reason (a table cell, a headless library's
// popover) or under an outer cluster with its own data-align.
const innerCluster = () => {
  const ul = el('ul', 'cf-cluster');
  ul.style.listStyle = 'none';
  ul.style.padding = '0';
  const tall = box('a taller item', 'li');
  tall.style.padding = 'var(--cf-space-5) var(--cf-space-3)';
  ul.append(box('short', 'li'), tall, box('CENTRE', 'li'));
  return ul;
};

export const InsideAlignedParent = {
  name: 'inside a data-align parent',
  render: () => {
    const wrap = el('div');
    const parent = el('div');
    parent.dataset.align = 'end';
    parent.append(innerCluster());
    const outer = el('div', 'cf-cluster');
    outer.dataset.align = 'end';
    outer.append(box('OUTER'), innerCluster());
    wrap.append(caption('under a plain element with data-align="end"'), parent);
    wrap.append(caption('under a cf-cluster with data-align="end"'), outer);
    return wrap;
  },
  play: async ({ canvasElement }) => {
    const inner = canvasElement.querySelectorAll('.cf-cluster:not([data-align])');
    await expect(inner.length).toBe(2);
    for (const ul of inner) await expect(getComputedStyle(ul).alignItems).toBe('center');
  },
};
