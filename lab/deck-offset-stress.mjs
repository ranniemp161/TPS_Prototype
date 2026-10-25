/* Push the deck off its screen by force in many ways and see whether it comes back within a frame or two.
   node lab/deck-offset-stress.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [w = '1860', h = '983'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await passPostcode(p);
await p.click('.dk-next'); await p.waitForTimeout(1500);
const off = () => p.evaluate(() => { const t = document.querySelector('#step-due .dk-step').getBoundingClientRect(); return Math.round((t.left + t.width / 2) - document.documentElement.clientWidth / 2); });
console.log('after Begin:', await off(), 'px');
for (const push of [184, -184, 60, 700]) {
  await p.evaluate(d => { const r = document.querySelector('[data-deck]'); r.scrollLeft += d; }, push);
  await p.waitForTimeout(80);
  console.log(`pushed deck by ${push}px: after 80ms off centre ${await off()}px`);
}
// pressing Begin again right after a reload, before the fonts settle
await p.reload({ waitUntil: 'commit' }); await p.waitForTimeout(150);
try { await p.click('.dk-next', { timeout: 3000 }); } catch {}
await p.waitForTimeout(1500);
console.log('Begin 150ms after reload:', await off(), 'px');
await p.click('label:has(#dkd-child-2)'); await p.waitForTimeout(800);
console.log('after a toggle:', await off(), 'px | errors', JSON.stringify(errs));
await b.close();
