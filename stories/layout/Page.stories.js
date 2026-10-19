import { el } from './_demo.js';

export default {
  title: 'Layout/Page',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The **page shell**: `cf-page` with `cf-page__header` / `__body` / `__footer` slots stacks a teletext page ' +
          'into three bands. Use it for any page that wants a pinned masthead and fastext footer. It fills the ' +
          'viewport at whatever aspect ratio the window has. To sit it in a 4:3 TV screen instead, add ' +
          '`data-frame` — see **Layout/Screen**.',
      },
    },
  },
};

const card = (variant, title, body) => {
  const a = el('article', 'cf-card');
  if (variant) a.dataset.variant = variant;
  a.innerHTML =
    '<h3 class="cf-card__title">' + title + '</h3>' +
    '<p class="cf-card__body">' + body + '</p>';
  return a;
};

const fastextKey = (variant, label) => {
  const li = document.createElement('li');
  const a = el('a', 'cf-fastext__key');
  a.dataset.variant = variant;
  a.href = '#';
  a.textContent = label; // colour is never the sole cue
  li.append(a);
  return li;
};

// The teletext page: cf-page shell (header band / grid body / fastext footer),
// composed only from library classes on real landmark elements.
export const TeletextPage = {
  render: () => {
    const page = el('section', 'cf-page');

    // Header band — page number, masthead, clock, laid out as a cluster.
    const header = el('header', 'cf-page__header cf-cluster');
    header.style.justifyContent = 'space-between';
    header.style.padding = '0 var(--cf-space-3)';
    header.append(
      el('span', null, '100'),
      el('strong', null, 'CEEFAX'),
      el('time', null, '16:02:55'),
    );

    // Body — the two-page grid of index cards.
    const body = el('main', 'cf-page__body cf-grid');
    body.dataset.cols = '2';
    body.dataset.gap = '3';
    body.style.padding = 'var(--cf-space-3)';
    body.append(
      card('red', 'NOTICIAS', 'Nacional 102 · Internacional 120 · Deportes 135'),
      card('green', 'DEPORTES', 'Fútbol 201 · Motor 230 · Tenis 240'),
      card('yellow', 'SERVICIOS', 'El Tiempo 301 · Tráfico 600 · Sorteos 460'),
      card('cyan', 'ACCESIBILIDAD', 'Subtitulados 875 · Gaceta 800'),
    );

    // Footer band — the fastext remote keys.
    const footer = el('footer', 'cf-page__footer');
    const nav = el('nav');
    nav.setAttribute('aria-label', 'Fastext');
    const ul = el('ul', 'cf-fastext');
    ul.append(
      fastextKey('red', 'NOTICIAS'),
      fastextKey('green', 'DEPORTES'),
      fastextKey('yellow', 'SERVICIOS'),
      fastextKey('blue', 'SUBTITULADO'),
    );
    nav.append(ul);
    footer.append(nav);

    page.append(header, body, footer);
    return page;
  },
};
