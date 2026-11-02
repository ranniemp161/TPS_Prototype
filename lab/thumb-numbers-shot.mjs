// The length thumbnails with their numbers, before and after a click (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT, TAG = 'num'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const y = await p.evaluate(() => document.querySelector('.gal__list').getBoundingClientRect().top + scrollY - 200);
  let at = 0; while (at < y) { await p.mouse.wheel(0, 400); at += 400; await p.waitForTimeout(80); }
  await p.waitForTimeout(1800);
  const shot = async n => { const r = await p.locator('.gal').first().boundingBox(); await p.screenshot({ path: path.join(OUT, `${TAG}-${n}-${w}.png`), clip: { x: r.x - 10, y: r.y - 10, width: Math.min(w - r.x + 10, r.width + 20), height: Math.min(r.height + 20, 700) } }); };
  await shot('a');
  await p.locator('.gal__thumb').nth(1).click(); await p.waitForTimeout(1200);
  await shot('b');
  console.log(w, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.gal__num')].map(e => [e.textContent, getComputedStyle(e).opacity, getComputedStyle(e).fontSize]))), errs);
  await p.close();
}
await b.close();
