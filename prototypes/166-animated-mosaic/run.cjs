const REPO = '/Users/pedroamenguallopez/Documents/projects/ceefax-ui/.claude/worktrees/issue-148-089998';
const { chromium, firefox, webkit } = require(REPO + '/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const types = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => {
  const p = q.url.startsWith('/repo/') ? path.join(REPO, q.url.slice(5)) : path.join(__dirname, q.url);
  fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[path.extname(p)] || '' }); r.end(d); });
}).listen(8765);
const seek = (page, t) => page.evaluate((t) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; } }, t);
(async () => {
  for (const [name, bt] of Object.entries({ chromium, firefox, webkit })) {
    const b = await bt.launch(); const page = await b.newPage({ viewport: { width: 900, height: 360 } });
    await page.goto('http://localhost:8765/strip.html'); await page.evaluate(() => document.fonts.ready);
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const mo = document.querySelector('#a .cf-mosaic'), mf = document.querySelector('#af .cf-mosaic');
      const z = document.createElement('span'); z.className = 'cf-mosaic'; z.style.fontSize = '20px'; z.textContent = '0000000000'; document.body.append(z);
      const g = document.createElement('span'); g.className = 'cf-mosaic'; g.style.fontSize = '20px'; g.textContent = '\u{1FB00}'.repeat(10); document.body.append(g);
      const ch = document.createElement('span'); ch.style.cssText = 'display:inline-block;width:10ch;font-size:20px'; ch.className='cf-mosaic'; document.body.append(ch);
      const out = { stripH20: mo.getBoundingClientRect().height, clipH20: r('#a').height, sepH: document.querySelector('#as .cf-mosaic').getBoundingClientRect().height, stripH133: mf.getBoundingClientRect().height, clipH133: r('#af').height,
        zeros10: z.getBoundingClientRect().width, mosaic10: g.getBoundingClientRect().width, tenCh: ch.getBoundingClientRect().width,
        mosaicFontLoaded: document.fonts.check('20px "Bedstead Mosaic"', '\u{1FB00}') };
      z.remove(); g.remove(); ch.remove(); return out;
    });
    console.log(name, JSON.stringify(m));
    for (const t of [250, 750, 1250, 1750, 499, 500, 501])
      { await seek(page, t); await page.screenshot({ path: `${name}-t${t}.png` }); }
    if (name === 'chromium') {
      await seek(page, 0); await page.evaluate(() => document.getAnimations().forEach((a) => a.play()));
      await page.waitForTimeout(2300);
      console.log('once anims left:', await page.evaluate(() => document.querySelectorAll('.once').length && getComputedStyle(document.querySelector('.once')).translate + ' running=' + document.querySelector('.once').getAnimations().length));
      await page.screenshot({ path: `${name}-once-ended.png` });
      await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(100);
      console.log('reduced anims:', await page.evaluate(() => document.getAnimations().length));
      await page.screenshot({ path: `${name}-reduced.png` });
      await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
      await seek(page, 750); await page.screenshot({ path: `${name}-forced-t750.png` });
      const p2 = await b.newPage({ viewport: { width: 900, height: 360 }, deviceScaleFactor: 2 });
      await p2.goto('http://localhost:8765/strip.html'); await p2.evaluate(() => document.fonts.ready);
      for (const t of [500, 1250]) { await seek(p2, t); await p2.screenshot({ path: `${name}-dpr2-t${t}.png` }); }
    }
    await b.close();
  }
  srv.close();
})();
