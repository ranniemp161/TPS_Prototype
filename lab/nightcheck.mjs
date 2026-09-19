/* The frame's wipe is scrubbed and its caption arrives once. Both were
   scoped to a section that no longer exists, so this walks the act and
   checks the clip actually opens and the line actually lands.
     node lab/nightcheck.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w,h] of [[1600,900],[390,844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT,'v1.html')).href, { waitUntil:'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout:20000 });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; });
  const top = await p.evaluate(() => {
    const a=document.querySelector('.act--turn'); return a.getBoundingClientRect().top + window.scrollY; });
  const vh = h;
  let openMin = 1e9, openMax = -1, lineMax = 0;
  for (let i = 0; i <= 14; i++) {
    await p.evaluate(y => window.scrollTo(0, y), top - vh * 0.9 + (vh * 2.2) * i / 14);
    await p.waitForTimeout(320);
    const r = await p.evaluate(() => {
      const m=document.querySelector('[data-night-reveal]');
      const l=document.querySelector('[data-night-line]');
      const cp=getComputedStyle(m).clipPath;
      const pct = cp && cp.includes('inset') ? parseFloat(cp.match(/inset\(([\d.]+)/)?.[1] ?? '0') : 0;
      return { pct, op:+getComputedStyle(l).opacity };
    });
    openMin = Math.min(openMin, r.pct); openMax = Math.max(openMax, r.pct);
    lineMax = Math.max(lineMax, r.op);
  }
  await p.evaluate(y => window.scrollTo(0, y), top + vh * 0.9);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: path.join(OUT, `${w}x${h}.png`) });
  console.log(`  ${(w+'x'+h).padEnd(10)} wipe travels from ${openMax.toFixed(0)}% closed to ${openMin.toFixed(0)}%   caption reaches ${lineMax.toFixed(2)} opacity   errors ${errs.length?errs.join('|'):'none'}`);
  await p.close();
}
await b.close();
