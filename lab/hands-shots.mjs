/* Screenshots of the Four Kinds of Care first kind (mother and baby). node lab/hands-shots.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const top = await p.evaluate(() => { const s = document.querySelector('.hd'); return s.getBoundingClientRect().top + scrollY; });
  const steps = w > 860 ? (process.env.HD_STEPS||'0.1,0.3').split(',').map(Number) : (process.env.HD_PSTEPS||'0,0.6').split(',').map(Number);
  for (const f of steps) {
    await p.evaluate(y => scrollTo(0, y), Math.round(top + f * h)); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/hd-${w}-${f}.png` });
  }
  console.log(w, 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
