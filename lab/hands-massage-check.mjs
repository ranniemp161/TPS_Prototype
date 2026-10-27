// What We Do, Four Kinds of Care: screenshots through the section, real wheel from zero,
// noting which kind is showing and the Treatments plate's transform. Args: outdir width height.
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
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.mouse.move(w / 2, h / 2);
const secTop = () => p.evaluate(() => document.querySelector('[data-hd]').getBoundingClientRect().top);
for (let i = 0; i < 900 && (await secTop()) > 0; i++) { await p.mouse.wheel(0, 150); await p.waitForTimeout(25); }
let n = 0;
for (let i = 0; i < 70 && n < 9; i++) {
  await p.mouse.wheel(0, Math.round(h * 0.18)); await p.waitForTimeout(90);
  if (i % 3 !== 2) continue;
  await p.waitForTimeout(900);
  const s = await p.evaluate(() => {
    const plate = document.querySelector('img[src*="hands-plate-massage"]');
    const r = plate.getBoundingClientRect();
    return { secTop: Math.round(document.querySelector('[data-hd]').getBoundingClientRect().top), op: +(+getComputedStyle(plate).opacity).toFixed(2), tf: getComputedStyle(plate).transform, box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], loaded: plate.complete && plate.naturalWidth > 0 };
  });
  console.log(n, JSON.stringify(s));
  await p.screenshot({ path: path.join(OUT, `hands-${w}-${n}.png`) });
  n++;
}
console.log(errors.length ? errors : 'no errors');
await b.close();
