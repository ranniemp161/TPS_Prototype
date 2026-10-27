/* Housekeeping zones title on a phone, for looking at it. node lab/zones-title-shot.mjs <outfile> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
await p.evaluate(() => { const t = document.querySelector('.zones__title'); window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 150); });
await p.waitForTimeout(4000);
await p.screenshot({ path: process.argv[2] });
await b.close();
