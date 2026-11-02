// Programmes intro: two lines per paragraph on desktop, card above the fold (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const OUT = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1280, 720], [1536, 864], [1920, 1080], [1100, 800], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'programmes.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const lines = [...document.querySelectorAll('.pg-look__p')].map(e => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)));
    const c = document.querySelector('[data-pg-card]').getBoundingClientRect();
    return { lines, cardBottom: Math.round(c.bottom), fold: innerHeight, pad: getComputedStyle(document.querySelector('[data-pg-card]')).paddingTop };
  });
  console.log(`${w}x${h}`, JSON.stringify(r), errs.length ? errs : '');
  await p.screenshot({ path: path.join(OUT, `two-line-${w}.png`) });
  await p.close();
}
await b.close();
