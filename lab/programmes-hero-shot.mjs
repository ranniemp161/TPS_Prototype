// Programmes hero after the declutter (TJ, 1 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const OUT = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'programmes.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
  await p.screenshot({ path: path.join(OUT, `programmes-hero-${w}.png`) });
  if (w === 390) { await p.mouse.wheel(0, 500); await p.waitForTimeout(1200); await p.screenshot({ path: path.join(OUT, `programmes-hero-${w}-b.png`) }); }
  console.log(w, errs);
  await p.close();
}
await b.close();
