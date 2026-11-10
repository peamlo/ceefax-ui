import { toMosaic, ART } from '/Users/pedroamenguallopez/Documents/projects/ceefax-ui/.claude/worktrees/issue-148-089998/stories/_mosaic.js';
import { writeFileSync } from 'node:fs';
// 4 frames, 2 rows each: art (4 cells) in a colour run + frame number on a band.
const arts = [ART.heart, ART.house, ART.arrow, ART.heart];
const cols = ['red', 'green', 'yellow', 'cyan'];
const strip = arts.map((a, i) => {
  const [r1, r2] = toMosaic(a, i === 3).split('\n');
  return `<span data-variant="${cols[i]}">${r1}</span> ${i + 1}\n<span data-variant="${cols[i]}">${r2}</span> <span data-variant="yellow" data-band="blue">F</span>`;
}).join('\n');
const sep = strip.split('\n').reduce((a, l, i) => a + l + ((i % 2) ? '\n \n' : '\n'), '').slice(0, -1);
const css = `
/* A: wrapper clips, mosaic moves */
.cf-mosaic-frames { display: inline-block; vertical-align: top; height: calc(var(--rows) * 1em); overflow: clip; }
.cf-mosaic-frames > .cf-mosaic { animation: cf-mosaic-frames calc(var(--frames) * var(--frame-time, 500ms)) steps(var(--frames)) infinite; }
/* B: one element, box = one frame, content overflows, clip-path follows translate */
.cf-mosaic[data-frames] { height: calc(var(--rows) * 1em); vertical-align: top;
  animation: cf-mosaic-one calc(var(--frames) * var(--frame-time, 500ms)) steps(var(--frames)) infinite; }
@keyframes cf-mosaic-frames { to { translate: 0 -100%; } }
@keyframes cf-mosaic-one {
  from { translate: 0 0; clip-path: inset(0 0 0 0); }
  to { translate: 0 calc(var(--frames) * -100%); clip-path: inset(calc(var(--frames) * 100%) 0 calc(var(--frames) * -100%) 0); }
}
@media (prefers-reduced-motion: reduce) {
  .cf-mosaic-frames > .cf-mosaic, .cf-mosaic[data-frames] { animation: none; }
}
.once { animation-iteration-count: 1 !important; }
`;
const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/repo/src/index.css"><style>${css}
body{margin:0;padding:16px;background:var(--cf-bg);color:var(--cf-fg)} .row{display:flex;gap:24px;align-items:flex-start;margin-bottom:12px} .lbl{font:12px monospace;color:#888;width:70px}</style>
<div class="row"><span class="lbl">A 20px</span><span id="a" class="cf-mosaic-frames" style="--rows:2;--frames:4;font-size:20px">x<span class="cf-mosaic" aria-hidden="true">${strip}</span></span>
 <span class="lbl">B 20px</span><span id="b" class="cf-mosaic" data-frames style="--rows:2;--frames:4;font-size:20px" aria-hidden="true">${strip}</span>
 <span class="lbl">A once</span><span class="cf-mosaic-frames" style="--rows:2;--frames:4;font-size:20px"><span class="cf-mosaic once" aria-hidden="true">${strip}</span></span></div>
<div class="row"><span class="lbl">A 13.3px</span><span id="af" class="cf-mosaic-frames" style="--rows:2;--frames:4;font-size:13.3px"><span class="cf-mosaic" aria-hidden="true">${strip}</span></span>
 <span class="lbl">B 13.3px</span><span class="cf-mosaic" data-frames style="--rows:2;--frames:4;font-size:13.3px" aria-hidden="true">${strip}</span>
 <span class="lbl">static</span><span class="cf-mosaic" style="font-size:13.3px" aria-hidden="true">${strip}</span></div>
<div class="row"><span class="lbl">A sep 20</span><span id="as" class="cf-mosaic-frames" style="--rows:2;--frames:4;font-size:20px"><span class="cf-mosaic" aria-hidden="true">${sep}</span></span>
 <span class="lbl">B sep 20</span><span class="cf-mosaic" data-frames style="--rows:2;--frames:4;font-size:20px" aria-hidden="true">${sep}</span>
 <span class="lbl">A sep 13.3</span><span id="asf" class="cf-mosaic-frames" style="--rows:2;--frames:4;font-size:13.3px"><span class="cf-mosaic" aria-hidden="true">${sep}</span></span></div>
<p style="font-size:20px">text <span class="cf-mosaic-frames" style="--rows:2;--frames:4"><span class="cf-mosaic" aria-hidden="true">${strip}</span></span> after</p>
`;
writeFileSync('strip.html', html.replace('>x<', '><'));
