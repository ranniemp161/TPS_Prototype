/* Are the nav, hero and bath identical between v1 and v1-ruined? Renders
   both, finds the same frames in each (the top of the page, and the frame
   where the bath comes to rest), and diffs the pixels.
     node lab/sameregion.mjs <outdir> <w> <h> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2], W = +(process.argv[3]||1600), H = +(process.argv[4]||900);
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [tag, file] of [['v1', 'v1.html'], ['rn', 'v1-ruined.html']]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0);
                           if (window.__drift) window.__drift.freeze(12); });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, tag + '_hero.png') });
  // the frame where the bath is flush and still
  let found = null;
  for (let v = 1.3; v <= 2.0; v += 0.05) {
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(230);
    const r = await p.evaluate(() => ({
      t: Math.round(document.querySelector('.bath').getBoundingClientRect().top),
      op: +getComputedStyle(document.querySelector('[data-bath-line]')).opacity }));
    if (r.t <= 0 && r.t > -8 && r.op > 0.95) { found = v; break; }
  }
  await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), found);
  await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, tag + '_bath.png') });
  console.log(`  ${tag}: bath at rest at ${found.toFixed(2)}vh`);
  await p.close();
}
await b.close();
