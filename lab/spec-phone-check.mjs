/* Your Postpartum Specialist on phones (TJ, 11 Oct 2026): the title above the
   portrait, sliding in; the portrait centred, opening from the centre.
   node lab/spec-phone-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 640], [430, 932], [700, 1000]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
  // walk down to the section so the observers fire as a reader's would
  const y = await p.evaluate(() => document.querySelector('#specialist').getBoundingClientRect().top + scrollY);
  for (let s = 0; s < y; s += 300) { await p.evaluate(v => scrollTo(0, v), s); await p.waitForTimeout(60); }
  await p.evaluate(v => scrollTo(0, v), y - 60);
  for (const t of [150, 500, 2400]) {
    await p.waitForTimeout(t === 150 ? 150 : t - (t === 500 ? 150 : 500));
    await p.screenshot({ path: `${out}/sp-${w}-${t}.png` });
  }
  const m = await p.evaluate(() => {
    const f = document.querySelector('[data-spec-frame]').getBoundingClientRect();
    const t = document.querySelector('#specialist .wh2'); const tr = t.getBoundingClientRect();
    return { titleBeforeFrame: t.nextElementSibling === document.querySelector('[data-spec-frame]'), titleBottom: Math.round(tr.bottom), frameTop: Math.round(f.top), frameL: Math.round(f.left), frameR: Math.round(innerWidth - f.right), frameW: Math.round(f.width) };
  });
  console.log(w, h, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
