// The thumbnail column alone, large, for checking the numbers (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT, TAG = 'list'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const y = await p.evaluate(() => { const r = document.querySelector('.gal__list').getBoundingClientRect(); return r.top + scrollY + r.height / 2 - innerHeight / 2; });
  let at = 0; while (at < y) { await p.mouse.wheel(0, 300); at += 300; await p.waitForTimeout(80); }
  await p.waitForTimeout(2000);
  await p.locator('.gal__list').screenshot({ path: path.join(OUT, `${TAG}-${w}.png`) });
  await p.close();
}
await b.close();
