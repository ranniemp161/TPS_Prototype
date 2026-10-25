/* The due screen's centring under real world timing: fonts held back, Begin
   pressed early. node lab/due-centre-slow.mjs [w] [h] [fontDelayMs] [beginAfterMs] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1864', h = '983', fd = '2500', ba = '600'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: +w, height: +h } });
await ctx.route(/\.(woff2?|ttf|otf)(\?|$)|fonts\.(googleapis|gstatic)\.com/, async r => { await new Promise(s => setTimeout(s, +fd)); await r.continue(); });
const p = await ctx.newPage();
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { waitUntil: 'commit' });
await p.waitForTimeout(+ba);
const m = () => p.evaluate(() => { const t = document.querySelector('#step-due .dk-step').getBoundingClientRect(); return Math.round((t.left + t.width / 2) - document.documentElement.clientWidth / 2); });
try { await p.click('.dk-next', { timeout: 5000 }); } catch (e) { console.log('Begin not clickable yet'); }
for (const t of [300, 1000, 2500, 4500]) { await p.waitForTimeout(t === 300 ? 300 : t - 300); console.log(`off centre after Begin +${t}ms: ${await m()}px`); }
await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(1200);
console.log('after a toggle:', await m(), 'px');
await p.screenshot({ path: 'lab/shots/b5/due-slow.png' });
await b.close();
