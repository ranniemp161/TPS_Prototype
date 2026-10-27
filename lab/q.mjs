/* Quick computed style query at a viewport. node lab/q.mjs <width> "<js expression>" */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w, expr] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: w > 860 ? 900 : 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(expr)));
await b.close();
