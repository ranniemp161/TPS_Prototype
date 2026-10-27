/* Screenshots through the What We Do opening zoom. node lab/opening-shots.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const H = await p.evaluate(() => { const s = document.querySelector('[data-section="hero"]'); return s.offsetHeight; });
  for (const f of [0, 0.5, 1, 1.5, 2, 2.5, 3]) {
    await p.evaluate(y => scrollTo(0, y), Math.round(f * h)); await p.waitForTimeout(1400);
    await p.screenshot({ path: `${out}/op-${w}-${f}.png` });
  }
  console.log(w, 'hero height', H, 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
