/* Wheel down from the top through the bath into What is Postpartum Care and
   the film, saving a frame at each step. node lab/bath-turn-frames.mjs <outdir> [w] [h] [step] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [out, w = '1440', h = '900', step = '240'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
await p.mouse.move(+w / 2, +h / 2);
const filmTop = await p.evaluate(() => document.querySelector('.film').getBoundingClientRect().top + scrollY);
let i = 0;
while (true) {
  const y = await p.evaluate(() => scrollY);
  if (y > filmTop + 200 || i > 90) break;
  await p.screenshot({ path: `${out}/f-${w}-${String(i).padStart(2, '0')}.png` });
  const info = await p.evaluate(() => {
    const t = document.querySelector('.act--turn').getBoundingClientRect();
    const bath = document.querySelector('[data-bath]').getBoundingClientRect();
    return `scroll ${Math.round(scrollY)} bath bottom ${Math.round(bath.bottom)} turn top ${Math.round(t.top)}`;
  });
  console.log(String(i).padStart(2, '0'), info);
  await p.mouse.wheel(0, +step); await p.waitForTimeout(450);
  i++;
}
console.log('errors', JSON.stringify(errs));
await b.close();
