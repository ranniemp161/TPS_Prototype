/* Drive the new testimonial block and photograph each state: at rest, with
   the pointer inside so the custom cursor is open, and after two advances.
     node lab/tv2shot.mjs <outdir> [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2], W = +(process.argv[3] || 1600), H = +(process.argv[4] || 900);
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.evaluate(() => {
  const a = document.querySelector('.act--voices');
  window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY);
});
await p.waitForTimeout(1400);
await p.screenshot({ path: path.join(OUT, '0-rest.png') });

const box = await p.locator('[data-tv2]').boundingBox();
await p.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.42);
await p.waitForTimeout(700);
await p.screenshot({ path: path.join(OUT, '1-cursor.png') });

await p.mouse.click(box.x + box.width * 0.62, box.y + box.height * 0.42);
await p.waitForTimeout(220);
await p.screenshot({ path: path.join(OUT, '2-midreveal.png') });
await p.waitForTimeout(900);
await p.screenshot({ path: path.join(OUT, '3-second.png') });

await p.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.6);
await p.waitForTimeout(1100);
await p.screenshot({ path: path.join(OUT, '4-third.png') });

const state = await p.evaluate(() => ({
  index: document.querySelector('[data-tv2-now]').textContent,
  fill: document.querySelector('[data-tv2-fill]').style.width,
  words: document.querySelectorAll('.tv2__w').length,
  shown: document.querySelectorAll('.tv2__w.is-in').length,
  faces: document.querySelectorAll('.tv2__face img').length,
  onFace: document.querySelectorAll('.tv2__face img.is-on').length,
  onPip: document.querySelectorAll('.tv2__pip.is-on').length
}));
console.log('state', JSON.stringify(state));
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await b.close();
