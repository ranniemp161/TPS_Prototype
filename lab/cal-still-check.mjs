/* The calendar stays still (TJ, 14 Oct 2026): arrows and grid do not move between months. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;
for (const [w, h] of [[1440, 900], [1865, 905], [390, 844], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.click('[data-next]'); await p.waitForTimeout(1200);
  const pos = () => p.evaluate(() => { const r = s => { const e = document.querySelector(s).getBoundingClientRect(); return Math.round(e.left) + ',' + Math.round(e.top); }; return [r('[data-due-step="-1"]'), r('[data-due-step="1"]'), r('.due-cal__grid'), document.querySelector('.due-cal__grid').getBoundingClientRect().height | 0].join(' '); });
  const seen = new Set();
  for (let k = 0; k < 12; k++) { seen.add(await pos()); await p.click('[data-due-step="1"]'); await p.waitForTimeout(120); }
  await p.click('.due-day:not(.due-day--pad)'); await p.waitForTimeout(400); seen.add(await pos());
  console.log(w + 'x' + h, seen.size === 1 ? 'still across 12 months and a pick' : 'MOVES: ' + [...seen].join(' | '));
  if (seen.size !== 1) bad++;
  await p.close();
}
await b.close();
console.log(bad ? bad + ' failed' : 'all passed');
