/* The phone hero with the answer on the photograph (TJ, 11 Oct 2026): three phone
   sizes through the pin and out into the next section.
   node lab/answer-phone-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 640], [430, 932]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
  for (const f of [0, 0.6, 1.0, 1.4, 1.9, 2.4, 2.9]) {
    await p.evaluate(y => scrollTo(0, y), Math.round(f * h)); await p.waitForTimeout(1100);
    await p.screenshot({ path: `${out}/ap-${w}-${f}.png` });
  }
  await p.evaluate(y => scrollTo(0, y), Math.round(1.9 * h)); await p.waitForTimeout(1100);
  const m = await p.evaluate(() => {
    const on = document.querySelector('.op__on').getBoundingClientRect();
    const ps = [...document.querySelectorAll('.op__on-p')].map(e => getComputedStyle(e).opacity);
    const intro = document.querySelector('.op__intro').getBoundingClientRect();
    return { onTop: Math.round(on.top), onBottom: Math.round(on.bottom), fs: getComputedStyle(document.querySelector('.op__on-p')).fontSize, ps, introH: Math.round(intro.height), overflowX: document.documentElement.scrollWidth > innerWidth };
  });
  console.log(w, h, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
