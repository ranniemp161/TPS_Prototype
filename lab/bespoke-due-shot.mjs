/* The due date screen: Begin, no date picked. node lab/bespoke-due-shot.mjs <out.png> [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
await passPostcode(p);
await p.click('.dk-next'); await p.waitForTimeout(1200);
await p.screenshot({ path: out });
console.log(await p.evaluate(() => document.querySelector('[data-step-name]').textContent));
await b.close();
