/* TJ's URL ends in #programmes. The browser resolves that anchor BEFORE
   ScrollTrigger builds, so the pins are measured from a scrolled window
   rather than from the top. Every test so far loaded at the top.
   This loads both ways and diffs the same scroll positions.
     node lab/hashbuild.mjs <outdir> <w> <h> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2], W = +(process.argv[3] || 1600), H = +(process.argv[4] || 900);
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

for (const [tag, hash] of [['top', ''], ['hash', '#programmes']]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href + hash, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(1200);
  const landed = await p.evaluate(() => Math.round(window.scrollY));
  // The page sets scroll-behavior: smooth, which applies to programmatic
  // scrolls too. Sampling from 14000px away would photograph the glide
  // rather than the destination.
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  for (let i = 0; i <= 24; i++) {
    const v = +(i * 0.1).toFixed(1);
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    let prev = null;
    for (let t = 0; t < 34; t++) {   // 3.7s budget: a 14000px round trip takes a while to settle
      await p.waitForTimeout(110);
      const s = await p.evaluate(() => {
        const st = document.querySelector('.act--hero .stage');
        const bi = document.querySelector('.bath__img');
        return [Math.round(st.getBoundingClientRect().top), bi ? Math.round(bi.getBoundingClientRect().top) : 0];
      });
      if (prev && prev[0] === s[0] && prev[1] === s[1]) break;
      prev = s;
    }
    await p.screenshot({ path: path.join(OUT, `${tag}_${String(i).padStart(2,'0')}_${v}.png`) });
  }
  console.log(tag.padEnd(5), 'landed at scrollY', landed);
  await p.close();
}
await b.close();
