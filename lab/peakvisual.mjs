import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const peakTop = await p.evaluate(() => document.querySelector('.act--peak').offsetTop);
await p.evaluate(y => scrollTo(0, y), peakTop);
await p.waitForTimeout(1600);
await p.screenshot({ path: `${out}/a-arrival-settled.png` });

await p.evaluate(y => scrollTo(0, y), peakTop + 2400);
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/b-mid-crossfade.png` });

await p.evaluate(y => scrollTo(0, y), peakTop + 2880);
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/c-full-night.png` });

await b.close();
