/* Screenshots the accent colour study page. node lab/colour-page-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL('C:/Users/LenoVo/tps-colours/index.html').href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.screenshot({ path: `${out}/page-${w}-top.png` });
  await p.evaluate(() => document.getElementById('sage').scrollIntoView()); await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/page-${w}-sage.png` });
  if (w === 390) { await p.click('[data-view-btn="phone"]'); await p.waitForTimeout(700); await p.screenshot({ path: `${out}/page-390-phoneview.png` }); }
  console.log(w, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
