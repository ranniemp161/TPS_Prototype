/* MOBILE-PLAN item 1 check: the zones words appear on phones with the film blocked.
   node lab/zones-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [label, block] of [['blocked', true], ['normal', false]]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  if (block) await p.route('**/*.{mp4,webm,mov}', r => r.abort());
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const top = await p.evaluate(() => document.querySelector('.zones').getBoundingClientRect().top + scrollY);
  await p.evaluate(y => scrollTo(0, y), Math.round(top + 300));
  await p.waitForTimeout(1300);
  const m = await p.evaluate(() => {
    const vis = s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return c.visibility + ' ' + c.opacity; };
    const t = document.querySelector('.zones__tab'); return { title: vis('.zones__title'), line: vis('.zones__line'), panel: vis('.zones__panel.is-active'), tabFs: t && getComputedStyle(t).fontSize, tabsW: document.querySelector('.zones__tabs')?.scrollWidth, tabsBox: document.querySelector('.zones__tabs')?.clientWidth };
  });
  await p.evaluate(y => scrollTo(0, y), Math.round(top + 520)); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/zones-${label}.png` });
  console.log(label, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
