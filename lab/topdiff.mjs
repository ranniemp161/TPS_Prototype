/* The first three acts are in the same order in both versions, so the top of
   the page is directly comparable. Shoot current and baseline at identical
   absolute scroll positions and diff them.
     node lab/topdiff.mjs <outdir> <w> <h> */
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
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(900);
  for (let i = 0; i <= 28; i++) {
    const v = +(i * 0.1).toFixed(1);
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    // settle the scrub before shooting
    let prev = null;
    for (let t = 0; t < 12; t++) {
      await p.waitForTimeout(110);
      const now = await p.evaluate(() => {
        const e = document.querySelector('.bath__img');
        return e ? Math.round(e.getBoundingClientRect().top) : 0;
      });
      if (prev === now) break;
      prev = now;
    }
    await p.screenshot({ path: path.join(OUT, `${tag}_${String(i).padStart(2,'0')}_${v}.png`) });
  }
  await p.close();
}
await b.close();
console.log('shot');
