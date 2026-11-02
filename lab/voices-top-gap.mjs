// Gap from the top of the testimonials to its heading (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1280, 720], [1920, 1080], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready);
  console.log(w + 'x' + h, await p.evaluate(() => { const v = document.querySelector('.voices'); const hd = document.querySelector('#voices-heading'); return JSON.stringify({ gap: Math.round(hd.getBoundingClientRect().top - v.getBoundingClientRect().top), padTop: getComputedStyle(v).paddingTop }); }));
  await p.close();
}
await b.close();
