/* The standfirst assembles line by line out of a mask. A masked line reveal
   fails in one specific way that no static check catches: the mask clipping
   the descenders. So this reads the line boxes, walks the trigger, and
   confirms every line actually reaches its resting position.
     node lab/standfirst.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
let bad = 0;
for (const [w,h] of [[1920,1080],[1600,900],[1280,670],[900,800],[390,844]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT,'v1.html')).href, { waitUntil:'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout:20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto';
    const a=document.querySelector('.act--turn');
    window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY - window.innerHeight*0.25); });
  await p.waitForTimeout(2200);
  const r = await p.evaluate(() => {
    const el=document.querySelector('[data-turn-kinetic]');
    const masks=[...el.querySelectorAll('.kin-line')];
    const inner=masks.map(m=>m.firstElementChild);
    const cs=getComputedStyle(el);
    const clipped = masks.some(m => {
      const mi = m.getBoundingClientRect(), si = m.firstElementChild.getBoundingClientRect();
      return si.bottom > mi.bottom + 1.5;   // descenders sheared by the mask
    });
    return { lines: masks.length,
             resting: inner.every(s => Math.abs(s.getBoundingClientRect().top - s.parentElement.getBoundingClientRect().top) < 2),
             opacity: Math.min(...inner.map(s => +getComputedStyle(s).opacity)),
             size: Math.round(parseFloat(cs.fontSize)),
             chars: Math.round(el.getBoundingClientRect().width / parseFloat(cs.fontSize) * 2),
             clipped, text: el.textContent.slice(0, 34) };
  });
  const issues = [];
  if (r.lines < 2) issues.push('not split into lines');
  if (!r.resting) issues.push('a line never reached its resting position');
  if (r.opacity < 0.99) issues.push(`a line stopped at ${r.opacity} opacity`);
  if (r.clipped) issues.push('the mask is shearing descenders');
  if (!r.text.startsWith('In Malaysian')) issues.push('text lost in the split');
  if (errs.length) issues.push('errors: ' + errs.join('|'));
  if (issues.length) bad++;
  console.log(`  ${(w+'x'+h).padEnd(10)} ${r.lines} lines at ${r.size}px, about ${r.chars} characters  ${issues.length ? 'ISSUE ' + issues.join('; ') : 'ok'}`);
  await p.screenshot({ path: path.join(OUT, `${w}x${h}.png`) });
  await p.close();
}
console.log(bad ? `\n${bad} size(s) with a problem.` : '\nStandfirst assembles and lands cleanly at every size.');
await b.close();
