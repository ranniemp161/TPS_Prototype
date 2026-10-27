/* FUNNEL-PLAN.md chat 2 + the due date calendar (TJ, 13 Oct 2026): the due date screen. node lab/funnel-due-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
const fmtMonth = (off) => { const n = new Date(); return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(n.getFullYear(), n.getMonth() + off, 1))); };
for (const [w, h] of [[1440, 900], [390, 844], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => ({
    name: document.querySelector('[data-step-name]').textContent,
    dis: document.querySelector('[data-next]').getAttribute('aria-disabled'),
    stop: [...document.querySelectorAll('.dk-line__stop')].findIndex(s => s.classList.contains('is-on')),
    brief: document.querySelector('[data-brief-text]').textContent,
    title: (document.querySelector('#step-due .dk-step__t') || {}).textContent,
    note: (document.querySelector('#due-note') || {}).textContent,
    month: document.querySelector('[data-due-month]').textContent,
    chosen: document.querySelector('[data-due-chosen]').textContent,
    val: document.getElementById('due').value,
    type: document.getElementById('due').type,
    pressed: [...document.querySelectorAll('.due-day[aria-pressed="true"]')].map(d => d.dataset.date),
    stepsDisabled: [...document.querySelectorAll('.due-cal__step')].map(d => d.disabled),
    days: document.querySelectorAll('.due-day').length,
    dayDisabled: [...document.querySelectorAll('.due-day')].filter(d => d.disabled).length,
    today: [...document.querySelectorAll('.due-day[aria-current="date"]')].length,
  }));
  const tag = w + 'x' + h;
  let s = await st(); ok(s.name === 'Start' && !s.dis, tag + ' start, Next live');
  ok(!/DUE DATE/.test(s.brief), tag + ' no due line before a date');
  await p.click('[data-next]'); await p.waitForTimeout(1500);
  s = await st(); ok(s.name === 'Due date' && s.stop === 1, tag + ' Begin lands on the due date screen');
  ok(s.title === 'When is your baby due?', tag + ' title');
  ok(s.note === 'Already had your baby? Choose the birth date.', tag + ' note: ' + s.note);
  ok(s.type === 'hidden', tag + ' #due is a hidden input');
  ok(s.dis === 'true', tag + ' Next blocked (aria-disabled)');
  ok(s.pressed.length === 0 && s.val === '' && s.chosen === '', tag + ' no day pressed, nothing written under the calendar');
  ok(s.month === fmtMonth(0), tag + ' header shows the current month: ' + s.month);
  ok(s.dayDisabled === 0 && s.today === 1, tag + ' no day disabled, today marked once');
  ok(s.stepsDisabled.every(x => !x), tag + ' both arrows live on arrival');
  await p.screenshot({ path: `lab/funnel/due-cal-empty-${tag}.png` });
  await p.click('[data-next]', { force: true }); await p.waitForTimeout(1200);
  s = await st(); ok(s.stop === 1, tag + ' clicking blocked Next does not move');
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1200);
  s = await st(); ok(s.stop === 1, tag + ' arrow key does not skip');
  await p.evaluate(() => { const d = document.querySelector('[data-deck]'); d.scrollTo({ left: 2 * d.clientWidth, behavior: 'auto' }); });
  await p.waitForTimeout(1500);
  s = await st(); ok(s.stop === 1 && s.dis === 'true', tag + ' swipe does not skip');
  // Arrows: 24 back, 48 forward, never disabled.
  let allLive = true;
  for (let i = 0; i < 24; i++) { await p.click('[data-due-step="-1"]'); const d = await p.evaluate(() => [...document.querySelectorAll('.due-cal__step')].some(x => x.disabled)); if (d) allLive = false; }
  s = await st(); ok(s.month === fmtMonth(-24), tag + ' 24 presses of the left arrow: ' + s.month);
  ok(allLive, tag + ' arrows never disabled going back');
  ok(s.pressed.length === 0 && s.dis === 'true', tag + ' moving months chooses nothing');
  // A past date, in a month reached with the left arrow.
  const past = await p.evaluate(() => document.querySelectorAll('.due-day')[9].dataset.date);
  await p.click('.due-day[data-date="' + past + '"]'); await p.waitForTimeout(400);
  s = await st(); ok(!s.dis && s.val === past && s.pressed.length === 1 && s.pressed[0] === past, tag + ' a past date is accepted: ' + past);
  for (let i = 0; i < 48; i++) { await p.click('[data-due-step="1"]'); const d = await p.evaluate(() => [...document.querySelectorAll('.due-cal__step')].some(x => x.disabled)); if (d) allLive = false; }
  s = await st(); ok(s.month === fmtMonth(24), tag + ' 48 presses of the right arrow: ' + s.month);
  ok(allLive, tag + ' arrows never disabled going forward');
  ok(s.pressed.length === 0 && s.val === past, tag + ' the chosen day is not pressed in another month, #due keeps it');
  // Back to the current month, then choose a day.
  for (let i = 0; i < 24; i++) await p.click('[data-due-step="-1"]');
  s = await st(); ok(s.month === fmtMonth(0), tag + ' back to the current month');
  for (let i = 0; i < 4; i++) await p.click('[data-due-step="1"]');
  const target = await p.evaluate(() => document.querySelectorAll('.due-day')[14].dataset.date);
  const [ty, tm, td] = target.split('-').map(Number);
  const words = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ty, tm - 1, td))).replace(',', '');
  await p.click('.due-day[data-date="' + target + '"]'); await p.waitForTimeout(500);
  s = await st();
  ok(s.pressed.length === 1 && s.pressed[0] === target, tag + ' tapping a day presses only that day');
  ok(s.chosen === words, tag + ' date in words under the calendar: ' + s.chosen);
  ok(s.val === target, tag + ' #due holds ' + target);
  ok(!s.dis, tag + ' Next live once a date is in');
  const second = await p.evaluate((t) => [...document.querySelectorAll('.due-day')].find(d => d.dataset.date !== t && !d.matches('[aria-pressed="true"]')).dataset.date, target);
  await p.click('.due-day[data-date="' + second + '"]'); await p.waitForTimeout(300);
  s = await st(); ok(s.pressed.length === 1 && s.pressed[0] === second && s.val === second, tag + ' only one day pressed at a time');
  await p.click('.due-day[data-date="' + target + '"]'); await p.waitForTimeout(300);
  const mon = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(ty, tm - 1, td)));
  s = await st(); ok(s.brief.includes('DUE DATE  ' + mon), tag + ' summary carries the DUE DATE line: ' + JSON.stringify(s.brief.split('\n').slice(0, 4)));
  await p.screenshot({ path: `lab/funnel/due-cal-chosen-${tag}.png` });
  await p.click('[data-next]'); await p.waitForTimeout(1500);
  s = await st(); ok(s.name === 'How long' && s.stop === 2, tag + ' Next moves to How long (step order, TJ 14 Oct 2026)');
  await p.click('[data-back]'); await p.waitForTimeout(1500);
  s = await st(); ok(s.val === target && s.pressed[0] === target && s.chosen === words, tag + ' coming back keeps the choice');
  ok(!errs.length, tag + ' no errors ' + errs.join('; '));
  await p.close();
}
await b.close();
console.log(bad ? bad + ' failed' : 'all passed');
