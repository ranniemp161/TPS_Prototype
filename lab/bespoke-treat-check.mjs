// Restyle chat 5: steps 05 and 06, Device D rows.  node lab/bespoke-treat-check.mjs <outdir>
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
let fails = 0;
const ok = (n, c, i = '') => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (i ? '  ' + i : '')); };
const NAMES = ['massage', 'scrub', 'reflex', 'facial', 'herbfoot', 'thermal'];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  console.log('--- ' + w);
  const p = await b.newPage({ viewport: { width: w, height: h } });
  try { await p.goto(url, { timeout: 45000 }); } catch { await p.goto(url, { timeout: 60000 }); }
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const go = async (i) => { await p.evaluate(i => { const d = document.querySelector('[data-deck]'); d.scrollTo({ left: i * d.clientWidth, behavior: 'instant' }); }, i); await p.waitForTimeout(1600); };
  const fee = () => p.evaluate(() => document.querySelector('[data-fee]').textContent.trim());
  const cnt = n => p.evaluate(n => document.querySelector(`[data-count="${n}"]`).textContent.trim(), n);
  const settle = () => p.waitForTimeout(1500);
  await go(5);
  const base = await fee();
  console.log('base fee', base, 'counts', JSON.stringify(await Promise.all(NAMES.map(cnt))));
  await p.screenshot({ path: `${out}/step05-${w}.png` });
  for (const n of NAMES) {
    await p.click(`.treat:has(input[name="${n}"])`); await settle();
    const off = { fee: await fee(), count: await cnt(n), checked: await p.evaluate(n => document.querySelector(`input[name="${n}"]`).checked, n), dot: await p.evaluate(n => getComputedStyle(document.querySelector(`input[name="${n}"] + .dk-dot`), '::before').backgroundColor, n) };
    await p.click(`.treat:has(input[name="${n}"])`); await settle();
    const on = { fee: await fee(), count: await cnt(n), checked: await p.evaluate(n => document.querySelector(`input[name="${n}"]`).checked, n), dot: await p.evaluate(n => getComputedStyle(document.querySelector(`input[name="${n}"] + .dk-dot`), '::before').backgroundColor, n) };
    ok(`untick ${n}`, !off.checked && on.checked && on.fee === base && off.fee !== base, `off ${JSON.stringify(off)} on ${JSON.stringify(on)}`);
  }
  // geometry / style of rows
  const rows = await p.evaluate(() => [...document.querySelectorAll('#step-05 .treat')].map(r => { const cs = getComputedStyle(r); const b = r.getBoundingClientRect(); const d = r.querySelector('.dk-dot'); return { cls: r.className, h: Math.round(b.height), bg: cs.backgroundColor, bt: cs.borderTopWidth + ' ' + cs.borderTopColor, bb: cs.borderBottomWidth, bl: cs.borderLeftWidth, dot: d ? Math.round(d.getBoundingClientRect().width) + 'x' + Math.round(d.getBoundingClientRect().height) : 'none', thumbs: r.querySelectorAll('img').length }; }));
  console.log(JSON.stringify(rows));
  ok('no row bg, only top hairline', rows.every(r => r.bg === 'rgba(0, 0, 0, 0)' && r.bb === '0px' && r.bl === '0px'));
  ok('rows 44px tall at least, no img', rows.every(r => r.h >= 44 && r.thumbs === 0));
  ok('first row no border', rows[0].bt.startsWith('0px'));
  // step 06
  await go(6);
  const note = () => p.evaluate(() => document.querySelector('[data-rhythm-note]').textContent.trim());
  const rhythmRows = () => p.evaluate(() => [...document.querySelectorAll('[data-rhythms] .rhythm')].map(r => ({ v: r.querySelector('input').value, checked: r.querySelector('input').checked, disabled: r.querySelector('input').disabled, std: !!r.querySelector('.rhythm__std'), h: Math.round(r.getBoundingClientRect().height), bg: getComputedStyle(r).backgroundColor, bb: getComputedStyle(r).borderBottomWidth, dot: Math.round(r.querySelector('.dk-dot').getBoundingClientRect().height), op: getComputedStyle(r).opacity })));
  console.log('rhythms', JSON.stringify(await rhythmRows()));
  await p.screenshot({ path: `${out}/step06-${w}.png` });
  const vals = (await rhythmRows()).map(r => r.v);
  for (const v of vals) {
    await p.click(`[data-rhythms] .rhythm:has(input[value="${v}"])`); await settle();
    const cur = await p.evaluate(() => document.querySelector('input[name="rhythm"]:checked').value);
    ok(`rhythm ${v}`, cur === v, `fee ${await fee()} note: ${(await note()).slice(0, 90)}`);
  }
  // disable path
  await go(5); await p.click('.treat:has(input[name="massage"])'); await settle(); await go(6);
  const rr = await rhythmRows();
  ok('rhythm disabled without massage', rr.every(r => r.disabled), JSON.stringify(rr.map(r => r.op)) + ' note: ' + (await note()).slice(0, 80));
  await p.screenshot({ path: `${out}/step06-off-${w}.png` });
  await go(5); await p.click('.treat:has(input[name="massage"])'); await settle(); await go(6);
  ok('rhythm re-enabled', (await rhythmRows()).every(r => !r.disabled));
  ok('no sideways overflow', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await p.close();
}
console.log(fails ? fails + ' FAILED' : 'all passed');
await b.close();
