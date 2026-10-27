// Phone confinement photo: samples the act's opacity and the photo's clip through the emerge,
// and screenshots one moment mid opening.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(800);
let shot = false;
for (let y = 13800; y < 16400; y += 200) {
  await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(900);
  const s = await p.evaluate(() => ({ op: +(+getComputedStyle(document.querySelector('.act--turn')).opacity).toFixed(2), clip: getComputedStyle(document.querySelector('.stage__frame--turn')).clipPath }));
  console.log(y, JSON.stringify(s));
  if (!shot && s.op > 0.6 && /3\d\.|2\d\.|1\d\./.test(s.clip)) { shot = true; await p.screenshot({ path: path.join(OUT, 'confinement-opening.png') }); }
}
await b.close();
