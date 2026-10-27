// Home programme picker: one frame on desktop, phones unchanged (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.evaluate(() => { const g = document.querySelector('[data-gallery]').getBoundingClientRect(); window.scrollBy(0, g.top + g.height / 2 - innerHeight / 2); });
  await p.waitForTimeout(2000);
  const radii = () => p.evaluate(() => ({ thumbs: [...document.querySelectorAll('.gal__thumb')].map(t => getComputedStyle(t).borderRadius), media: getComputedStyle(document.querySelector('.gal__media')).borderRadius }));
  console.log(w, JSON.stringify(await radii()));
  await p.screenshot({ path: out + `gal-${w}.png` });
  const items = await p.$$('[data-gal-item]');
  await items[1].click(); await p.waitForTimeout(450);
  await p.screenshot({ path: out + `gal-${w}-flying.png` });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: out + `gal-${w}-14.png` });
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
