// Opens each header panel and shoots it (Opus, 1 Nov 2026): home and an inner
// page, 1440 and 1920 wide, at the top and scrolled (header folded), plus the
// phone Menu at 390. Reports panel box vs the tab word's left edge.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
const url = f => pathToFileURL(path.join(process.cwd(), 'index', f)).href;
for (const page of ['index.html', 'programmes.html']) {
  for (const w of [1440, 1920]) {
    for (const scrolled of [false, true]) {
      for (const name of ['what-we-do', 'offerings', 'about']) {
        const p = await b.newPage({ viewport: { width: w, height: 900 } });
        await p.goto(url(page));
        await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
        if (scrolled) { for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 150); await p.waitForTimeout(60); } await p.waitForTimeout(900); }
        await p.locator(`.tab[data-tab="${name}"]`).click();
        await p.waitForTimeout(900);
        const r = await p.evaluate(n => {
          const tab = document.querySelector(`.tab[data-tab="${n}"]`); const m = document.querySelector('[data-menu]');
          const t = tab.getBoundingClientRect(); const q = m.getBoundingClientRect();
          const word = t.left + parseFloat(getComputedStyle(tab).paddingLeft);
          const link = m.querySelector('.menu__panel:not([hidden]) .menu__list a').getBoundingClientRect();
          return `tab word x ${word.toFixed(0)} | link x ${link.left.toFixed(0)} | panel ${q.left.toFixed(0)}..${q.right.toFixed(0)} w ${q.width.toFixed(0)} h ${q.height.toFixed(0)} top ${q.top.toFixed(0)}`;
        }, name);
        console.log(page.padEnd(16), w, scrolled ? 'scrolled' : 'top     ', name.padEnd(11), r);
        if (name === 'offerings' || (w === 1440 && !scrolled)) await p.screenshot({ path: path.join(OUT, `menu-${page.replace('.html', '')}-${w}-${scrolled ? 's' : 't'}-${name}.png`), clip: { x: 0, y: 0, width: w, height: 420 } });
        await p.close();
      }
    }
  }
}
// phone: unchanged full width panel
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(url('index.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
await p.locator('[data-burger]').click(); await p.waitForTimeout(900);
const r = await p.evaluate(() => { const q = document.querySelector('[data-menu]').getBoundingClientRect(); return `phone panel ${q.left}..${q.right} w ${q.width}`; });
console.log(r);
await p.screenshot({ path: path.join(OUT, 'menu-phone-390.png') });
await b.close();
