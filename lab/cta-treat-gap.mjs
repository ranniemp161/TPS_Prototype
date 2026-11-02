// Visible gaps: testimonials' last line to Book a consultation heading, and
// Book a consultation's last line to the treatments heading (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1680, 850], [1280, 720], [1920, 1080], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready);
  console.log(w + 'x' + h, await p.evaluate(() => {
    const lastIn = sec => [...sec.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 0 && !e.closest('.aurora') && getComputedStyle(e).visibility !== 'hidden'; }).reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0);
    const v = document.querySelector('.voices'), c = document.querySelector('.act--cta'), t = document.querySelector('.act--treatments-b');
    const ch = c.querySelector('.display').getBoundingClientRect().top;
    const th = t.querySelector('h2, .display').getBoundingClientRect();
    return JSON.stringify({ gap1: Math.round(ch - lastIn(v)), gap2: Math.round(th.top - lastIn(c)), heading: t.querySelector('h2, .display').textContent.trim().slice(0, 40), ctaPadB: getComputedStyle(c).paddingBottom, treatPadT: getComputedStyle(t).paddingTop });
  }));
  await p.close();
}
await b.close();
