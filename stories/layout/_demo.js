// Small helpers so the Layout stories stay readable. Children are rendered as
// real bordered boxes purely so the primitive's arrangement is visible — the
// layout classes themselves add no visuals.

export const el = (tag, className, html) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html != null) n.innerHTML = html;
  return n;
};

// A visible placeholder cell. `tag` lets callers keep the DOM semantic
// (<li> inside a cluster, <article> inside a grid, …).
export const box = (label, tag = 'div') => {
  const n = document.createElement(tag);
  n.textContent = label;
  n.style.cssText =
    'border:var(--cf-border-thin) solid var(--cf-border);padding:var(--cf-space-2) var(--cf-space-3);' +
    'font-family:var(--cf-font-mono);color:var(--cf-fg);background:var(--cf-bg)';
  return n;
};

// A labelled block above a demo, so multiple variants read clearly on one page.
export const caption = (text) => {
  const p = el('p');
  p.textContent = text;
  p.style.cssText =
    'font-family:var(--cf-font-mono);color:var(--cf-accent);margin:var(--cf-space-4) 0 var(--cf-space-2)';
  return p;
};
