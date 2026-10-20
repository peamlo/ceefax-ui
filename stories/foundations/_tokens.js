// Shared helpers so every Foundations page reads its values live from the design
// tokens on :root — this documentation can never drift from src/tokens/*.css.
export const css = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// A white page container in the Space Mono body face.
export const page = (html = '') => {
  const d = document.createElement('div');
  d.style.cssText = 'color:var(--cf-fg);font-family:Space Mono,monospace;font-size:15px';
  d.innerHTML = html;
  return d;
};

export const heading = (text) => {
  const h = document.createElement('h3');
  h.style.cssText = 'font-family:VT323,monospace;font-size:32px;color:var(--cf-accent);margin:24px 0 8px';
  h.textContent = text;
  return h;
};

// Resolve a value that may be a var() alias down to a concrete colour string.
export const resolveColor = (value) => {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
};
