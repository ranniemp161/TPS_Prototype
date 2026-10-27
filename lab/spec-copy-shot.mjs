/* Your Postpartum Specialist on a phone: the copy and checks under the portrait.
   node lab/spec-copy-shot.mjs <outfile> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
await p.evaluate(() => scrollTo(0, document.querySelector('[data-spec-frame]').getBoundingClientRect().bottom + scrollY - 200));
await p.waitForTimeout(2800);
await p.screenshot({ path: process.argv[2] });
await b.close();
