/* The hero copy block sits inside a pinned stage with a fixed height, so a
   longer lede can push the button out of the frame. Checks the block fits
   at every size, including the short windows a zoomed browser produces.
     node lab/herocopy.mjs [shotdir] */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]; if (OUT) mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
let bad = 0;
for (const [w, h] of [[1920,1080],[1600,900],[1904,945],[1440,820],[1280,670],[1097,545],[820,900],[390,844],[360,740]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(700);
  const r = await p.evaluate(() => {
    const g = s => { const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect();
      return { t:Math.round(b.top), b:Math.round(b.bottom), l:Math.round(b.left), r:Math.round(b.right) }; };
    const lede = document.querySelector('.act--hero .lede');
    const lh = parseFloat(getComputedStyle(lede).lineHeight);
    return { copy:g('.act--hero .stage__copy'), lede:g('.act--hero .lede'),
             btn:g('.act--hero .btn--primary'), stage:g('.act--hero .stage'),
             lines: Math.round(lede.getBoundingClientRect().height / lh), vh:window.innerHeight };
  });
  const issues = [];
  if (r.btn.b > r.vh) issues.push(`button ${r.btn.b - r.vh}px below the fold`);
  if (r.copy.b > r.stage.b + 1) issues.push('copy overflows the stage');
  if (r.btn.b > r.stage.b + 1) issues.push('button overflows the stage');
  if (issues.length) bad++;
  console.log(`  ${(w+'x'+h).padEnd(10)} lede ${r.lines} lines, ends ${r.lede.b}px   button ends ${r.btn.b}px of ${r.vh}   ${issues.length ? 'ISSUE ' + issues.join('; ') : 'ok'}`);
  if (OUT && (w === 1600 || w === 390)) await p.screenshot({ path: path.join(OUT, `${w}x${h}.png`) });
  await p.close();
}
console.log(bad ? `\n${bad} size(s) with a problem.` : '\nHero copy fits at every size.');
await b.close();
