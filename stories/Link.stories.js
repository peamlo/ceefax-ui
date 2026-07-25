export default {
  title: 'Components/Link',
  tags: ['autodocs'],
  render: ({ label, variant, page, current, href }) => {
    const a = document.createElement('a');
    a.className = 'cf-link';
    a.href = href || '#';
    if (variant === 'nav') {
      a.dataset.variant = 'nav';
      if (page) { const s = document.createElement('span'); s.className = 'cf-link__page'; s.textContent = 'p.' + page; a.appendChild(s); }
      const t = document.createElement('span'); t.textContent = label; a.appendChild(t);
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
  },
  args: { label: 'ABOUT', variant: 'inline', page: '', current: false, href: '#' },
};

export const Inline = { args: { label: 'why I stopped using frameworks' } };
export const Nav = { args: { variant: 'nav', label: 'NEXT PAGE', page: '102' } };
export const CurrentPage = { args: { variant: 'nav', label: 'ABOUT', current: true }, name: 'Selected (aria-current)' };
