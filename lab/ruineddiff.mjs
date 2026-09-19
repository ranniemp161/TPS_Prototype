/* Compare v1-ruined against the copy taken immediately before this change,
   at identical scroll positions. The hero handoff is the thing that must not
   move, so it is sampled densely and settled before every read.
     node lab/ruineddiff.mjs <outdir> <fromVh> <toVh> <steps> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const FROM = +process.argv[3], TO = +process.argv[4], N = +process.argv[5];
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
// NOISE=1 runs the before file twice. Two loads of the identical page never
// match to the pixel, because the fog runs on a 47 second CSS keyframe loop
// on the wall clock. That floor has to be known before any difference
// between two files can be called a difference.
const PAIR = process.env.NOISE
  ? [['aft', 'lab/ruined-before/v1.html'], ['bef', 'lab/ruined-before/v1.html']]
  : [['aft', 'v1-ruined.html'], ['bef', 'lab/ruined-before/v1.html']];
for (const [tag, file] of PAIR) {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(900);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto';
                           if (window.__drift) window.__drift.freeze(12); });
  for (let i = 0; i < N; i++) {
    const v = +(FROM + (TO - FROM) * i / (N - 1)).toFixed(2);
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    let prev = null;
    for (let t = 0; t < 20; t++) {
      await p.waitForTimeout(105);
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
  console.log(tag, 'errors:', errs.length ? errs.join(' | ') : 'none');
  await p.close();
}
await b.close();
