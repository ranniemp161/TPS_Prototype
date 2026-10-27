/* Bespoke header glass check (TJ, 13 Oct 2026): the glass strip is off at the top and on once scrolled.
   node lab/bespoke-header-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844], [1280, 480]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const read = () => p.evaluate(() => { const n = document.querySelector('[data-nav]'); return { scrolled: n.classList.contains('is-scrolled'), glass: getComputedStyle(n, '::before').opacity, y: scrollY, canScroll: document.documentElement.scrollHeight > innerHeight + 2 }; });
  const top = await read(); await p.screenshot({ path: `${out}/top-${w}x${h}.png` });
  await p.mouse.move(w / 2, h / 2); await p.mouse.wheel(0, 300); await p.waitForTimeout(900);
  const sc = await read(); await p.screenshot({ path: `${out}/scrolled-${w}x${h}.png` });
  console.log(w + 'x' + h, 'top', JSON.stringify(top), 'scrolled', JSON.stringify(sc));
  await p.close();
}
await b.close();
