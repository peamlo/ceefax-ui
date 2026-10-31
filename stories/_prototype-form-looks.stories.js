// PROTOTYPE — throwaway. Answers "what should ceefax-ui form controls look like?"
// Round 1 settled: text boxes = ring focus (B); checkbox/radio = [X] glyphs by default,
// drawn blocks with data-variant="box". ?frame=40|60 puts it in the Screen frame.
// Markup uses the proposed contract classes (cf-field, cf-input, cf-textarea, cf-select,
// cf-checkbox, cf-radio); the CSS lives here and is NOT the real implementation. Never merge to main.

const css = `
/* ---------- page bones ---------- */
.proto-form { position: relative; display: grid; gap: var(--cf-space-4); max-width: 44ch; padding-bottom: 5rem; }
.proto-form h1 { font-family: var(--cf-font-display); color: var(--cf-accent); margin: 0; }
.proto-form .row { display: flex; gap: 1ch; align-items: stretch; }
.proto-form .row .cf-input { flex: 1; min-width: 0; }
.proto-states { display: grid; gap: 0.5rem; border-top: var(--cf-border-thin) solid var(--cf-fg); padding-top: 1rem; }
.proto-states h2 { font-family: var(--cf-font-display); color: var(--cf-link); font-size: var(--cf-text-body); margin: 0; }

/* ---------- field ---------- */
.cf-field { display: grid; gap: 0.35rem; }
.cf-field > label, fieldset.cf-field > legend { text-transform: uppercase; letter-spacing: var(--cf-tracking-wide); padding: 0; }
fieldset.cf-field { border: 0; padding: 0; margin: 0; min-inline-size: 0; }
.cf-field__hint { color: var(--cf-fg-dim); font-size: var(--cf-text-small); margin: 0; }
.cf-field__error { color: var(--cf-danger); font-size: var(--cf-text-small); margin: 0; }
.cf-field__error::before { content: '! '; }
.cf-field:has(> label > :is(.cf-checkbox, .cf-radio)) > label { text-transform: none; letter-spacing: 0; display: inline-flex; align-items: center; gap: 1ch; cursor: pointer; }
.proto-opts { display: flex; flex-wrap: wrap; gap: 0.5rem 3ch; }

/* ---------- text boxes: input, textarea (either class), select ---------- */
:is(.cf-input, .cf-textarea, .cf-select) { font: inherit; color: var(--cf-fg); background-color: var(--cf-bg); border: var(--cf-border-thin) solid var(--cf-fg);
  border-radius: var(--cf-radius); line-height: 1.2; padding: 0.4em 1ch; box-sizing: border-box; max-width: 100%; }
textarea:is(.cf-input, .cf-textarea) { resize: vertical; display: block; }
:is(.cf-input, .cf-textarea)::placeholder { color: var(--cf-fg-dim); opacity: 1; }
:is(.cf-input, .cf-textarea, .cf-select):focus-visible { outline: var(--cf-border-thin) solid var(--cf-accent); outline-offset: 2px; border-color: var(--cf-accent); caret-color: var(--cf-accent); }
:is(.cf-input, .cf-textarea, .cf-select):is(:user-invalid, [aria-invalid='true']) { border-color: var(--cf-danger); border-width: 4px; }
:is(.cf-input, .cf-textarea, .cf-select):disabled { opacity: 0.4; cursor: default; }
.cf-select { appearance: none; padding-right: 3ch; cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, currentcolor 50%), linear-gradient(-45deg, transparent 50%, currentcolor 50%);
  background-size: 0.45em 0.45em; background-repeat: no-repeat;
  background-position: calc(100% - 1.6ch) 55%, calc(100% - 1.6ch + 0.45em) 55%; }
.cf-select option { background: var(--cf-bg); color: var(--cf-fg); }

/* ---------- checkbox / radio: glyphs by default ---------- */
:is(.cf-checkbox, .cf-radio) { appearance: none; margin: 0; flex: none; cursor: pointer; font: inherit; color: var(--cf-fg); }
.cf-checkbox::before { content: '[\\00a0]'; }
.cf-checkbox:checked::before { content: '[X]'; color: var(--cf-accent); }
.cf-checkbox:indeterminate::before { content: '[-]'; color: var(--cf-accent); }
.cf-radio::before { content: '(\\00a0)'; }
.cf-radio:checked::before { content: '(*)'; color: var(--cf-accent); }
:is(.cf-checkbox, .cf-radio):focus-visible { outline: var(--cf-border-thin) solid var(--cf-accent); outline-offset: 2px; }
:is(.cf-checkbox, .cf-radio):user-invalid::before { color: var(--cf-danger); }
:is(.cf-checkbox, .cf-radio):disabled { opacity: 0.4; cursor: default; }

/* ---------- data-variant="box": drawn blocks ---------- */
:is(.cf-checkbox, .cf-radio)[data-variant='box'] { width: 1.1em; height: 1.1em; border: var(--cf-border-thin) solid var(--cf-fg); background: var(--cf-bg); }
:is(.cf-checkbox, .cf-radio)[data-variant='box']::before { content: none; }
.cf-radio[data-variant='box'] { border-radius: 50%; }
:is(.cf-checkbox, .cf-radio)[data-variant='box']:checked { border-color: var(--cf-accent); background: var(--cf-accent); box-shadow: inset 0 0 0 3px var(--cf-bg); }
.cf-checkbox[data-variant='box']:indeterminate { background: linear-gradient(var(--cf-accent) 0 0) center / 60% 20% no-repeat var(--cf-bg); border-color: var(--cf-accent); }

/* ---------- switcher (not part of the design) ---------- */
.proto-bar { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 99; display: flex; align-items: center; gap: 8px;
  background: #fff; color: #111; font: 13px/1.2 system-ui, sans-serif; padding: 6px 8px; border-radius: 999px; box-shadow: 0 4px 16px rgb(0 0 0 / 0.5); }
.proto-bar button { font: inherit; border: 1px solid #ccc; background: #f4f4f4; color: #111; border-radius: 999px; padding: 4px 10px; cursor: pointer; }
`;

