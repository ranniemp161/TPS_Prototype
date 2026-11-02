// Visible gap: the testimonials' last line (the names under the dots) to the
// Book a consultation heading (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1680, 850], [1280, 720], [1920, 1080], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready);
  console.log(w + 'x' + h, await p.evaluate(() => {
    const v = document.querySelector('.voices');
    const last = [...v.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('.aurora'); }).reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0);
    const hd = document.querySelector('.act--cta .display').getBoundingClientRect().top;
    return JSON.stringify({ gap: Math.round(hd - last), voicesPadB: getComputedStyle(v).paddingBottom, ctaPadT: getComputedStyle(document.querySelector('.act--cta')).paddingTop });
  }));
  await p.close();
}
await b.close();
