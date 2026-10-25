/* Does anything on a builder screen move when a toggle or a date is tapped?
   Walks every step, taps each choice on it, and compares where the title and
   every choice sit before and after. Any shift over half a pixel is reported.
   node lab/bespoke-shift-check.mjs [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await passPostcode(p);

const stepName = () => p.evaluate(() => document.querySelector('[data-step-name]').textContent.trim());
// Positions of everything visible on the current screen, keyed by a stable label.
const snap = () => p.evaluate(() => {
  const out = {};
  const page = [...document.querySelectorAll('.dk-page')].find(pg => pg.getAttribute('aria-hidden') !== 'true' && !pg.inert);
  if (!page) return out;
  page.querySelectorAll('.dk-step, .step__note--lead, .tg, .due-cal__month, .due-cal__grid button, .due__note').forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (!r.height) return;
    out[(el.className.split(' ')[0]) + ':' + i + ':' + el.textContent.trim().slice(0, 18)] = Math.round(r.top * 2) / 2;
  });
  return out;
});
const diff = (a, c) => Object.keys(a).filter(k => k in c && Math.abs(a[k] - c[k]) > 0.5).map(k => `${k.split(':').slice(2).join(':') || k} ${a[k]}->${c[k]}`);

let total = 0;
for (let s = 0; s < 12; s++) {
  const name = await stepName();
  if (/Your programme$/.test(name)) break;
  const targets = await p.evaluate(() => {
    const page = [...document.querySelectorAll('.dk-page')].find(pg => pg.getAttribute('aria-hidden') !== 'true' && !pg.inert);
    if (!page) return [];
    const t = [];
    page.querySelectorAll('label.tg').forEach((l, i) => { if (!l.querySelector('input:disabled')) t.push({ kind: 'tg', i }); });
    if (page.querySelector('.due-cal__grid')) t.unshift({ kind: 'day', i: 0 }, { kind: 'day', i: 1 });
    return t;
  });
  for (const t of targets) {
    for (const pass of ['on', 'off']) {
      if (t.kind === 'day' && pass === 'off') continue;
      const before = await snap();
      if (t.kind === 'tg') {
        await p.evaluate(i => {
          const page = [...document.querySelectorAll('.dk-page')].find(pg => pg.getAttribute('aria-hidden') !== 'true' && !pg.inert);
          page.querySelectorAll('label.tg')[i].click();
        }, t.i);
      } else {
        await p.evaluate(i => {
          const days = [...document.querySelectorAll('.due-cal__grid button:not([disabled])')];
          days[10 + i * 5].click();
        }, t.i);
      }
      await p.waitForTimeout(900);
      const after = await snap();
      const d = diff(before, after);
      if (d.length) { total++; console.log(`${name} | tap ${t.kind} ${t.i} ${pass}: ${d.length} moved, e.g. ${d.slice(0, 3).join(' ; ')}`); }
    }
  }
  // Leave the screen in a state Next accepts.
  if (await p.evaluate(() => !!document.querySelector('.due-cal__grid') && !document.querySelector('input[name="child"]:checked') && [...document.querySelectorAll('.dk-page')].some(pg => pg.querySelector('.due-cal__grid') && pg.getAttribute('aria-hidden') !== 'true'))) {
    await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(400);
  }
  const next = await p.$('.dk-next');
  if (!next || await next.getAttribute('aria-disabled') === 'true') { console.log('stopped at', name); break; }
  console.log('checked', name);
  await next.click({ force: true }); await p.waitForTimeout(1100);
}
console.log(total ? `${total} taps moved something` : 'nothing moved on any tap', '| errors', JSON.stringify(errs));
await b.close();
