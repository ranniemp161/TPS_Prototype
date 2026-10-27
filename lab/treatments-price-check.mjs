// Single session treatments section: prices gone from the cards, section renders at 1440 and 390.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'lab');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#standalone-treatments').scrollIntoView(); });
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const s = document.querySelector('#standalone-treatments');
    return { pounds: (s.textContent.match(/£/g) || []).length, metas: [...s.querySelectorAll('.tb-acc__meta')].map(m => m.textContent), overflow: document.documentElement.scrollWidth > innerWidth };
  });
  console.log(w, JSON.stringify(info));
  await p.screenshot({ path: path.join(OUT, `treat-${w}.png`) });
  await p.close();
}
await b.close();
