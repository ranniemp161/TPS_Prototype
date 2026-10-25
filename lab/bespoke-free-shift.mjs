/* The released page (.dk.is-free, short phones): does a toggle or a date move
   under the finger when tapped? Scrolls each one to the middle of the window,
   taps it with the mouse, and compares where it and its neighbours sit on the
   screen before and after. node lab/bespoke-free-shift.mjs [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [w = '360', h = '640'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await passPostcode(p);
console.log('released page:', await p.evaluate(() => document.querySelector('.dk').classList.contains('is-free')));

const targets = await p.evaluate(() => {
  const t = [];
  document.querySelectorAll('.dk-page label.tg').forEach((l, i) => { if (!l.querySelector('input:disabled') && l.offsetParent) t.push({ sel: 'label.tg', i, name: l.querySelector('.tg__t').textContent.trim() }); });
  return t;
});
const days = [10, 15];
const where = (sel, i) => p.evaluate(([sel, i]) => {
  const el = document.querySelectorAll(sel)[i];
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.top), cx: r.left + r.width / 2, cy: r.top + r.height / 2, y: Math.round(window.scrollY) };
}, [sel, i]);

let moved = 0;
const run = async (sel, i, name, twice) => {
  await p.evaluate(([sel, i]) => document.querySelectorAll(sel)[i].scrollIntoView({ block: 'center' }), [sel, i]);
  await p.waitForTimeout(700);
  for (const pass of twice ? ['on', 'off'] : ['tap']) {
    const a = await where(sel, i);
    await p.mouse.click(a.cx, a.cy);
    await p.waitForTimeout(1000);
    const c = await where(sel, i);
    if (Math.abs(c.top - a.top) > 1) { moved++; console.log(`${name} ${pass}: moved on screen ${a.top} -> ${c.top} (page scroll ${a.y} -> ${c.y})`); }
  }
};
for (const d of days) await run('[data-due-grid] button.due-day', d, 'calendar day ' + d, false);
for (const t of targets) {
  const idx = await p.evaluate(name => [...document.querySelectorAll('label.tg')].findIndex(l => l.querySelector('.tg__t').textContent.trim() === name), t.name);
  if (idx < 0) { console.log('skipped (redrawn):', t.name); continue; }
  await run('label.tg', idx, t.name, true);
}
console.log(moved ? `${moved} taps moved something` : 'nothing moved under the finger', `(${targets.length} toggles, ${days.length} days) | errors`, JSON.stringify(errs));
await b.close();
