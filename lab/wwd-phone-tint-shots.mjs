/* What We Do phones: frame top against the header, and the ember wash, through the opening swipe. node lab/wwd-phone-tint-shots.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [375, 667]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  for (const f of [0, .02, .3, .6, 1.0, 1.4]) {
    await p.mouse.move(w / 2, h / 2);
    await p.evaluate(y => scrollTo(0, y), Math.round(f * h)); await p.waitForTimeout(1300);
    const r = await p.evaluate(() => {
      const q = s => document.querySelector(s).getBoundingClientRect();
      const t = document.querySelector('.op__tint');
      return 'nav ' + Math.round(q('[data-nav]').bottom) + ' frameTop ' + Math.round(q('[data-op-frame]').top) + ' tint ' + (t ? (+getComputedStyle(t).opacity).toFixed(2) : 'none') + ' dim ' + (+getComputedStyle(document.querySelector('[data-op-dim]')).opacity).toFixed(2);
    });
    console.log(w + 'x' + h, 'scroll', f, r);
    if (w === 390) await p.screenshot({ path: `${out}/tint-${f}.png` });
  }
  console.log('errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
