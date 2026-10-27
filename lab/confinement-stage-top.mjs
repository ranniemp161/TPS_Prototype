// Phone confinement: where the split stage starts and ends, settled.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 780]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.waitForTimeout(800);
  for (let y = 12000; y < 22000; y += 200) {
    await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(40);
    if (await p.evaluate(() => +getComputedStyle(document.querySelector('.act--turn')).opacity > 0.99)) break;
  }
  await p.waitForTimeout(2200);
  console.log(w, h, JSON.stringify(await p.evaluate(() => {
    const st = document.querySelector('.act--turn .stage--split').getBoundingClientRect();
    const sd = document.querySelector('.act--turn .stage__side').getBoundingClientRect();
    const f = document.querySelector('.stage__frame--turn').getBoundingClientRect();
    return { stageTop: Math.round(st.top), stageH: Math.round(st.height), sideBottom: Math.round(sd.bottom), frameTop: Math.round(f.top), frameBottom: Math.round(f.bottom) };
  })));
  await p.close();
}
await b.close();
