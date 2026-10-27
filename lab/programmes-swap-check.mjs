/* Programmes: sample the card's swap motion after next and prev. node lab/programmes-swap-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const tx = () => p.evaluate(() => { const s = getComputedStyle(document.querySelector('.pg-price')); return Math.round(new DOMMatrix(s.transform).m41) + 'px op ' + (+s.opacity).toFixed(2) + ' ' + document.querySelector('[data-pg-days]').textContent; });
  for (const btn of ['next', 'prev']) {
    await p.click(`[data-pg-${btn}]`);
    const r = [];
    for (const t of [150, 200, 200, 150, 400]) { await p.waitForTimeout(t); r.push(await tx()); }
    if (btn === 'next') await p.screenshot({ path: `${out}/s${w}.png` });
    console.log(w, btn, r.join(' | '));
  }
  console.log(w, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
