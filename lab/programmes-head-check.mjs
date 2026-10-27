// Home programmes heading: computed Quentin size at 1440 and 390, and heading text.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const info = await p.evaluate(() => ({
    heading: document.querySelector('#programmes .sec-head h2').textContent,
    quentinPx: parseFloat(getComputedStyle(document.querySelector('#programmes .sec-head .script')).fontSize),
  }));
  console.log(w, JSON.stringify(info));
  await p.close();
}
await b.close();