const formHtml = `
<form class="proto-form" action="#" method="post">
  <h1>VIEWERS' LETTERS</h1>

  <div class="cf-field">
    <label for="p-name">Name</label>
    <input class="cf-input" id="p-name" name="name" autocomplete="name" required size="24">
  </div>

  <div class="cf-field">
    <label for="p-email">Email</label>
    <input class="cf-input" id="p-email" type="email" name="email" autocomplete="email" required placeholder="you@example.com" aria-describedby="p-email-hint">
    <p class="cf-field__hint" id="p-email-hint">We only use it to reply.</p>
  </div>

  <div class="cf-field">
    <label for="p-postcode">Postcode</label>
    <input class="cf-input" id="p-postcode" name="postcode" autocomplete="postal-code" size="8" value="W12 7RJX" aria-invalid="true" aria-describedby="p-postcode-err">
    <p class="cf-field__error" id="p-postcode-err">Enter a postcode like W12 7RJ.</p>
  </div>

  <div class="cf-field">
    <label for="p-region">Region</label>
    <select class="cf-select" id="p-region" name="region">
      <option>London</option><option>Scotland</option><option>Wales</option><option>Northern Ireland</option>
    </select>
  </div>

  <fieldset class="cf-field">
    <legend>Channel</legend>
    <div class="proto-opts">
      <div class="cf-field"><label><input class="cf-radio" type="radio" name="ch" value="1" checked> BBC1</label></div>
      <div class="cf-field"><label><input class="cf-radio" type="radio" name="ch" value="2"> BBC2</label></div>
      <div class="cf-field"><label><input class="cf-radio" type="radio" name="ch" value="x" disabled> OFF AIR</label></div>
    </div>
  </fieldset>

  <div class="cf-field">
    <label for="p-msg">Letter (cf-textarea)</label>
    <textarea class="cf-textarea" id="p-msg" name="msg" rows="4" cols="40" required minlength="20"></textarea>
  </div>

  <div class="cf-field">
    <label for="p-ps">PS (textarea.cf-input, same look)</label>
    <textarea class="cf-input" id="p-ps" name="ps" rows="2" cols="40"></textarea>
  </div>

  <fieldset class="cf-field">
    <legend>Options, default glyphs</legend>
    <div class="cf-field"><label><input class="cf-checkbox" type="checkbox" name="publish" checked> Publish my letter</label></div>
    <div class="cf-field"><label><input class="cf-checkbox" type="checkbox" name="news"> Send me the newsletter</label></div>
  </fieldset>

  <fieldset class="cf-field">
    <legend>Options, data-variant="box"</legend>
    <div class="cf-field"><label><input class="cf-checkbox" data-variant="box" type="checkbox" name="publish2" checked> Publish my letter</label></div>
    <div class="cf-field"><label><input class="cf-checkbox" data-variant="box" type="checkbox" name="news2"> Send me the newsletter</label></div>
    <div class="cf-field"><label><input class="cf-radio" data-variant="box" type="radio" name="ch2" checked> BBC1</label></div>
    <div class="cf-field"><label><input class="cf-radio" data-variant="box" type="radio" name="ch2"> BBC2</label></div>
  </fieldset>

  <div class="cf-field">
    <label><input class="cf-checkbox" type="checkbox" name="terms" required> I agree to the terms</label>
  </div>

  <div class="row">
    <button class="cf-btn" type="submit" data-variant="green">SEND LETTER</button>
    <button class="cf-btn" type="reset" data-variant="ghost">Clear</button>
  </div>

  <search class="row">
    <input class="cf-input" type="search" name="q" placeholder="SEARCH PAGES" aria-label="Search pages" size="16">
    <button class="cf-btn" type="button">GO</button>
  </search>

  <section class="proto-states" aria-label="Indeterminate and disabled">
    <h2>MORE STATES</h2>
    <input class="cf-input" value="DISABLED" disabled aria-label="disabled">
    <div class="proto-opts">
      <label><input class="cf-checkbox is-mixed" type="checkbox"> mixed</label>
      <label><input class="cf-checkbox is-mixed" data-variant="box" type="checkbox"> mixed box</label>
      <label><input class="cf-checkbox" type="checkbox" disabled checked> disabled</label>
    </div>
  </section>
</form>`;

