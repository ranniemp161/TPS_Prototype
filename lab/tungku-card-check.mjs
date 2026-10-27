// Four Kinds of Care: the Treatments card photo, on desktop (rail) and phone (stacked).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.waitForTimeout(800);
  const sel = 'img[src*="tungku-held"]';
  await p.mouse.move(w / 2, h / 2);
  for (let i = 0; i < 1500; i++) {
    const r = await p.evaluate(s => { const e = document.querySelector(s).getBoundingClientRect(); return { l: e.left, r: e.right, t: e.top, b: e.bottom }; }, sel);
    if (r.l > -10 && r.r < w + 10 && r.t > 60 && r.b < h) break;
    await p.mouse.wheel(0, 120); await p.waitForTimeout(25);
  }
  await p.waitForTimeout(1200);
  const ok = await p.evaluate(s => { const i = document.querySelector(s); return i.complete && i.naturalWidth > 0; }, sel);
  await p.screenshot({ path: path.join(OUT, `tungku-card-${w}.png`) });
  console.log(w, 'loaded', ok, errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
