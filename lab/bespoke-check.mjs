/* Build 10 browser check: drives the page's controls and compares the ticker,
   the panel and the spec's figures. node lab/bespoke-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
// Ported to the deck (restyle chat 1, 12 Oct 2026): the Build 10 ticker and panel
// ([data-ticker-fee], [data-fee-roll]) went with the deck rebuild of 10 Oct. The
// ticker is now the fee band's figure, the panel the summary's figure.
const num = t => String(t).replace(/[^0-9]/g, '');
const read = () => p.evaluate(() => ({
  ticker: document.querySelector('.dk-fee__amount').textContent,
  panel: document.querySelector('.dk-sumfee').textContent,
  live: document.querySelector('[data-fee]').textContent,
  done: !document.querySelector('[data-complete-notice]').hidden,
  floor: document.querySelector('[data-floor-notice]').hidden ? '' : document.querySelector('[data-floor-notice]').textContent,
  rhythms: [...document.querySelectorAll('input[name="rhythm"]')].map(i => i.value + (i.checked ? '*' : '')).join(' ')
}));
const click = sel => p.evaluate(s => { document.querySelector(s).click(); }, sel);
const cases = [];
async function step(name, sel, want) {
  if (sel) await click(sel);
  await p.waitForTimeout(900);
  const r = await read();
  r.ticker = num(r.ticker); r.panel = num(r.panel);
  const ok = String(want) === r.ticker && r.ticker === r.panel && num(r.live) === r.ticker;
  cases.push(ok);
  console.log(ok ? '  ok  ' : '  FAIL', name, JSON.stringify(r), 'want', want);
}
await step('default 7 complete', null, 2495);
await step('7 night', 'input[name="shift"][value="night"]', 2528);
await step('7 back to day', 'input[name="shift"][value="day"]', 2495);
await step('7 daytime in-home', 'input[name="format"][value="out"]', 2705);
await step('7 back to live-in', 'input[name="format"][value="in"]', 2495);
await step('7 no meals', 'input[name="meals"][value="no"]', 2245);
await step('7 meals yes', 'input[name="meals"][value="yes"]', 2495);
await step('7 three massages', 'input[name="rhythm"][value="s3"]', 2431);
await step('7 back to four massages', 'input[name="rhythm"][value="s4"]', 2495);
await step('7 no massage (floor)', 'input[name="massage"]', 2245);
await step('7 massage back', 'input[name="massage"]', 2495);
await step('14 days', 'input[name="days"][value="14"]', 4495);
await step('14 twice a week', 'input[name="rhythm"][value="w2"]', 4243);
await step('30 days', 'input[name="days"][value="30"]', 6399);
for (const k of ['scrub', 'reflex', 'facial', 'herbfoot', 'thermal']) await click(`input[name="${k}"]`);
await step('30 extras all off', null, 5980);
await click('input[name="format"][value="out"]'); await p.waitForTimeout(150);
const night = await p.evaluate(() => ({ disabled: document.querySelector('input[name="shift"][value="night"]').disabled, band: !document.querySelector('[data-night-band]').hidden }));
console.log('night rule', JSON.stringify(night));
await click('input[name="format"][value="in"]'); await p.waitForTimeout(260);
await p.screenshot({ path: `${out}/bespoke-1440-rolling.png` });
await p.waitForTimeout(1200);
await p.screenshot({ path: `${out}/bespoke-1440-settled.png` });
console.log(cases.every(Boolean) ? 'ALL UI CASES MATCH' : 'UI MISMATCH', 'errors', JSON.stringify(errs));
await b.close();
