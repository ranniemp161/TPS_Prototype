/* Bespoke prices against the Programmes card: size, numerals, digit spacing,
   at a laptop and a phone width. node lab/price-match-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const read = (sel) => (el => { const e = document.querySelector(el); const c = getComputedStyle(e); const d = e.querySelector('[class$="__digits"]'); return `${parseFloat(c.fontSize).toFixed(1)}px ${c.fontFamily.split(',')[0]} numerals ${c.fontVariantNumeric} digits ${d ? getComputedStyle(d).letterSpacing : 'not tightened'} "${e.textContent}"`; });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  console.log(`${w}  card         `, await p.evaluate(read(), '[data-pg-fee]'));
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  console.log(`${w}  bespoke bar  `, await p.evaluate(read(), '.dk-fee__amount'));
  console.log(`${w}  your progr.  `, await p.evaluate(read(), '.dk-decide .dk-sumfee'));
  await p.evaluate(() => { const i = document.querySelector('input[name="shift"][value="night"]'); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(1200);
  console.log(`${w}  after a change`, await p.evaluate(read(), '.dk-fee__amount'));
  await p.close();
}
await b.close();
