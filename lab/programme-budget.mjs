/* The budget field's recommendation, and the summary scrollbar.
 *
 *   node lab/programme-budget.mjs        (needs the page served on 4321)
 *
 * lab/programme-check.mjs proves the arithmetic. This proves the thing
 * built on top of it: that a budget returns a programme the builder can
 * actually reach, priced in the format already chosen, and that the
 * control beside it puts that programme on the page.
 */
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const fails = [];
const ok = (n, g, w) => { if (g !== w) fails.push(`${n}: got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`); };

const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://localhost:4321/programme.html', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);

const ask = v => p.evaluate(x => {
  const i = document.querySelector('#budget');
  i.value = x; i.dispatchEvent(new Event('input', { bubbles: true }));
  const fit = document.querySelector('[data-budget-fit]');
  const main = fit.querySelector(':scope > [data-fit-apply]');
  const altBox = fit.querySelector('[data-fit-alt]');
  const altBtn = altBox.querySelector('[data-fit-apply]');
  return { hidden: fit.hidden,
    head: fit.querySelector('[data-fit-head]').textContent,
    body: fit.querySelector('[data-fit-body]').textContent,
    btn: main.hidden ? null : main.textContent,
    alt: altBox.hidden ? null : altBox.querySelector('[data-fit-alt-body]').textContent,
    altBtn: (altBox.hidden || altBtn.hidden) ? null : altBtn.textContent,
    tone: document.querySelector('[data-budget-answer]').textContent.slice(0, 26) };
}, v);

let r = await ask('8000');
ok('8000 head', r.head, 'Every one of our programmes sits within that.');
ok('8000 btn',  r.btn,  'Show me the thirty day programme');
ok('8000 alt',  r.alt,  null);

r = await ask('5000');
ok('5000 head', r.head, 'Our complete fourteen day programme fits that.');
ok('5000 body', r.body, '£4,495 indicative, with every element of the published programme in it.');
ok('5000 btn',  r.btn,  'Show me the fourteen day programme');
ok('5000 alt',  r.alt,  null);

r = await ask('4200');
ok('4200 head', r.head, 'Our complete seven day programme fits that.');
ok('4200 btn',  r.btn,  'Show me the seven day programme');
ok('4200 alt',  r.alt,  'Or fourteen days, shaped to fit. It starts at £4,045 indicative and we build up from there with you.');
ok('4200 altBtn', r.altBtn, 'Start from fourteen days');

r = await ask('1900');
ok('1900 head', r.head, 'A five day programme can be shaped to sit near that.');
ok('1900 btn',  r.btn,  'Start from five days');
ok('1900 alt',  r.alt,  null);

r = await ask('1500');
ok('1500 head', r.head, 'That sits below where our shortest programme starts.');
ok('1500 btn',  r.btn,  null);
ok('1500 tone', r.tone, 'Thank you. That is below w');

ok('blank clears', (await ask('')).hidden, true);
ok('zero clears',  (await ask('0')).hidden, true);

// the recommendation prices in the format already chosen
await p.evaluate(() => document.querySelector('input[name="format"][value="out"]').click());
r = await ask('5000');
ok('live-out head', r.head, 'Our complete fourteen day programme fits that.');
ok('live-out body', r.body, '£4,915 indicative, with every element of the published programme in it.');
await p.evaluate(() => document.querySelector('input[name="format"][value="in"]').click());

// the buttons put the programme on the page
const applied = await p.evaluate(async () => {
  const i = document.querySelector('#budget');
  i.value = '4200'; i.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('[data-budget-fit] > [data-fit-apply]').click();
  await new Promise(r => setTimeout(r, 400));
  const a = { days: document.querySelector('input[name="days"]:checked').value,
    fee: document.querySelector('[data-fee]').textContent,
    complete: !document.querySelector('[data-complete-notice]').hidden };
  i.value = '4200'; i.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('[data-fit-alt] [data-fit-apply]').click();
  await new Promise(r => setTimeout(r, 400));
  a.altDays = document.querySelector('input[name="days"]:checked').value;
  a.altRhythm = document.querySelector('input[name="rhythm"]:checked').value;
  a.stepInView = (() => { const r = document.getElementById('step-02').getBoundingClientRect();
    return r.top < innerHeight && r.bottom > 0; })();
  return a;
});
ok('apply sets seven complete', applied.days, '7');
ok('apply prices seven', applied.fee, '£2,495');
ok('apply is complete', applied.complete, true);
ok('alt sets fourteen', applied.altDays, '14');
ok('alt keeps the standard rhythm', applied.altRhythm, 'w2');
ok('apply scrolls to the length', applied.stepInView, true);

const bar = await p.evaluate(() => {
  const s = getComputedStyle(document.querySelector('.summary__body'));
  const body = document.querySelector('.summary__body');
  return { width: s.scrollbarWidth, color: s.scrollbarColor,
    overBy: body.scrollHeight - body.clientHeight };
});
ok('scrollbar thin', bar.width, 'thin');
if (!/rgb\(201, 185, 181\)/.test(bar.color)) fails.push(`scrollbar colour: ${bar.color}`);
console.log(`panel overflows by ${bar.overBy}px (was 523)`);

if (errs.length) fails.push('page errors: ' + errs.join(' | '));
await b.close();
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'Budget and scrollbar checks passed.');
process.exit(fails.length ? 1 : 0);
