/* Who Comes Into Your Home redesign (19 Oct 2026): open at scroll zero, wheel
   down the whole page, screenshot every 0.7 screen. node lab/who-redesign-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/who-comes-into-your-home.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
  await p.mouse.move(w / 2, h / 2);
  let i = 0;
  while (true) {
    await p.screenshot({ path: `${out}/r${w}-${String(i).padStart(2, '0')}.png` }); i++;
    const done = await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
    if (done || i > 40) break;
    for (let k = 0; k < 7; k++) { await p.mouse.wheel(0, Math.round(h * 0.1)); await p.waitForTimeout(60); }
    await p.waitForTimeout(1100);
  }
  const m = await p.evaluate(() => ({ H: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth - innerWidth, lit: document.querySelectorAll('.is-lit').length }));
  console.log(w, 'shots', i, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
