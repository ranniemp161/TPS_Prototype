// What Is Confinement on a phone, while it is pinned: measures heading top to photo bottom
// against the screen, the photo's size and centre, and its clip, and screenshots it.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'lab');
const w = +(process.argv[3] || 390), h = +(process.argv[4] || 844);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(800);
let best = null;
for (let y = 12000; y < 22000; y += 200) {
  await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(40);
  const s = await p.evaluate(() => {
    const act = document.querySelector('.act--turn');
    const op = +getComputedStyle(act).opacity;
    const hd = act.querySelector('#confinement-heading').getBoundingClientRect();
    const fr = act.querySelector('.stage__frame--turn').getBoundingClientRect();
    return { op, headTop: Math.round(hd.top), photoTop: Math.round(fr.top), photoBottom: Math.round(fr.bottom), photoW: Math.round(fr.width), photoCentre: Math.round(fr.left + fr.width / 2), clip: getComputedStyle(act.querySelector('.stage__frame--turn')).clipPath };
  });
  if (s.op > 0.99) { best = { y, ...s }; break; }
}
await p.waitForTimeout(2200);
const settled = await p.evaluate(() => {
  const act = document.querySelector('.act--turn');
  const hd = act.querySelector('#confinement-heading').getBoundingClientRect();
  const fr = act.querySelector('.stage__frame--turn').getBoundingClientRect();
  return { headTop: Math.round(hd.top), photoTop: Math.round(fr.top), photoBottom: Math.round(fr.bottom), photoW: Math.round(fr.width), photoCentre: Math.round(fr.left + fr.width / 2), clip: getComputedStyle(act.querySelector('.stage__frame--turn')).clipPath, screenH: innerHeight, screenCentre: innerWidth / 2 };
});
await p.screenshot({ path: path.join(OUT, `confinement-${w}.png`) });
console.log(JSON.stringify({ firstFull: best, settled }), errors.length ? errors : 'no errors');
await b.close();
