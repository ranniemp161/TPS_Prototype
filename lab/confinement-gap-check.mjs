// Phone confinement: the photo's side gaps against its bottom gap, when settled.
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
  let ok = false;
  for (let y = 12000; y < 22000 && !ok; y += 200) {
    await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(40);
    ok = await p.evaluate(() => +getComputedStyle(document.querySelector('.act--turn')).opacity > 0.99);
  }
  await p.waitForTimeout(3500);
  const m = await p.evaluate(() => {
    const f = document.querySelector('.stage__frame--turn').getBoundingClientRect();
    return { left: Math.round(f.left), right: Math.round(innerWidth - f.right), top: Math.round(f.top), bottomGap: Math.round(innerHeight - f.bottom), w: Math.round(f.width), h: Math.round(f.height), overflow: document.documentElement.scrollWidth > innerWidth };
  });
  const shot = path.join(ROOT, 'lab', `confinement-gap-${w}.png`);
  await p.screenshot({ path: `C:/Users/LenoVo/AppData/Local/Temp/claude/g--My-Drive-Agent/ad0a07ac-00da-4928-ae07-3a1dfa330109/scratchpad/confinement-gap-${w}.png` });
  console.log(w, h, JSON.stringify(m));
  await p.close();
}
await b.close();
