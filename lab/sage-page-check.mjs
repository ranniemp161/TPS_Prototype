/* Sage What We Do mock up: wheel from scroll zero to the foot, screenshot every
   0.9 screen, collect errors and failed requests. node lab/sage-page-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('requestfailed', r => errs.push('failed ' + r.url().split('/').slice(-2).join('/')));
  p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url().split('/').slice(-2).join('/')); });
  await p.goto(pathToFileURL('C:/Users/LenoVo/tps-colours/what-we-do-sage/index.html').href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
  await p.mouse.move(w / 2, h / 2);
  let i = 0;
  while (i < 70) {
    await p.screenshot({ path: `${out}/s${w}-${String(i).padStart(2, '0')}.jpg`, quality: 70 }); i++;
    const done = await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
    if (done) break;
    for (let k = 0; k < 9; k++) { await p.mouse.wheel(0, Math.round(h * 0.1)); await p.waitForTimeout(50); }
    await p.waitForTimeout(700);
  }
  console.log(w, 'shots', i, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'errors', JSON.stringify(errs.slice(0, 8)));
  await p.close();
}
await b.close();
