import { el, box, caption } from './_demo.js';

export default {
  title: 'Layout/Grid',
  tags: ['autodocs'],
};

const cells = (n, tag = 'article') => {
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= n; i++) frag.append(box('Cell ' + i, tag));
  return frag;
};

// data-cols: up to N columns, collapsing toward 1 on the grid's own width.
export const Columns = {
  name: 'data-cols',
  render: () => {
    const frag = document.createDocumentFragment();
    ['2', '3', '4'].forEach((c) => {
      frag.append(caption('data-cols="' + c + '" — narrow the frame to see it collapse'));
      const g = el('section', 'cf-grid');
      g.dataset.cols = c;
      g.append(cells(Number(c) * 2));
      frag.append(g);
    });
    return frag;
  },
};

// Intrinsic escape hatch: column count emerges from --cf-grid-min.
export const Intrinsic = {
  name: 'Intrinsic (--cf-grid-min)',
  render: () => {
    const g = el('section', 'cf-grid');
    g.style.setProperty('--cf-grid-min', '18ch');
    g.append(cells(8));
    return g;
  },
};

// Nested: a grid inside a narrow column collapses on that column's width,
// not the viewport — the whole point of the query-free model.
export const Nested = {
  name: 'Nested (collapses on own width)',
  render: () => {
    const sidebar = el('section', 'cf-sidebar');
    const rail = el('nav', 'cf-sidebar__side');
    rail.append(box('side rail', 'div'));
    const main = el('div', 'cf-sidebar__main');
    main.append(caption('cf-grid data-cols="3" inside cf-sidebar__main'));
    const g = el('section', 'cf-grid');
    g.dataset.cols = '3';
    g.append(cells(6));
    main.append(g);
    sidebar.append(rail, main);
    return sidebar;
  },
};
