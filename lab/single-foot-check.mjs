// Single treatments: gap between the manage booking line and the footer, at 1440 and 390.
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
  await p.goto(pathToFileURL(path.join(ROOT, 'index/single-treatments.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.locator('.bk-foot-link').scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, 250)); await p.waitForTimeout(1000);
  const gap = await p.evaluate(() => Math.round(document.querySelector('footer').getBoundingClientRect().top - document.querySelector('.bk-foot-link').getBoundingClientRect().bottom));
  await p.screenshot({ path: path.join(OUT, `single-foot-${w}.png`) });
  console.log(w, 'gap', gap, errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