const header = `
<header class="cf-page__header cf-header-row">
  <span class="cf-header-row__page">P199</span><span class="cf-header-row__service">CEEFAX</span>
  <span class="cf-header-row__rolling">199</span>
  <time class="cf-header-row__time" datetime="2026-10-30T16:02:55"><span class="cf-header-row__date">Oct30</span> 16:02:55</time>
</header>`;

export default { title: 'Prototype/Form looks', tags: ['!autodocs', '!test'], parameters: { layout: 'fullscreen' } };

export const Looks = {
  render: () => {
    const FRAMES = ['', '40', '60'];
    const params = new URLSearchParams(location.search);
    let frame = FRAMES.includes(params.get('frame')) ? params.get('frame') : '';

    const root = document.createElement('div');
    root.innerHTML = `<style>${css}</style>
      <section class="cf-page">${header}
        <main class="cf-page__body" tabindex="0" style="padding: var(--cf-space-3)">${formHtml}</main>
      </section>
      <div class="proto-bar" role="toolbar" aria-label="Prototype switcher">
        <button type="button" data-proto-frame>Frame: off</button>
      </div>`;
    root.querySelectorAll('.is-mixed').forEach((i) => (i.indeterminate = true));
    // Native validation still runs on submit; nothing is sent.
    root.querySelector('form').addEventListener('submit', (e) => e.preventDefault());

    const page = root.querySelector('.cf-page');
    const frameBtn = root.querySelector('[data-proto-frame]');
    const apply = () => {
      if (frame) page.dataset.frame = '';
      else delete page.dataset.frame;
      if (frame === '60') page.dataset.cells = '60';
      else delete page.dataset.cells;
      frameBtn.textContent = `Frame: ${frame ? `${frame} cells` : 'off'}`;
      const p = new URLSearchParams(location.search);
      if (frame) p.set('frame', frame);
      else p.delete('frame');
      history.replaceState(null, '', `?${p}`);
    };
    frameBtn.addEventListener('click', () => {
      frame = FRAMES[(FRAMES.indexOf(frame) + 1) % FRAMES.length];
      apply();
    });
    apply();
    return root;
  },
};

