// Frames of the bath leaving on the home page, keyed to the bath's bottom edge
// in windows from the top, with a real wheel (TJ, 2 Nov 2026; Opus).
// node lab/bath-exit-frames.mjs <out> <tag> [w h]
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT, TAG = 'now', W = '1440', H = '900'] = process.argv.slice(2);
const w = +W, h = +H;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: w, height: h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const edge = () => p.evaluate(() => document.querySelector('.act--bath').getBoundingClientRect().bottom / innerHeight);
const stops = [1.6, 1.3, 1.1, 1.0, 0.85, 0.7, 0.5, 0.3, 0.1, -0.2];
let i = 0;
for (let n = 0; n < 400 && i < stops.length; n++) {
  const e = await edge();
  if (e <= stops[i]) {
    await p.waitForTimeout(1300);
    await p.screenshot({ path: path.join(OUT, `${TAG}-${w}-${String(i).padStart(2, '0')}-edge${stops[i]}.png`) });
    i++; continue;
  }
  await p.mouse.wheel(0, 60); await p.waitForTimeout(40);
}
console.log('frames', i, errs);
await b.close();
