// Gap from the end of the testimonials to the Book a consultation heading (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1280, 720], [1920, 1080], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready);
  console.log(w + 'x' + h, await p.evaluate(() => { const v = document.querySelector('.act--voices').getBoundingClientRect(); const hd = document.querySelector('.act--cta .display').getBoundingClientRect(); const c = document.querySelector('.cta--card'); return JSON.stringify({ gap: Math.round(hd.top - v.bottom), ctaPadTop: getComputedStyle(document.querySelector('.act--cta')).paddingTop, cardPadTop: getComputedStyle(c).paddingTop }); }));
  await p.close();
}
await b.close();
