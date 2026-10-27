// House route at rest: gaps between the five dots and the two tails, at 1440 and 390.
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
    const c = [...document.querySelectorAll('.route__dot')].map(d => { const r = d.getBoundingClientRect(); return r.left + r.width / 2; });
    const gaps = c.slice(1).map((x, i) => Math.round(x - c[i]));
    return { tailBefore: Math.round(c[0] - line.left), tailAfter: Math.round(line.right - c[c.length - 1]), gaps };
  });
  console.log(w, JSON.stringify(m), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
