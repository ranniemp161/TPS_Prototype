/* About page: scroll through at 1440 and 390, screenshot every 0.8 screen. node lab/about-shots.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/about.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < H; y += Math.round(h * 0.8)) {
    await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(1100);
    await p.screenshot({ path: `${out}/a${w}-${String(i).padStart(2, '0')}.png` }); i++;
  }
  const m = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, js: document.documentElement.className }));
  console.log(w, 'height', H, 'shots', i, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
