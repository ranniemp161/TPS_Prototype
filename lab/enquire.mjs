/* TJ's actual sequence: click Enquire in the nav, which is href="#programmes",
   smooth scroll the whole document, then come back up. That is the only route
   that puts "#programmes" in the address bar the way his screenshot shows.
     node lab/enquire.mjs <outdir> <w> <h> [control] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const OUT = process.argv[2], W = +process.argv[3], H = +process.argv[4], CTRL = process.argv[5] === 'control';
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H } });
if (CTRL) await p.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
  const v = document.querySelector('.act--voices'); if (v) v.remove(); }));
await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(1000);

await p.click('.tab--cta');
await p.waitForTimeout(3500);                       // let the smooth scroll land
console.log('after Enquire  url hash', await p.evaluate(() => location.hash),
            ' scrollY', await p.evaluate(() => Math.round(window.scrollY)),
            ' docH', await p.evaluate(() => Math.round(document.documentElement.scrollHeight)));

await p.mouse.move(W / 2, H / 2);
for (let i = 0; i < 90; i++) { await p.mouse.wheel(0, -900); await p.waitForTimeout(25); }
await p.waitForTimeout(1500);
console.log('back at top    scrollY', await p.evaluate(() => Math.round(window.scrollY)));

const shot = async (i) => p.screenshot({ path: path.join(OUT, String(i).padStart(2, '0') + '.png') });
let n = 0; await shot(n++);
for (let i = 0; i < 30; i++) {
  await p.mouse.wheel(0, 120);
  await p.waitForTimeout(110);
  if (i % 2 === 0) await shot(n++);
}
const r = await p.evaluate(() => {
  const st = document.querySelector('.act--hero .stage');
  const b = st.getBoundingClientRect();
  return { top: Math.round(b.top), h: Math.round(b.height), pos: getComputedStyle(st).position,
           y: Math.round(window.scrollY) };
});
console.log('hero stage', JSON.stringify(r));
await b.close();
