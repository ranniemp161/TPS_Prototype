/* After scrolling to the act and waiting, is the title visible (opacity, transform, size)?
   node lab/title-visible-check.mjs [w] [h] [wait ms] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440', h = '900', wait = '4000'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
const y = await p.evaluate(() => document.querySelector('.act--turn').getBoundingClientRect().top + scrollY);
for (let t = 0; t <= y + 300; t += 300) { await p.mouse.wheel(0, 300); await p.waitForTimeout(120); }
await p.waitForTimeout(+wait);
console.log(await p.evaluate(() => {
  const t = document.querySelector('#confinement-heading'); const r = t.getBoundingClientRect();
  const inner = t.querySelector('.kin-line > span'); const ic = inner && getComputedStyle(inner);
  return JSON.stringify({ scrollY: Math.round(scrollY), titleTop: Math.round(r.top), titleH: Math.round(r.height), innerOpacity: ic && ic.opacity, innerTransform: ic && ic.transform, actOpacity: getComputedStyle(document.querySelector('.act--turn')).opacity });
}));
await p.screenshot({ path: 'lab/shots/titles/turn-visible-' + w + '.png' });
await b.close();
