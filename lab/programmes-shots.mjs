// Screenshots of the home programmes section at 1440 and 390 wide.
// Reaches it by real wheel steps from scroll zero, with fonts resolved.
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
  await p.waitForTimeout(1200);
  await p.mouse.move(w / 2, h / 2);
  for (let i = 0; i < 400; i++) {
    const top = await p.evaluate(() => document.querySelector('#programmes .sec-head').getBoundingClientRect().top);
    if (top < 260) break;
    await p.mouse.wheel(0, 120);
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const s = document.querySelector('#programmes .script');
    const r = s.getBoundingClientRect();
    return { font: getComputedStyle(s).fontFamily, quentin: document.fonts.check('16px Quentin'), lines: Math.round(r.height / parseFloat(getComputedStyle(s).lineHeight)) };
  });
  console.log(w, JSON.stringify(info));
  await p.screenshot({ path: path.join(OUT, `programmes-${w}.png`) });
  if (w === 390) {
    await p.mouse.wheel(0, 700); await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(OUT, `programmes-${w}-frame.png`) });
  }
  await p.close();
}
await b.close();
