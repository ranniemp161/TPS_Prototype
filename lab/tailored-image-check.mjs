// What We Do, Tailored For You: the photograph at 1440 and 390, real wheel to the section.
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
  await p.goto(pathToFileURL(path.join(ROOT, 'index/what-we-do.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.mouse.move(w / 2, h / 2);
  const sel = 'img[src*="tailored-bedroom-v2"]';
  for (let i = 0; i < 2500; i++) {
    const r = await p.evaluate(s => { const e = document.querySelector(s).getBoundingClientRect(); return { t: e.top, b: e.bottom }; }, sel);
    if (r.t < h * 0.35 && r.b > h * 0.4) break;
    await p.mouse.wheel(0, 140); await p.waitForTimeout(20);
  }
  if (w > 860) { for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 140); await p.waitForTimeout(40); } }
  await p.waitForTimeout(1500);
  const ok = await p.evaluate(s => { const i = document.querySelector(s); return i.complete && i.naturalWidth > 0; }, sel);
  await p.screenshot({ path: path.join(OUT, `tailored-${w}.png`) });
  console.log(w, 'loaded', ok, errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
