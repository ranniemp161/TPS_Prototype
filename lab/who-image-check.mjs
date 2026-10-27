// Who Comes Into Your Home: the first block image at 1440 and 390.
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
  const img = p.locator('img[src*="specialist-portrait"]');
  await img.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -120)); await p.waitForTimeout(1500);
  const ok = await img.evaluate(i => i.complete && i.naturalWidth > 0);
  await p.screenshot({ path: path.join(OUT, `who-${w}.png`) });
  console.log(w, 'loaded', ok, errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
