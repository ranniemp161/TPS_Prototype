/* Load narrower, reach the due screen, then widen the window (a browser
   sidebar collapsing): is the due screen still centred? node lab/due-resize-check.mjs [w1] [w2] [h] [order] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [w1 = '1683', w2 = '1864', h = '983', order = 'begin-then-resize'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w1, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
await passPostcode(p);
const m = () => p.evaluate(() => { const t = document.querySelector('#step-due .dk-step').getBoundingClientRect(); return Math.round((t.left + t.width / 2) - document.documentElement.clientWidth / 2); });
if (order === 'begin-then-resize') {
  await p.click('.dk-next'); await p.waitForTimeout(1200);
  console.log(`at ${w1}: off centre ${await m()}px`);
  await p.setViewportSize({ width: +w2, height: +h }); await p.waitForTimeout(1500);
  console.log(`resized to ${w2}: off centre ${await m()}px`);
} else {
  await p.setViewportSize({ width: +w2, height: +h }); await p.waitForTimeout(1500);
  await p.click('.dk-next'); await p.waitForTimeout(1200);
  console.log(`resized to ${w2} on the start screen, then Begin: off centre ${await m()}px`);
}
await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(1200);
console.log(`after a toggle: off centre ${await m()}px`);
await b.close();
