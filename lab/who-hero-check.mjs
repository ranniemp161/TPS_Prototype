// Who Comes Into Your Home hero: subheader and Quentin line sizes, screenshots at 1440 and 390.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/who-comes-into-your-home.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  if (w < 861) { await p.locator('.wc-sub').scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -200)); await p.waitForTimeout(1500); }
  const m = await p.evaluate(() => ({ subPx: getComputedStyle(document.querySelector('.wc-sub')).fontSize, subCase: getComputedStyle(document.querySelector('.wc-sub')).textTransform, scriptPx: getComputedStyle(document.querySelector('.wc-script')).fontSize, pointPx: getComputedStyle(document.querySelector('.wc-points li')).fontSize, overflow: document.documentElement.scrollWidth > innerWidth }));
  await p.screenshot({ path: path.join(OUT, `who-hero-${w}.png`) });
  console.log(w, JSON.stringify(m), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
