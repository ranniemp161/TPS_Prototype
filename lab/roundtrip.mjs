/* Does the hero handoff survive going deep into the page and coming back?
   Samples the top of the page on a fresh load, then again after a trip to
   15 viewport-heights and back, and diffs the two. Runs the same test on
   lab/baseline so a fault can be told from a regression.
     node lab/roundtrip.mjs <outdir> <file> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2], FILE = process.argv[3] || 'v1.html';
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL(path.join(ROOT, FILE)).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(1000);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });

const settle = async () => {
  let prev = null;
  for (let t = 0; t < 14; t++) {
    await p.waitForTimeout(110);
    const s = await p.evaluate(() => {
      const st = document.querySelector('.act--hero .stage');
      const bi = document.querySelector('.bath__img');
      return [Math.round(st.getBoundingClientRect().top), bi ? Math.round(bi.getBoundingClientRect().top) : 0];
    });
    if (prev && prev[0] === s[0] && prev[1] === s[1]) return;
    prev = s;
  }
};
const sweep = async tag => {
  for (let i = 0; i <= 24; i++) {
    const v = +(i * 0.1).toFixed(1);
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await settle();
    await p.screenshot({ path: path.join(OUT, `${tag}_${String(i).padStart(2,'0')}_${v}.png`) });
  }
};

await sweep('a');                                    // fresh
await p.evaluate(() => window.scrollTo(0, window.innerHeight * 15));
await p.waitForTimeout(1200);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(1200);
await sweep('b');                                    // after the round trip
console.log('done', FILE);
await b.close();
