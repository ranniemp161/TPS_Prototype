// What We Do hero: screenshots from load through the pinned scroll, real wheel from zero.
// Args: outdir width height.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const w = +(process.argv[3] || 1440), h = +(process.argv[4] || 900);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/what-we-do.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(2500);
const state = () => p.evaluate(() => {
  const f = document.querySelector('[data-op-frame]').getBoundingClientRect();
  const lead = document.querySelector('.op__intro-in [data-op-lead]');
  return { y: Math.round(scrollY), frame: [Math.round(f.left), Math.round(f.top), Math.round(f.width), Math.round(f.height)], copyOp: +(+getComputedStyle(document.querySelector('[data-op-copy]')).opacity).toFixed(2), leadOp: +(+getComputedStyle(lead).opacity).toFixed(2) };
});
console.log('load', JSON.stringify(await state()));
await p.screenshot({ path: path.join(OUT, `wwd-${w}-0.png`) });
await p.mouse.move(w / 2, h / 2);
const stops = w > 860 ? [1, 2, 3, 4, 5] : [1, 2, 3];
for (const k of stops) {
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, Math.round(h * (w > 860 ? 0.12 : 0.09))); await p.waitForTimeout(60); }
  await p.waitForTimeout(1600);
  console.log('step', k, JSON.stringify(await state()));
  await p.screenshot({ path: path.join(OUT, `wwd-${w}-${k}.png`) });
}
console.log(errors.length ? errors : 'no errors');
await b.close();
