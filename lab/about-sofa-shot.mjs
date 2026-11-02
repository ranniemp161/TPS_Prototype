// The About story photograph (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'about.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  const y = await p.evaluate(() => { const r = document.querySelector('img[src*="our-story-sofa-specialist"]').getBoundingClientRect(); return r.top + scrollY + r.height / 2 - innerHeight / 2; });
  let at = 0; while (at + 300 < y) { await p.mouse.wheel(0, 300); at += 300; await p.waitForTimeout(80); }
  await p.waitForTimeout(2000);
  await p.screenshot({ path: path.join(OUT, `about-sofa-${w}.png`) });
  console.log(w, errs, await p.evaluate(() => { const i = document.querySelector('img[src*="our-story-sofa-specialist"]'); return [i.complete, i.naturalWidth]; }));
  await p.close();
}
await b.close();
