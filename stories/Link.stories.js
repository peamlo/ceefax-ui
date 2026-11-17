import { expect, within } from 'storybook/test';
import {
  LINK_PROPS,
  CLUSTER_PROPS,
  LIST_PROPS,
  root,
  expectSameAsClassForm,
  outsideRoot,
  expectNoLeak,
} from './_classless.js';

// EXPERIMENTAL (#26): with `classless`, the link is a bare <a href> inside a .cf-root
// container; the nav variant is the structure nav > ul > li > a, with no data-variant.
const classlessNav = (a, label) => {
  const items = [
    a,
    ...['NEWS', 'SPORT'].map((t) => Object.assign(document.createElement('a'), { href: '#', textContent: t })),
  ];
  const ul = document.createElement('ul');
  for (const el of items) {
    const li = document.createElement('li');
    li.append(el);
    ul.append(li);
  }
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', label);
  nav.append(ul);
  return nav;
};

export default {
  title: 'Components/Link',
  tags: ['autodocs'],
  render: ({ label, variant, page, current, href, classless }) => {
    const a = document.createElement('a');
    a.href = href || '#';
    if (classless) {
      a.textContent = label;
      if (current) a.setAttribute('aria-current', 'page');
      return root(variant === 'nav' ? classlessNav(a, 'Sections') : a);
    }
    a.className = 'cf-link';
    if (variant === 'nav') {
      a.dataset.variant = 'nav';
      if (page) {
        const s = document.createElement('span');
        s.className = 'cf-link__page';
        s.textContent = 'p.' + page;
        a.appendChild(s);
      }
      const t = document.createElement('span');
      t.textContent = label;
      a.appendChild(t);
    } else {
      a.textContent = label;
    }
    if (current) a.setAttribute('aria-current', 'page');
    return a;
  },
  argTypes: {
    label: { control: 'text' },
    variant: { control: 'radio', options: ['inline', 'nav'] },
    page: { control: 'text' },
    current: { control: 'boolean' },
    classless: {
      control: 'boolean',
      description:
        'EXPERIMENTAL (#26): a bare `<a href>` inside a `.cf-root` container, no class. The nav variant becomes `nav > ul > li > a` (no page number: that is a class sub-part)',
    },
  },
  args: { label: 'ABOUT', variant: 'inline', page: '', current: false, href: '#', classless: false },
};

export const Inline = { args: { label: 'why I stopped using frameworks' } };
export const Nav = { args: { variant: 'nav', label: 'NEXT PAGE', page: '102' } };
export const CurrentPage = {
  args: { variant: 'nav', label: 'ABOUT', current: true },
  name: 'Selected (aria-current)',
  // Contract: [aria-current="page"] renders the persistent caret (U+25B8) in the
  // accent colour. Assert the caret glyph is present + its colour, not the exact
  // NBSP serialization (which varies).
  play: async ({ canvasElement }) => {
    const a = within(canvasElement).getByRole('link', { current: 'page' });
    const before = getComputedStyle(a, '::before');
    await expect(before.content).toContain(String.fromCharCode(0x25b8));
    await expect(before.color).toBe('rgb(255, 255, 0)'); // --cf-accent = yellow
  },
};

// EXPERIMENTAL (#26): inside an opt-in .cf-root, a bare <a href> looks and behaves like
// cf-link. play() compares it with a cf-link twin; the test-runner gives it the same real
// focus check as Inline.
export const Classless = {
  args: { classless: true, label: 'why I stopped using frameworks' },
  play: async ({ canvasElement }) => {
    const cases = [{}, { 'aria-current': 'page' }, { 'data-variant': 'nav' }];
    await expectSameAsClassForm(canvasElement.querySelector('a'), 'cf-link', LINK_PROPS, cases);
  },
};
// The nav look from structure: the list lays out like cf-cluster with its chrome reset, and
// each link matches a nav-variant cf-link, the current one with its ▸ caret.
export const ClasslessNav = {
  name: 'Classless nav',
  args: { classless: true, variant: 'nav', label: 'HOME', current: true },
  play: async ({ canvasElement }) => {
    const ul = canvasElement.querySelector('ul');
    await expectSameAsClassForm(ul, 'cf-cluster', CLUSTER_PROPS);
    const list = getComputedStyle(ul);
    await expect([list.listStyleType, list.marginTop, list.paddingLeft]).toEqual(['none', '0px', '0px']);
    for (const a of canvasElement.querySelectorAll('a'))
      await expectSameAsClassForm(a, 'cf-link', LINK_PROPS, [{}], { 'data-variant': 'nav' });
    await expect(getComputedStyle(ul.querySelector('[aria-current]'), '::before').content).toContain('\u25B8');
  },
};
// Outside .cf-root a bare link and nav list keep the browser's own look.
export const ClasslessOutsideRoot = {
  name: 'Classless outside .cf-root',
  render: () =>
    outsideRoot((label) => {
      const wrap = document.createElement('div');
      const a = Object.assign(document.createElement('a'), { href: '#', textContent: 'LINK' });
      const home = Object.assign(document.createElement('a'), { href: '#', textContent: 'HOME' });
      wrap.append(a, classlessNav(home, label));
      return wrap;
    }),
  play: async ({ canvasElement }) =>
    expectNoLeak(canvasElement, [
      ['a', LINK_PROPS],
      ['ul', LIST_PROPS],
      ['nav a', LINK_PROPS],
    ]),
};
