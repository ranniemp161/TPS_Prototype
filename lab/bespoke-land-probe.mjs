/* Build Your Programme, flowing page: where Next from step 02 lands at a short window, over time. node lab/bespoke-land-probe.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1835, height: 605 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
await p.waitForLoadState('load'); await p.waitForTimeout(1500);
const info = () => p.evaluate(() => { const pg = document.querySelectorAll('.dk-page'); const hdr = document.querySelector('[data-nav]').getBoundingClientRect().height, fee = document.querySelector('.dk-fee').getBoundingClientRect().height; return { y: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight, hdr: Math.round(hdr), fee: Math.round(fee), top3: Math.round(pg[3].getBoundingClientRect().top + scrollY), want: Math.round(pg[3].getBoundingClientRect().top + scrollY - hdr - fee) }; });
for (let i = 0; i < 2; i++) { await p.click('[data-next]'); await p.waitForTimeout(1500); }
console.log('on 02', JSON.stringify(await info()));
await p.click('[data-next]');
for (const t of [300, 800, 1500, 2500]) { await p.waitForTimeout(t === 300 ? 300 : 500); console.log(t, JSON.stringify(await info())); }
await b.close();
