/* Find the frame where the bath scene is actually at rest, flush at the top
   of the window, and report where the copy sits in it. Judging the placement
   at any other scroll position is judging it mid climb.
     node lab/bathrest.mjs [shotdir] */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]; if (OUT) mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[1600,900],[1904,945],[1440,820],[1280,670]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; });
  // walk until the scene is flush and still
  let best = null;
  for (let v = 1.3; v <= 2.1; v += 0.05) {
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(220);
    const r = await p.evaluate(() => {
      const g = s => { const e=document.querySelector(s); const b=e.getBoundingClientRect();
        return { t:Math.round(b.top), b:Math.round(b.bottom) }; };
      return { bath:g('.bath'), img:g('.bath__img'), lines:g('.bath__lines'),
               op:+getComputedStyle(document.querySelector('[data-bath-line]')).opacity, vh:window.innerHeight };
    });
    if (r.bath.t <= 0 && r.bath.t > -8 && r.op > 0.95) { best = { v, r }; break; }
  }
  if (!best) { console.log(`  ${w}x${h}  no flush frame found`); await p.close(); continue; }
  const { v, r } = best;
  const pct = x => (x / r.vh * 100).toFixed(0) + '%';
  console.log(`  ${(w+'x'+h).padEnd(10)} at rest at ${v.toFixed(2)}vh   copy sits ${pct(r.lines.t)} to ${pct(r.lines.b)} of the window   image bottom ${pct(r.img.b)}`);
  if (OUT) { await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
             await p.waitForTimeout(700);
             await p.screenshot({ path: path.join(OUT, `${w}x${h}.png`) }); }
  await p.close();
}
await b.close();
