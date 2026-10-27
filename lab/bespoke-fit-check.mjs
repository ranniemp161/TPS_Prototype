/* Bespoke Programmes, every screen fits (TJ, 12 Oct 2026).
   node lab/bespoke-fit-check.mjs <outdir> [sizes]   sizes like 1440x900,390x844
   For every page at each size and in three states (the default; "full": 30 days,
   night care, everything on, every priority, a budget with two recommendations;
   "bare": 5 days, everything off, so the floor notice and Restore show): the
   deck's height against the content's, the page's fit (fits, tight) and the
   frame's (held or released); every element that scrolls on its own (overflow
   auto or scroll with more content than room); sideways overflow. Screenshots
   of every screen in the default state go to <outdir> (s<n>: a screen; from 1024px
   wide a joined pair of pages is one screen). */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const out = process.argv[2] || 'lab/bespoke-fit';
const sizes = (process.argv[3] || '1440x900,390x844,1835x605,360x640').split(',').map(s => s.split('x').map(Number));
const shots = process.argv[4] !== 'noshots';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
let fails = 0;
const table = [];

const setState = (p, state) => p.evaluate(async (state) => {
  const form = document.querySelector('[data-builder-scope]');
  const fire = (i) => i.dispatchEvent(new Event('change', { bubbles: true }));
  const radio = (n, v) => { const i = form.querySelector(`input[name="${n}"][value="${v}"]`); i.checked = true; fire(i); };
  const box = (n, on) => { const i = form.querySelector(`input[name="${n}"]`); i.checked = on; fire(i); };
  if (state === 'full') {
    radio('format', 'in'); radio('days', '30'); radio('shift', 'night'); radio('meals', 'yes');
    ['massage', 'scrub', 'reflex', 'facial', 'herbfoot', 'thermal'].forEach(n => box(n, true));
    [...form.querySelectorAll('input[name^="p-"]')].forEach(i => { i.checked = true; fire(i); });
    // the budget that shows the most: try a range, keep the tallest recommendation
    const bud = document.getElementById('budget'); let best = 0, bestV = 0;
    for (const v of [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 7000, 9000]) {
      bud.value = v; bud.dispatchEvent(new Event('input', { bubbles: true }));
      const h = document.querySelector('.dk-sum--budget .budget').getBoundingClientRect().height;
      if (h > best) { best = h; bestV = v; }
    }
    bud.value = bestV; bud.dispatchEvent(new Event('input', { bubbles: true }));
    return bestV;
  }
  if (state === 'bare') {
    radio('format', 'in'); radio('days', '5'); radio('shift', 'day'); radio('meals', 'no');
    ['massage', 'scrub', 'reflex', 'facial', 'herbfoot', 'thermal'].forEach(n => box(n, false));
    [...form.querySelectorAll('input[name^="p-"]')].forEach(i => { i.checked = false; fire(i); });
    const bud = document.getElementById('budget'); bud.value = ''; bud.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return null;
}, state);

const measure = (p) => p.evaluate(() => {
  const app = document.querySelector('.dk');
  const pages = [...document.querySelectorAll('.dk-page')];
  const free = app.classList.contains('is-free');
  // Released: measure the held frame underneath (the tight classes stay as the fit left them).
  if (free) { app.classList.remove('is-free'); document.body.classList.remove('dk-is-free'); }
  const rows = pages.map((pg, k) => {
    const inner = pg.querySelector('.dk-in');
    const need = Math.ceil(Math.max(inner.scrollHeight, inner.getBoundingClientRect().height));
    return { k, title: pg.dataset.title, deck: pg.clientHeight, need, tight: pg.classList.contains('is-tight'), over: need > pg.clientHeight + 1 };
  });
  if (free) { app.classList.add('is-free'); document.body.classList.add('dk-is-free'); }
  const scrollers = [];
  document.querySelectorAll('body *').forEach(el => {
    const cs = getComputedStyle(el);
    if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1) scrollers.push((el.className || el.tagName) + ' ' + el.scrollHeight + '/' + el.clientHeight);
  });
  const pageOver = pages.map(pg => getComputedStyle(pg).overflowY);
  return { free, fit: app.dataset.fit, rows, scrollers, pageOver: [...new Set(pageOver)], sideways: document.documentElement.scrollWidth - innerWidth };
});

const landed = async (p, i) => {
  await p.waitForFunction((i) => {
    const d = document.querySelector('[data-deck]');
    const app = document.querySelector('.dk');
    if (app.classList.contains('is-free')) return true;
    return Math.abs(d.scrollLeft - i * d.clientWidth) < 2;
  }, i, { timeout: 8000 });
  await p.waitForTimeout(900);   // the line's slide (650ms) settles
};

for (const [w, h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  try { await p.goto(url, { timeout: 30000 }); } catch (e) { await p.goto(url, { timeout: 60000 }); }
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.evaluate(v => { const f = document.getElementById('due'); f.value = v; f.dispatchEvent(new Event('input', { bubbles: true })); }, '2027-05-15'); await p.waitForTimeout(300);   // 6 row month (May 2027): the tallest the due calendar gets. FUNNEL-PLAN chat 2: the due date screen blocks the deck until a date is in
  for (const state of ['default', 'full', 'bare']) {
    if (state !== 'default') { await setState(p, state); await p.waitForTimeout(400); }
    const m = await measure(p);
    console.log(`--- ${w}x${h} ${state}: frame ${m.free ? 'RELEASED' : 'held'} (${m.fit}); page overflow ${m.pageOver.join(',')}; sideways ${m.sideways}; scrollers ${m.scrollers.length ? m.scrollers.join(' | ') : 'none'}`);
    for (const r of m.rows) {
      const verdict = r.over ? (m.free ? 'RELEASES' : 'OVER') : r.tight ? 'tight' : 'fits';
      console.log(`  ${String(r.k).padStart(2)} ${r.title.padEnd(22)} deck ${r.deck}  content ${r.need}  ${verdict}`);
      table.push({ size: `${w}x${h}`, state, k: r.k, title: r.title, deck: r.deck, need: r.need, verdict });
      if (verdict === 'OVER' || verdict === 'RELEASES') fails++;
    }
    if (m.scrollers.length || m.sideways > 0 || m.pageOver.some(o => o !== 'hidden' && !m.free)) fails++;
    if (state === 'default' && shots && !m.free) {
      const last = await p.evaluate(() => document.querySelectorAll('.dk-line__stop').length - 1);   // screens
      for (let i = 0; i <= last; i++) {
        await p.evaluate((i) => document.querySelector('[data-deck]').scrollTo({ left: i * document.querySelector('[data-deck]').clientWidth, behavior: 'instant' }), i);
        await landed(p, i);
        // Headless Chrome can stall a frame on the tall desktop deck (lab/bespoke-bar2-stall-probe.mjs): retry once.
        try { await p.screenshot({ path: `${out}/s${i}-${w}x${h}.png`, timeout: 15000 }); } catch (e) { await p.waitForTimeout(2000); await p.screenshot({ path: `${out}/s${i}-${w}x${h}.png`, timeout: 30000 }); }
      }
      await p.evaluate(() => document.querySelector('[data-deck]').scrollTo({ left: 0, behavior: 'instant' }));
      await p.waitForTimeout(300);
    }
  }
  if (errs.length) { console.log('page errors', errs); fails++; }
  await p.close();
}
fs.writeFileSync(`${out}/fit-table.json`, JSON.stringify(table, null, 1));
console.log(fails ? `FAILS ${fails}` : 'all fit');
await b.close();
