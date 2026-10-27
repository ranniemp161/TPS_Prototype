/* One way to choose (TJ, 13 Oct 2026): every choice step at 1440 and 390, the toggles
   switching, the fee following, and the old rules (night care live-in only, rhythm off
   without massage). node lab/toggle-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.evaluate(v => { const f = document.getElementById('due'); f.value = v; f.dispatchEvent(new Event('input', { bubbles: true })); }, '2027-03-15'); await p.waitForTimeout(300);   // FUNNEL-PLAN chat 2: Next is blocked on the due date screen until a date is in
  const fee = () => p.evaluate(() => document.querySelector('[data-fee]').textContent.trim());
  const f0 = await fee();
  const st = await p.evaluate(() => ({ rows: document.querySelectorAll('.tg').length, old: document.querySelectorAll('.dkl, .dkd, .dk-dot, .treat, .prio').length, on: [...document.querySelectorAll('.tg input:checked')].map(i => i.name + '=' + i.value) }));
  console.log(w, 'rows', st.rows, 'old controls left', st.old, 'on at start', st.on.join(' '), 'fee', f0);
  ok(st.old === 0, 'old controls still in page');
  for (let i = 1; i <= 8; i++) { await p.click('[data-next]'); await p.waitForTimeout(1500); if (w === 390) await p.screenshot({ path: `lab/choice-study/p${i}-390.png` }); else await p.screenshot({ path: `lab/choice-study/f${i}-1440.png` }); }
  // Toggle checks, driven by clicking the visible rows.
  const click = sel => p.evaluate(s => document.querySelector(s).closest('.tg').click(), sel);
  const val = n => p.evaluate(n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value, n);
  await click('input[name="days"][value="14"]'); await p.waitForTimeout(400);
  ok(await val('days') === '14', 'days 14'); const f14 = await fee(); ok(f14 !== f0, 'fee follows days'); console.log(w, 'fee at 14 days', f14);
  await click('input[name="days"][value="14"]'); await p.waitForTimeout(300); ok(await val('days') === '14', 'pick one cannot be turned off');
  await click('input[name="format"][value="out"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelector('input[name="shift"][value="night"]').disabled), 'night disabled for daytime');
  await click('input[name="format"][value="in"]'); await click('input[name="massage"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => [...document.querySelectorAll('input[name="rhythm"]')].every(i => i.disabled)), 'rhythm off without massage');
  await click('input[name="massage"]'); await click('input[name="p-sleep"]'); await click('input[name="p-food"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelector('[data-prio-count]').hidden === false), 'priority count shows');
  const colours = await p.evaluate(() => { const on = document.querySelector('.tg:has(input:checked) .tg__t'), off = document.querySelector('.tg:has(input:not(:checked)) .tg__t'); return [getComputedStyle(on).color, getComputedStyle(off).color]; });
  console.log(w, 'on / off text', colours.join(' / '));
  const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(over <= 0, 'sideways overflow ' + over); ok(!errs.length, 'errors ' + errs.join('; '));
  await p.close();
}
await b.close();
console.log(bad ? bad + ' failed' : 'all passed');
