// Phone: the gap between the confinement photo and the testimonials band, during the hold and after the pin lets go.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 780]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.waitForTimeout(800);
  let y = 12000;
  for (; y < 22000; y += 200) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(40); if (await p.evaluate(() => +getComputedStyle(document.querySelector('.act--turn')).opacity > 0.99)) break; }
  const m = () => p.evaluate(() => {
    const f = document.querySelector('.stage__frame--turn').getBoundingClientRect();
    const v = document.querySelector('.act--turn .voices').getBoundingClientRect();
    return { photoBottom: Math.round(f.bottom), voicesTop: Math.round(v.top), gap: Math.round(v.top - f.bottom), screenGap: Math.round(innerHeight - f.bottom) };
  });
  await p.waitForTimeout(3500);
  const hold = await m();
  // past the pin: scroll on until the photo has moved up
  for (let i = 0; i < 60; i++) { y += 150; await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(60); const r = await m(); if (r.photoBottom < h * 0.75) break; }
  await p.waitForTimeout(1500);
  const after = await m();
  await p.screenshot({ path: path.join(OUT, `confinement-voices-${w}.png`) });
  console.log(w, JSON.stringify({ hold, after }), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
