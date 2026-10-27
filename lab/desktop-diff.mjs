/* Desktop guard for MOBILE-PLAN.md: screenshots What We Do at 1440x900 at fixed scroll
   points with CSS animation paused, so two runs can be compared.
   node lab/desktop-diff.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.addInitScript(() => { Math.random = () => 0.5; });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: '*,*::before,*::after{animation-play-state:paused!important;animation-delay:0s!important;caret-color:transparent!important} video{visibility:hidden!important}' });
await p.waitForTimeout(2500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < H; y += 450) {
  await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/d${String(i).padStart(3, '0')}.png` }); i++;
}
console.log('desktop height', H, 'shots', i, 'errors', JSON.stringify(errs));
await b.close();
