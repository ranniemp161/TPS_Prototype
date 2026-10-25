/* Is the due screen centred when it first appears, and does it move when a
   toggle is tapped? Measures the title's centre against the window's centre.
   node lab/due-centre-check.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [w = '1864', h = '983'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED !== '1' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
await passPostcode(p);
const m = () => p.evaluate(() => {
  const t = document.querySelector('#step-due .dk-step').getBoundingClientRect();
  const root = document.querySelector('.dk-deck, [data-deck], .dk__deck') || document.querySelector('.dk');
  const sc = [...document.querySelectorAll('*')].find(e => e.scrollWidth > e.clientWidth + 5 && getComputedStyle(e).overflowX !== 'visible' && e.querySelector('#step-due'));
  return { offCentre: Math.round((t.left + t.width / 2) - document.documentElement.clientWidth / 2), scrollLeft: sc ? sc.scrollLeft : null, clientW: sc ? sc.clientWidth : null, docW: document.documentElement.clientWidth };
});
await p.click('.dk-next'); await p.waitForTimeout(1500);
console.log('after Begin       ', JSON.stringify(await m()));
await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(1200);
console.log('after a toggle    ', JSON.stringify(await m()));
await b.close();
