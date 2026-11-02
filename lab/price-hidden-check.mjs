// No price before How long (TJ, 1 Nov 2026; Opus). Walks the builder for real:
// Start (postcode), Due date (date + baby), How long, then one screen on, and
// reports whether the bar's fee is visible on each. Shoots each screen's bar.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { passPostcode } from './pc-pass.mjs';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
let fails = 0;
const feeState = p => p.evaluate(() => {
  const f = document.querySelector('.dk-fee'); const s = getComputedStyle(f);
  return { shown: s.visibility === 'visible' && parseFloat(s.opacity) > 0.5, text: f.querySelector('.dk-fee__amount').textContent, step: document.querySelector('[data-step-name]').textContent };
});
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'build-your-programme.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const check = async (label, want) => {
    await p.waitForTimeout(1300);
    const r = await feeState(p);
    const ok = r.shown === want; if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${w} ${label.padEnd(16)} step "${r.step}"  price ${r.shown ? 'shown ' + r.text : 'hidden'}`);
    await p.screenshot({ path: path.join(OUT, `pricehide-${w}-${label.replace(/\W+/g, '-')}.png`), clip: { x: 0, y: h - 130, width: w, height: 130 } });
  };
  await check('start', false);
  await passPostcode(p);
  await p.click('.dk-next');
  await check('due date', false);
  await p.click('[data-due-grid] button:not([disabled]) >> nth=20'); await p.waitForTimeout(300);
  await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(300);
  await p.click('.dk-next');
  await check('how long', true);
  await p.click('.dk-next');
  await check('next screen', true);
  await p.click('.dk-back'); await p.waitForTimeout(200); await p.click('.dk-back');
  await check('back to due', false);
  if (errs.length) { fails++; console.log('page errors', errs); }
  await p.close();
}
await b.close();
console.log(fails ? `${fails} FAILED` : 'all ok');
process.exit(fails ? 1 : 0);
