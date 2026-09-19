/* Traces the dissolve act's four beats against scroll: the question, the
   clock, the light, and the answer. Checks the order holds and that the
   clock is fully gone before the answer starts, which is the thing TJ
   asked for and the thing most likely to drift. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const figTop = await p.evaluate(() =>
  document.querySelector('.act--peak [data-reveal]').getBoundingClientRect().top + scrollY);

const read = () => p.evaluate(() => {
  const o = s => {
    const el = document.querySelector(s);
    return el ? +getComputedStyle(el).opacity : null;
  };
  const sun = document.querySelector('[data-peak-sun]');
  const sky = sun.parentElement.getBoundingClientRect();
  const sr = sun.getBoundingClientRect();
  return {
    ask: o('[data-peak-ask]'),
    clock: o('[data-peak-clock]'),
    night: o('.dissolve__night'),
    answer: o('[data-peak-answer]'),
    // how far the sun has fallen through its sky box, 0 to 1
    sunT: +(((sr.top - sky.top) / (sky.height || 1)).toFixed(2)),
    lit: [...document.querySelectorAll('[data-peak-states] span')]
      .map(s => +(+getComputedStyle(s).opacity).toFixed(2)),
  };
});

console.log(' dy    ask  clock  night  answer  sunT  states');
let bothOn = [];
for (let dy = 0; dy <= 1600; dy += 80) {
  await p.evaluate(v => scrollTo(0, v), figTop + dy);
  await p.waitForTimeout(160);
  const r = await read();
  if (r.clock > 0.02 && r.answer > 0.02) bothOn.push(dy);
  console.log(
    String(dy).padStart(4),
    r.ask.toFixed(2).padStart(6), r.clock.toFixed(2).padStart(6),
    r.night.toFixed(2).padStart(6), r.answer.toFixed(2).padStart(7),
    String(r.sunT).padStart(6), ' ', r.lit.join(' ')
  );
}
console.log(bothOn.length
  ? `\nFAIL clock and answer both visible at dy ${bothOn.join(', ')}`
  : '\nPASS clock fully gone before the answer appears');

for (const dy of [120, 600, 1100, 1500]) {
  await p.evaluate(v => scrollTo(0, v), figTop + dy);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/seq-${String(dy).padStart(4, '0')}.png` });
}
await b.close();
