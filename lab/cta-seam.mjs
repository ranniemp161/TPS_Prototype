import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.resolve('index/index.html')).href);
  await p.evaluate(() => document.fonts.ready);
  await p.locator('.act--cta').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  const top = await p.evaluate(() => { const y = document.querySelector('.act--cta').getBoundingClientRect().top + scrollY; scrollTo(0, y - innerHeight / 2); return y; });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `lab/shots/b6/cta-seam-${w}.png` });
  await p.close();
}
await b.close();
