// Where the line between Book a consultation and the treatments sits between
// the bespoke line and Try a signature treatment (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1680, 850], [1280, 720], [1920, 1080], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready);
  console.log(w + 'x' + h, await p.evaluate(() => {
    const alt = document.querySelector('.act--cta .cta__alt--out').getBoundingClientRect().bottom;
    const line = document.querySelector('.act--cta').getBoundingClientRect().bottom;
    const hd = document.querySelector('.act--treatments-b h2').getBoundingClientRect().top;
    return JSON.stringify({ above: Math.round(line - alt), below: Math.round(hd - line), total: Math.round(hd - alt) });
  }));
  await p.close();
}
await b.close();
