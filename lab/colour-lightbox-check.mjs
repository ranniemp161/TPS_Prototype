/* Accent study full screen view: open, step, Back closes. node lab/colour-lightbox-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL('C:/Users/LenoVo/tps-colours/index.html').href, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  if (w === 390) await p.click('[data-view-btn="phone"]');
  await p.evaluate(() => document.getElementById('sage').scrollIntoView()); await p.waitForTimeout(500);
  const y0 = await p.evaluate(() => scrollY);
  await p.click('#sage .shots:not([style*="none"]) figure img >> visible=true');
  await p.waitForTimeout(700);
  const open1 = await p.evaluate(() => ({ open: document.getElementById('lb').classList.contains('is-open'), cap: document.getElementById('lb-cap').textContent }));
  await p.screenshot({ path: `${out}/lb-${w}-open.png` });
  await p.click('#lb-next'); await p.waitForTimeout(600);
  const cap2 = await p.evaluate(() => document.getElementById('lb-cap').textContent);
  await p.screenshot({ path: `${out}/lb-${w}-next.png` });
  await p.goBack(); await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({ open: document.getElementById('lb').classList.contains('is-open'), y: scrollY, url: location.href.slice(-12) }));
  console.log(w, JSON.stringify(open1), '| next:', cap2, '| after back:', JSON.stringify(after), 'y0', y0, 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
