/* Photograph the nav row alone, all the way down the page, current build
   against the version in lab/baseline. The nav is fixed, so a fault in it
   shows at some scroll positions and not others.
     node lab/navstrip.mjs <outdir> [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2], W = +(process.argv[3] || 1600), H = +(process.argv[4] || 900);
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

for (const [tag, file] of [['cur', 'v1.html'], ['bas', 'lab/baseline/v1.html']]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(800);
  const docH = await p.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
  for (let i = 0; i <= 16; i++) {
    const v = +((docH - 1) * i / 16).toFixed(2);
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(420);
    await p.screenshot({ path: path.join(OUT, `${tag}_${String(i).padStart(2,'0')}_${v}vh.png`),
                         clip: { x: 0, y: 0, width: W, height: 130 } });
  }
  const geo = await p.evaluate(() => {
    const n = document.querySelector('[data-nav]');
    const inner = n.querySelector('.nav__inner');
    const r = n.getBoundingClientRect(), ri = inner.getBoundingClientRect();
    const cs = getComputedStyle(n);
    return { navTop: Math.round(r.top), navH: Math.round(r.height), pos: cs.position,
             z: cs.zIndex, innerW: Math.round(ri.width), innerL: Math.round(ri.left),
             dark: n.classList.contains('is-dark'),
             tabs: [...n.querySelectorAll('.tab')].map(t => Math.round(t.getBoundingClientRect().width)) };
  });
  console.log(tag.padEnd(4), JSON.stringify(geo), 'errors:', errs.length ? errs.join('|') : 'none');
  await p.close();
}
await b.close();