// ---------- Round 3: color-scheme, and the name/shape of the drawn checkbox/radio variant ----------
const r3css = `
.r3 { display: grid; gap: 2.5rem; padding: var(--cf-space-3); padding-bottom: 5rem; }
.r3 h1 { font-family: var(--cf-font-display); color: var(--cf-accent); margin: 0; }
.r3 h2 { font-family: var(--cf-font-display); color: var(--cf-link); font-size: var(--cf-text-body); margin: 0 0 0.5rem; }
.r3 .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(22ch, 1fr)); gap: 3ch; }
.r3 .panel { display: grid; gap: 0.75rem; align-content: start; border: var(--cf-border-thin) dashed var(--cf-fg-dim); padding: 1rem; }
.r3 .panel > .cf-input, .r3 .panel > .cf-textarea, .r3 .panel > .cf-select { width: 100%; }
.r3 .note { color: var(--cf-fg-dim); font-size: var(--cf-text-small); margin: 0; }
.r3 .opts { display: flex; flex-wrap: wrap; gap: 0.75rem 3ch; }
.r3 .opts label { display: inline-flex; align-items: center; gap: 1ch; }
.r3 code { color: var(--cf-accent); }
/* stepped "pixel circle" radio: a stepped circle, as teletext mosaics can't draw a true circle */
.r3 .cf-radio.oct { --oct: polygon(25% 0, 75% 0, 75% 12.5%, 87.5% 12.5%, 87.5% 25%, 100% 25%, 100% 75%, 87.5% 75%, 87.5% 87.5%, 75% 87.5%, 75% 100%, 25% 100%, 25% 87.5%, 12.5% 87.5%, 12.5% 75%, 0 75%, 0 25%, 12.5% 25%, 12.5% 12.5%, 25% 12.5%);
  position: relative; width: 1.1em; height: 1.1em; border: 0; border-radius: 0; clip-path: var(--oct); background: var(--cf-fg); box-shadow: none; }
.r3 .cf-radio.oct::before { content: ''; position: absolute; inset: 2px; clip-path: var(--oct); background: var(--cf-bg); }
.r3 .cf-radio.oct:checked { background: var(--cf-accent); }
.r3 .cf-radio.oct:checked::after { content: ''; position: absolute; inset: 5px; clip-path: var(--oct); background: var(--cf-accent); }
`;

const schemePanel = (scheme) => `
  <div class="panel" style="color-scheme: ${scheme}">
    <h2>color-scheme: ${scheme}${scheme === 'light' ? ' (today)' : ' (proposed)'}</h2>
    <label for="d-${scheme}">Date (calendar icon)</label>
    <input class="cf-input" id="d-${scheme}" type="date" value="2026-10-31">
    <label for="t-${scheme}">Time (clock icon)</label>
    <input class="cf-input" id="t-${scheme}" type="time" value="16:02">
    <label for="n-${scheme}">Number (spinners on hover)</label>
    <input class="cf-input" id="n-${scheme}" type="number" value="199">
    <label for="s-${scheme}">Search (clear ✕ on focus)</label>
    <input class="cf-input" id="s-${scheme}" type="search" value="WEATHER">
    <label for="ta-${scheme}">Textarea (scrollbar + resize grip)</label>
    <textarea class="cf-textarea" id="ta-${scheme}" rows="3">${'LINE OF TEXT\n'.repeat(10)}</textarea>
    <label for="sel-${scheme}">Select (open it: the list)</label>
    <select class="cf-select" id="sel-${scheme}"><option>London</option><option>Scotland</option><option>Wales</option></select>
  </div>`;

const variantRow = (attr, radioClass, title, note) => `
  <div class="panel">
    <h2>${title}</h2>
    <div class="opts">
      <label><input class="cf-checkbox" ${attr} type="checkbox" checked> on</label>
      <label><input class="cf-checkbox" ${attr} type="checkbox"> off</label>
      <label><input class="cf-radio ${radioClass}" ${attr} type="radio" name="r-${title}" checked> on</label>
      <label><input class="cf-radio ${radioClass}" ${attr} type="radio" name="r-${title}"> off</label>
    </div>
    <p class="note">${note}</p>
  </div>`;

export const Round3 = {
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = `<style>${css}${r3css}</style>
      <section class="cf-page">${header}
        <main class="cf-page__body r3" tabindex="0">
          <h1>ROUND 3</h1>
          <section>
            <h2>Q4 · same CSS, only color-scheme differs. Hover / focus / open each control.</h2>
            <div class="cols">${schemePanel('light')}${schemePanel('dark')}</div>
          </section>
          <section>
            <h2>Q2 · the drawn variant: name and radio shape</h2>
            <div class="cols">
              ${variantRow('', '', 'default (no attribute)', 'Text glyphs. Stays the default.')}
              ${variantRow('data-variant="box"', '', 'data-variant="box", round radio', 'The name you rejected: a radio is not a box.')}
              ${variantRow('data-variant="box"', 'oct', 'stepped "pixel circle" radio', 'Teletext mosaics have no curves, so a radio becomes a stepped circle. Same look under any name.')}
            </div>
          </section>
        </main>
      </section>`;
    return root;
  },
};
