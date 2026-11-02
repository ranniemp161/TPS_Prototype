// What sits under the testimonials: the next section's ground (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
console.log(await p.evaluate(() => {
  const v = document.querySelector('.voices'); const a = document.querySelector('.act--voices'); const n = a.nextElementSibling;
  const r = e => { const q = e.getBoundingClientRect(); return [Math.round(q.top + scrollY), Math.round(q.bottom + scrollY)]; };
  return JSON.stringify({ voices: r(v), act: r(a), actPadB: getComputedStyle(a).paddingBottom, next: n.className, nextBg: getComputedStyle(n).backgroundColor, nextBgImg: getComputedStyle(n).backgroundImage.slice(0, 80), nextTop: r(n), nextPadT: getComputedStyle(n).paddingTop, voicesAfter: getComputedStyle(v, '::after').content });
}));
await b.close();
