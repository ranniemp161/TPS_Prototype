/* Batch 5 check (Ami's 24 Oct 2026 notes): the fee shows per day and matches
   the pricing engine for every choice; meals always in; the massage at the
   standard rhythm; the Recommended notes follow What matters most; Your
   programme lists what was chosen; the form carries the total and the per day
   figure. node lab/bespoke-perday-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const P = createRequire(import.meta.url)('../index/js/build-your-programme-pricing.js');

const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);

const state = { days: 7, format: 'in', shift: 'day', massage: true, scrub: true, reflex: true, facial: true, herbfoot: true, thermal: true };
const expect = () => {
  const sel = { ...state, meals: true, rhythm: P.standardRhythm(state.days) };
  const fee = P.calculate(sel).fee;
  return { perDay: Math.round(fee / state.days), total: Math.round(fee) };
};
const num = t => Number(String(t).replace(/[^0-9]/g, ''));
const set = (sel) => p.evaluate(s => { const i = document.querySelector(s); if (i.type === 'checkbox') i.checked = !i.checked; else i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); }, sel);
let ok = 0, bad = 0;
async function check(name) {
  await p.waitForTimeout(900);
  const r = await p.evaluate(() => ({
    bar: document.querySelector('.dk-fee__amount').textContent,
    sum: document.querySelector('.dk-sumfee').textContent,
    live: document.querySelector('[data-fee]').textContent,
    feeField: document.querySelector('[data-capture]').elements.fee.value,
    perDayField: document.querySelector('[data-capture]').elements.fee_per_day.value,
  }));
  const e = expect();
  const pass = num(r.bar) === e.perDay && num(r.sum) === e.perDay && /per day/.test(r.live) && num(r.live) === e.perDay && Number(r.feeField) === e.total && Number(r.perDayField) === e.perDay;
  pass ? ok++ : bad++;
  console.log(pass ? '  ok  ' : '  FAIL', name.padEnd(34), `shows ${r.bar} (${r.live})`, `want £${e.perDay}`, `| form total ${r.feeField} per day ${r.perDayField}`);
}
const click = async (sel, key, val) => { await set(sel); state[key] = val; };

await check('7 days complete');
await click('input[name="shift"][value="night"]', 'shift', 'night'); await check('7 days, day and night');
await click('input[name="shift"][value="day"]', 'shift', 'day'); await check('7 days, back to day');
await click('input[name="format"][value="out"]', 'format', 'out'); await check('7 days, live-out');
await click('input[name="format"][value="in"]', 'format', 'in'); await check('7 days, back to live-in');
await click('input[name="massage"]', 'massage', false); await check('7 days, no massage');
await click('input[name="massage"]', 'massage', true); await check('7 days, massage back');
await click('input[name="days"][value="14"]', 'days', 14); await check('14 days complete');
await click('input[name="days"][value="30"]', 'days', 30); await check('30 days complete');
for (const k of ['scrub', 'reflex', 'facial', 'herbfoot', 'thermal']) { await click(`input[name="${k}"]`, k, false); }
await check('30 days, five extras off');
await click('input[name="shift"][value="night"]', 'shift', 'night'); await check('30 days, extras off, night');

// The published per day figures on the Programmes page (complete, live-in, day).
const pub = [7, 14, 30].map(d => Math.floor(P.calculate(P.completeSelection(d)).fee / d));
console.log('Programmes page per day:', pub.join(', '), '| builder complete per day:', [7, 14, 30].map(d => Math.round(P.calculate(P.completeSelection(d)).fee / d)).join(', '));

// Recommended notes.
const recs = () => p.evaluate(() => ({ night: !document.querySelector('[data-rec="night"]').hidden, massage: !document.querySelector('[data-rec="massage"]').hidden }));
console.log('Recommended, nothing ticked:', JSON.stringify(await recs()));
await set('input[name="p-sleep"]'); await p.waitForTimeout(300); console.log('after Sleep and rest:', JSON.stringify(await recs()));
await set('input[name="p-recovery"]'); await p.waitForTimeout(300); console.log('after My own recovery too:', JSON.stringify(await recs()));
await set('input[name="p-sleep"]'); await p.waitForTimeout(300); console.log('Sleep and rest off again:', JSON.stringify(await recs()));

// Your programme list, and the brief.
console.log('Your programme list:\n' + await p.evaluate(() => [...document.querySelectorAll('[data-decide-list] li')].map(li => '   ' + li.textContent.replace(/\s+/g, ' ').trim()).join('\n')));
console.log('Built title:', await p.evaluate(() => document.querySelector('[data-built-title]').textContent));
const brief = await p.evaluate(() => document.querySelector('[data-brief-text]').textContent);
console.log('Brief check: 7am', /7am/.test(brief), '| 11.30pm', /11\.30/.test(brief), '| £30', /£30/.test(brief), '| sessions', /session/.test(brief), '| Herbal bath', /Herbal bath/.test(brief), '| per day', /per day/.test(brief));
console.log(bad ? `${bad} PRICE CASES FAILED` : `ALL ${ok} PRICE CASES MATCH`, '| errors', JSON.stringify(errs));
await b.close();
