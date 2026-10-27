// House route: the tail before Arrival and the tail after Daily treatments should match.
// Measures the track and the dots at rest at 1440 and 390, and reports errors.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const top = await p.evaluate(() => document.querySelector('[data-route]').getBoundingClientRect().top + scrollY);
  await p.evaluate(y => { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); }, top - h * 0.6);
  await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const line = document.querySelector('.route__line').getBoundingClientRect();
    const dots = [...document.querySelectorAll('.route__dot')].map(d => d.getBoundingClientRect());
    const first = dots[0], last = dots[dots.length - 1];
    return { lineW: Math.round(line.width), headTail: Math.round(first.left + first.width / 2 - line.left), tailAfter: Math.round(line.right - (last.left + last.width / 2)) };
  });
  console.log(w, JSON.stringify(m), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
