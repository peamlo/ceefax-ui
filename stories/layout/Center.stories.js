import { el, box } from './_demo.js';

export default {
  title: 'Layout/Center',
  tags: ['autodocs'],
};

const prose = () => {
  const a = el('article', 'cf-stack');
  a.append(
    box('A constrained reading measure — one teletext page wide (--cf-content-max).'),
    box('margin-inline:auto centres it; padding keeps text off the edges.'),
  );
  return a;
};

// cf-center on a <div> wrapping semantic content: the reading measure for prose.
export const Content = {
  name: 'Default (content-max)',
  render: () => {
    const c = el('div', 'cf-center');
    c.append(prose());
    return c;
  },
};

export const Layout = {
  name: 'data-max="layout" (two pages)',
  render: () => {
    const c = el('div', 'cf-center');
    c.dataset.max = 'layout';
    c.append(prose());
    return c;
  },
};
