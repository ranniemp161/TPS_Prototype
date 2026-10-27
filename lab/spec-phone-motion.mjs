/* Your Postpartum Specialist on phones: frames of the entrance after one jump.
   node lab/spec-phone-motion.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
await p.evaluate(() => scrollTo(0, document.querySelector('#specialist').getBoundingClientRect().top + scrollY - 60));
let last = 0;
for (const t of [120, 350, 650, 1000, 1600]) { await p.waitForTimeout(t - last); last = t; await p.screenshot({ path: `${out}/mo-${t}.png`, clip: { x: 0, y: 80, width: 390, height: 620 } }); }
await b.close();
