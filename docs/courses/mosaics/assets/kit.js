// Shared lesson widgets for docs/courses/mosaics. A classic script (not a module) so lessons work
// opened straight from disk. Same formula as stories/_mosaic.js, plus its inverse.
(() => {
  const BLOCKS = [1, 2, 4, 8, 16, 32]; // top-left, top-right, middle-left, … bottom-right

  // Sum (0–63) → character. Mirrors cell() in stories/_mosaic.js.
  const char = (sum, separated = false) => {
    if (!sum) return ' ';
    if (separated) return String.fromCodePoint(0x1ce51 + sum - 1);
    if (sum === 21) return '▌';
    if (sum === 42) return '▐';
    if (sum === 63) return '█';
    return String.fromCodePoint(0x1fb00 + sum - 1 - (sum > 21) - (sum > 42));
  };

  // Character → sum, or null if it isn't a mosaic.
  const sum = (ch) => {
    const cp = ch.codePointAt(0);
    if (ch === ' ') return 0;
    if (ch === '▌') return 21;
    if (ch === '▐') return 42;
    if (ch === '█') return 63;
    if (cp >= 0x1ce51 && cp <= 0x1ce8f) return cp - 0x1ce51 + 1;
    if (cp >= 0x1fb00 && cp <= 0x1fb3b) {
      let s = cp - 0x1fb00 + 1;
      if (s >= 21) s++;
      if (s >= 42) s++;
      return s;
    }
    return null;
  };

  const hex = (ch) => (ch === ' ' ? 'space' : 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'));

  // One cell as six blocks.
  const cellEl = (s, label) => {
    const el = document.createElement('span');
    el.className = 'cell';
    if (label) el.dataset.sum = s;
    for (const b of BLOCKS) {
      const i = document.createElement('i');
      if (s & b) i.classList.add('on');
      el.append(i);
    }
    return el;
  };

  // <div data-explode data-labels>mosaic text</div> → the same text, drawn as blocks.
  const explode = (host) => {
    const text = host.textContent.replace(/^\n|\n$/g, '');
    const labels = host.hasAttribute('data-labels');
    const grid = document.createElement('div');
    grid.className = 'cells' + (labels ? ' labelled' : '');
    for (const line of text.split('\n')) {
      const row = document.createElement('div');
      row.className = 'row';
      for (const ch of line) row.append(cellEl(sum(ch) ?? 0, labels));
      grid.append(row);
    }
    host.replaceChildren(grid);
  };

  // <button data-together="id"> pushes the exploded cells of #id together and apart again.
  const togglers = () => {
    for (const btn of document.querySelectorAll('[data-together]')) {
      btn.addEventListener('click', () => {
        const grid = document.getElementById(btn.dataset.together).querySelector('.cells');
        const together = grid.classList.toggle('together');
        btn.textContent = together ? 'Pull the cells apart' : 'Push the cells together';
      });
    }
  };

  // The arithmetic from a sum to its code points, as [step, value] rows (lesson 3): find the
  // sum's range, subtract, write the offset in hex.
  const OLD = { 21: 'LEFT HALF BLOCK', 42: 'RIGHT HALF BLOCK', 63: 'FULL BLOCK' };
  const RANGES = ['1–20', '22–41', '43–62'];
  const steps = (s) => {
    if (!s)
      return [
        ['sum', '0'],
        ['character', 'a space'],
      ];
    const sep = ['separated', `U+1CE51 + ${s - 1} = ${hex(char(s, true))}`];
    if (OLD[s])
      return [['sum', s], ['range', 'not in the row'], ['older character', OLD[s]], ['code point', hex(char(s))], sep];
    const k = 1 + (s > 21) + (s > 42);
    const off = s - k;
    return [
      ['sum', s],
      ['range', `${RANGES[k - 1]}: sum − ${k}`],
      ['offset', `${s} − ${k} = ${off}`],
      ['in hex', `${Math.floor(off / 16)} × 16 + ${off % 16} = 0x${off.toString(16).toUpperCase().padStart(2, '0')}`],
      ['code point', hex(char(s))],
      sep,
    ];
  };

  // <div data-builder></div>: click blocks, read the sum, code point and glyph.
  // data-steps shows the arithmetic from sum to code point instead.
  const builder = (host) => {
    host.classList.add('builder');
    host.innerHTML =
      '<div class="pad" role="group" aria-label="The six blocks of one cell"></div>' +
      '<dl><dt>sum</dt><dd data-out="sum"></dd><dt>code point</dt><dd data-out="cp"></dd>' +
      '<dt>separated</dt><dd data-out="sep"></dd></dl>' +
      '<span class="glyphs big" data-out="glyph" aria-hidden="true"></span>';
    const pad = host.querySelector('.pad');
    let s = Number(host.dataset.start || 0);
    const out = (k) => host.querySelector(`[data-out="${k}"]`);
    const dl = host.querySelector('dl');
    const render = () => {
      for (const btn of pad.children) btn.setAttribute('aria-pressed', String(Boolean(s & Number(btn.value))));
      const c = char(s);
      out('glyph').textContent = c;
      if (host.hasAttribute('data-steps')) {
        dl.innerHTML = steps(s)
          .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
          .join('');
        return;
      }
      out('sum').textContent = s;
      out('cp').textContent = hex(c);
      out('sep').textContent = hex(char(s, true));
    };
    for (const b of BLOCKS) {
      const btn = document.createElement('button');
      btn.value = b;
      btn.textContent = b;
      btn.addEventListener('click', () => {
        s ^= b;
        render();
      });
      pad.append(btn);
    }
    render();
  };

  // <div class="quiz" data-answer="2" data-explain="…"><div class="options"><button>…</button>…
  // The options are cf-btn: a wrong pick is disabled so you can try again; the right one turns green.
  const quiz = (host) => {
    const buttons = [...host.querySelectorAll('.options button')];
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('aria-live', 'polite');
    host.append(feedback);
    buttons.forEach((btn, i) => {
      asButton(btn);
      btn.addEventListener('click', () => {
        if (i === Number(host.dataset.answer)) {
          btn.dataset.variant = 'green';
          buttons.forEach((b) => b !== btn && (b.disabled = true));
          feedback.className = 'feedback right';
          feedback.textContent = 'Yes. ' + (host.dataset.explain || '');
        } else {
          btn.disabled = true;
          feedback.className = 'feedback wrong';
          feedback.textContent = 'Not that one. Try again.';
        }
      });
    });
  };

  // <div data-inspect="A€🬀"></div>: type or paste text, see each character's code point, and the
  // cell a mosaic character draws.
  const inspect = (host) => {
    host.classList.add('inspect');
    host.innerHTML =
      '<label>Text <input class="cf-input" type="text" spellcheck="false" autocomplete="off"></label>' +
      '<table><thead><tr><th>character</th><th>code point</th><th>draws</th></tr></thead><tbody></tbody></table>';
    const input = host.querySelector('input');
    const body = host.querySelector('tbody');
    input.value = host.dataset.inspect || '';
    const render = () => {
      body.replaceChildren();
      for (const ch of [...input.value].slice(0, 40)) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><span class="glyphs"></span></td><td></td><td></td>';
        tr.querySelector('.glyphs').textContent = ch === ' ' ? '␠' : ch;
        tr.children[1].textContent = ch === ' ' ? 'U+0020' : hex(ch);
        const s = sum(ch);
        if (s) tr.children[2].append(cellEl(s, false));
        else tr.children[2].textContent = ch === ' ' ? 'empty cell' : 'not a mosaic';
        body.append(tr);
      }
    };
    input.addEventListener('input', render);
    render();
  };

  // <div data-hex></div>: a dial over the first 60 seats from U+1FB00, in decimal and hex.
  const hexDial = (host) => {
    host.classList.add('hexdial');
    host.innerHTML =
      '<label>offset <input type="range" min="0" max="59" value="19"></label>' +
      '<dl><dt>decimal</dt><dd data-out="dec"></dd><dt>hex</dt><dd data-out="hex"></dd>' +
      '<dt>as 16s + 1s</dt><dd data-out="parts"></dd><dt>code point</dt><dd data-out="cp"></dd></dl>' +
      '<span class="glyphs big" data-out="glyph" aria-hidden="true"></span>';
    const input = host.querySelector('input');
    const out = (k) => host.querySelector(`[data-out="${k}"]`);
    const render = () => {
      const n = Number(input.value);
      const h = n.toString(16).toUpperCase().padStart(2, '0');
      out('dec').textContent = n;
      out('hex').textContent = '0x' + h;
      out('parts').textContent = `${Math.floor(n / 16)} × 16 + ${n % 16} = ${n}`;
      out('cp').textContent = `U+1FB00 + 0x${h} = U+1FB${h}`;
      out('glyph').textContent = String.fromCodePoint(0x1fb00 + n);
    };
    input.addEventListener('input', render);
    render();
  };

  // <div data-drill></div>: endless decimal ↔ hex practice, 0–255, with the worked method as feedback.
  const drill = (host) => {
    host.classList.add('drill');
    host.innerHTML =
      '<p class="drill-q"></p>' +
      '<form><input class="cf-input" autocomplete="off" spellcheck="false" aria-label="Your answer">' +
      '<button class="cf-btn" data-size="sm">Check</button><button class="cf-btn" data-size="sm" type="button" data-next>Next</button></form>' +
      '<p class="feedback" aria-live="polite"></p><p class="streak"></p>';
    const [q, form, feedback, streakEl] = host.children;
    const input = form.querySelector('input');
    let n,
      toHex,
      done,
      streak = 0;
    const hx = (v) => v.toString(16).toUpperCase().padStart(2, '0');
    const digit = (d) => (d > 9 ? `${d} (${hx(d).slice(1)})` : String(d));
    const method = () =>
      toHex
        ? `${n} ÷ 16 = ${digit(Math.floor(n / 16))} remainder ${digit(n % 16)}, so 0x${hx(n)}.`
        : `${digit(Math.floor(n / 16))} × 16 + ${digit(n % 16)} = ${n}.`;
    const next = (focus) => {
      n = Math.floor(Math.random() * 256);
      toHex = Math.random() < 0.5;
      done = false;
      q.innerHTML = toHex ? `<strong>${n}</strong> in hex?` : `<strong>0x${hx(n)}</strong> in decimal?`;
      input.value = '';
      input.placeholder = toHex ? 'e.g. 0x2D' : 'e.g. 45';
      feedback.textContent = '';
      if (focus === true) input.focus();
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (done) return next(true);
      const a = input.value.trim().replace(/^0x/i, '');
      if (!a) return;
      const right = toHex ? /^[0-9a-f]+$/i.test(a) && parseInt(a, 16) === n : Number(a) === n;
      streak = right ? streak + 1 : 0;
      feedback.textContent = (right ? 'Yes: ' : 'Not quite: ') + method();
      feedback.className = 'feedback ' + (right ? 'right' : 'wrong');
      streakEl.textContent = streak > 1 ? `${streak} in a row` : '';
      done = true;
    });
    form.querySelector('[data-next]').addEventListener('click', () => next(true));
    next();
  };

  // <div data-css-lab>mosaic text</div>: the mosaic beside text, with a switch per declaration in
  // mosaic.css. Turning one off adds its .no-* class (course.css), which puts the browser default back.
  const LAB = [
    ['no-font', "font-family: 'Bedstead Mosaic', …"],
    ['no-pre', 'white-space: pre'],
    ['no-lh', 'line-height: 1'],
    ['no-ls', 'letter-spacing: 0'],
    ['no-ib', 'display: inline-block'],
  ];
  const cssLab = (host) => {
    const text = host.textContent.replace(/^\n|\n$/g, '');
    host.classList.add('lab');
    host.innerHTML =
      '<fieldset><legend>mosaic.css</legend>' +
      LAB.map(
        ([cls, decl]) =>
          `<label><input class="cf-checkbox" type="checkbox" checked value="${cls}"> <code>${decl}</code></label>`,
      ).join('') +
      '</fieldset><div class="screen"><p class="lab-line">Weather <span class="glyphs" role="img" aria-label="CF"></span> page 401, the forecast for your area.</p></div>';
    const glyphs = host.querySelector('.glyphs');
    glyphs.textContent = text;
    for (const box of host.querySelectorAll('input')) {
      box.addEventListener('change', () => glyphs.classList.toggle(box.value, !box.checked));
    }
  };

  // <div data-edit data-row="2" data-col="5" data-target="1FB3A 1FB39" data-done="…">mosaic text</div>:
  // retype some cells of one row as code points (U+1FB39, &#x1FB39; or 1FB39) and watch the mosaic
  // redraw; Check compares them with the target, cell by cell.
  const edit = (host) => {
    const lines = host.textContent.replace(/^\n|\n$/g, '').split('\n');
    const row = Number(host.dataset.row);
    const col = Number(host.dataset.col);
    const target = host.dataset.target.split(' ').map((h) => parseInt(h, 16));
    const start = [...lines[row]]
      .slice(col, col + target.length)
      .map(hex)
      .join(' ');
    host.classList.add('edit');
    host.innerHTML =
      '<label>Code points <input class="cf-input" spellcheck="false" autocomplete="off"></label>' +
      '<div class="screen"><span class="glyphs big"></span><div class="edit-row"></div></div>' +
      '<button class="cf-btn" data-size="sm">Check</button><p class="feedback" aria-live="polite"></p>';
    const input = host.querySelector('input');
    const glyphs = host.querySelector('.glyphs');
    const cellsRow = host.querySelector('.edit-row');
    const feedback = host.querySelector('.feedback');
    input.value = start;
    const typed = () => [...input.value.matchAll(/(?:U\+|&#x|\\u\{)?([0-9a-f]{4,5})/gi)].map((m) => parseInt(m[1], 16));
    const render = () => {
      const chars = typed().map((cp) => String.fromCodePoint(cp));
      const line = [...lines[row]];
      line.splice(col, target.length, ...chars);
      glyphs.textContent = lines.map((l, i) => (i === row ? line.join('') : l)).join('\n');
      cellsRow.replaceChildren(...chars.map((c) => cellEl(sum(c) ?? 0, true)));
      feedback.textContent = '';
    };
    host.querySelector('button').addEventListener('click', () => {
      const cps = typed();
      if (cps.length !== target.length) {
        feedback.textContent = `That's ${cps.length} code points; the row needs ${target.length}.`;
        return;
      }
      const wrong = cps
        .map((cp, i) => [i, cp])
        .filter(([i, cp]) => cp !== target[i])
        .map(([i, cp]) => {
          const s = sum(String.fromCodePoint(cp));
          return `cell ${i + 1} draws ${s === null ? 'no mosaic' : `sum ${s}`}`;
        });
      feedback.textContent = wrong.length ? `Not yet: ${wrong.join(', ')}.` : 'Yes. ' + (host.dataset.done || '');
    });
    input.addEventListener('input', render);
    render();
  };

  // The library's small button, for buttons written in the lessons (class="toggle") or by a widget.
  const asButton = (b) => {
    b.classList.add('cf-btn');
    b.dataset.size = 'sm';
  };

  // The Accessible palette switch, at the top of every page. data-theme goes on <html> so every token
  // follows; the choice is remembered in this browser only.
  const KEY = 'learn-mosaics-palette';
  const store = {
    get: () => {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    set: (v) => {
      try {
        localStorage.setItem(KEY, v);
      } catch {
        // Storage blocked (private window): the switch still works on this page.
      }
    },
  };
  const setPalette = (accessible) => {
    if (accessible) document.documentElement.dataset.theme = 'accessible';
    else delete document.documentElement.dataset.theme;
  };
  setPalette(store.get() === 'accessible');
  const paletteToggle = () => {
    const col = document.querySelector('.cf-page__body > .cf-center');
    if (!col) return;
    const wrap = document.createElement('p');
    wrap.className = 'palette-toggle';
    const btn = document.createElement('button');
    btn.type = 'button';
    asButton(btn);
    const render = () => {
      const on = document.documentElement.dataset.theme === 'accessible';
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = `Accessible palette: ${on ? 'on' : 'off'}`;
    };
    btn.addEventListener('click', () => {
      const on = document.documentElement.dataset.theme !== 'accessible';
      setPalette(on);
      store.set(on ? 'accessible' : 'teletext');
      render();
    });
    render();
    wrap.append(btn);
    col.prepend(wrap);
  };

  window.Mosaic = { char, sum, hex };
  const init = () => {
    paletteToggle();
    document.querySelectorAll('button.toggle').forEach(asButton);
    document.querySelectorAll('[data-explode]').forEach(explode);
    document.querySelectorAll('[data-builder]').forEach(builder);
    document.querySelectorAll('.quiz').forEach(quiz);
    document.querySelectorAll('[data-inspect]').forEach(inspect);
    document.querySelectorAll('[data-hex]').forEach(hexDial);
    document.querySelectorAll('[data-drill]').forEach(drill);
    document.querySelectorAll('[data-css-lab]').forEach(cssLab);
    document.querySelectorAll('[data-edit]').forEach(edit);
    togglers();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
