// What We Do: the specialist portrait's size on phones, for matching elsewhere.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 780]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index/what-we-do.html')).href, { waitUntil: 'load' });
  const r = await p.evaluate(() => { const f = document.querySelector('.spec__frame').getBoundingClientRect(); return { w: Math.round(f.width), h: Math.round(f.height) }; });
  console.log(w, h, JSON.stringify(r));
  await p.close();
}
await b.close();
