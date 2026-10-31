export default {
  title: 'Components/Card',
  tags: ['autodocs', 'contract'],
  parameters: { a11y: { test: 'error' } }, // in the axe gate under both themes (ADR-0006)
  render: ({ title, body, variant }) => {
    const card = document.createElement('article');
    card.className = 'cf-card';
    if (variant) card.dataset.variant = variant;
    const h = document.createElement('h3');
    h.className = 'cf-card__title';
    h.textContent = title;
    const p = document.createElement('p');
    p.className = 'cf-card__body';
    p.textContent = body;
    card.append(h, p);
    return card;
  },
  argTypes: {
    title: { control: 'text' },
    body: { control: 'text' },
    variant: { control: 'select', options: ['', 'red', 'green', 'yellow', 'blue', 'cyan', 'magenta'] },
  },
  args: {
    title: 'P100 HEADLINES',
    body: 'Border-only box on the flat page. No shadow, no radius, no fill gradient.',
    variant: '',
  },
};

export const Default = {};
export const Red = { args: { variant: 'red', title: 'BREAKING', body: 'Red border for urgent bulletins.' } };
export const Green = { args: { variant: 'green', title: 'POSTS', body: 'Green border for the writing index.' } };
export const Yellow = { args: { variant: 'yellow', title: 'ABOUT', body: 'Yellow border, the accent colour.' } };
export const Cyan = { args: { variant: 'cyan', title: 'LINKS', body: 'Cyan border for reference pages.' } };

export const Grid = {
  name: 'Grid of variants',
  render: () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1ch';
    [
      ['red', 'BREAKING'],
      ['green', 'POSTS'],
      ['yellow', 'ABOUT'],
      ['blue', 'CONTACT'],
      ['cyan', 'LINKS'],
      ['magenta', 'ARCHIVE'],
    ].forEach(([variant, title]) => {
      const card = document.createElement('article');
      card.className = 'cf-card';
      card.dataset.variant = variant;
      card.innerHTML =
        '<h3 class="cf-card__title">' +
        title +
        '</h3>' +
        '<p class="cf-card__body">' +
        variant +
        ' border variant.</p>';
      wrap.appendChild(card);
    });
    return wrap;
  },
};
