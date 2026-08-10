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
};
