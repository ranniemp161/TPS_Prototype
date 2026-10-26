import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.resolve('index/index.html')).href);
await p.evaluate(() => document.fonts.ready);
for (const s of ['.act--voices', '.act--cta']) {
  await p.locator(s).scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  await p.locator(s).screenshot({ path: `lab/shots/b6/home-${s.slice(6)}.png` });
}
await b.close();
