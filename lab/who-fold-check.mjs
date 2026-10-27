// Who Comes Into Your Home on phones, at scroll zero: title top to last point bottom against the screen.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[390, 844], [375, 667], [360, 780], [430, 932]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index/who-comes-into-your-home.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const m = await p.evaluate(() => {
    const t = document.querySelector('.spec h1').getBoundingClientRect();
    const pts = [...document.querySelectorAll('.wc-points li')]; const last = pts[pts.length - 1].getBoundingClientRect();
    return { titleTop: Math.round(t.top), lastPointBottom: Math.round(last.bottom), screen: innerHeight, short: Math.round(last.bottom - innerHeight) };
  });
  await p.screenshot({ path: path.join(OUT, `who-fold-${w}x${h}.png`) });
  console.log(`${w}x${h}`, JSON.stringify(m));
  await p.close();
}
await b.close();
