import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844], [1835, 605], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => { const h = document.querySelector('.dk-h1--start').getBoundingClientRect(), k = document.querySelector('.dk-kicker--under'), kr = k.getBoundingClientRect(), pg = document.querySelector('.dk-page--start'); return { h1Lines: Math.round(h.height / parseFloat(getComputedStyle(document.querySelector('.dk-h1--start')).lineHeight === 'normal' ? 1 : 1) ), h1H: Math.round(h.height), kickW: Math.round(kr.width), kickRight: Math.round(kr.right), copyRight: Math.round(document.querySelector('.dk-start__copy').getBoundingClientRect().right), tight: pg.classList.contains('is-tight'), fit: document.querySelector('.dk').getAttribute('data-fit') }; });
  console.log(w + 'x' + h, JSON.stringify(m));
  await p.screenshot({ path: `lab/bespoke-header/title-${w}x${h}.png` });
  await p.close();
}
await b.close();
