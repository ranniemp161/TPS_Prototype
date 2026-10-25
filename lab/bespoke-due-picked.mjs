/* The due screen with a date and First baby picked. node lab/bespoke-due-picked.mjs <out.png> [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await passPostcode(p);
await p.click('.dk-next'); await p.waitForTimeout(1000);
await p.click('[data-due-grid] button:not([disabled]) >> nth=20'); await p.waitForTimeout(400);
await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(600);
await p.screenshot({ path: out });
console.log('errors', JSON.stringify(errs));
await b.close();
