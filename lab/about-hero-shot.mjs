// About hero with the photograph (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'about.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(OUT, `about-hero-${w}.png`) });
  console.log(w, errs, await p.evaluate(() => { const i = document.querySelector('.os-open__pic img'); return [i.complete, i.naturalWidth]; }));
  await p.close();
}
await b.close();
