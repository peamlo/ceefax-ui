import { el, box, caption } from './_demo.js';

export default {
  title: 'Layout/Sidebar',
  tags: ['autodocs'],
};

const rail = () => {
  const nav = el('nav', 'cf-sidebar__side');
  nav.setAttribute('aria-label', 'Section');
  nav.append(box('NAV RAIL', 'div'));
  return nav;
};

const main = () => {
  const m = el('main', 'cf-sidebar__main');
  m.append(box('Main content — grows to fill; wraps under the rail when it can no longer keep its min-width.'));
  return m;
};

// cf-sidebar with semantic <nav> rail + <main> content.
export const Left = {
  render: () => {
    const s = el('section', 'cf-sidebar');
    s.append(rail(), main());
    return s;
  },
};

export const Right = {
  name: 'data-side="right"',
  render: () => {
    const s = el('section', 'cf-sidebar');
    s.dataset.side = 'right';
    s.append(rail(), main());
    return s;
  },
};

export const CustomWidth = {
  name: 'Escape hatch (--cf-sidebar-side)',
  render: () => {
    const frag = document.createDocumentFragment();
    frag.append(caption('--cf-sidebar-side: 30ch'));
    const s = el('section', 'cf-sidebar');
    s.style.setProperty('--cf-sidebar-side', '30ch');
    s.append(rail(), main());
    frag.append(s);
    return frag;
  },
};
