/* Bespoke Programmes, the release (TJ, 12 Oct 2026): at 1280x480 (under 500px
   tall) the frame must let go: .dk.is-free, the window scrolls, no element
   scrolls on its own, the bar fixed at the foot follows the section read, Next
   and a Change link glide the page to a section. Then the Change links in the
   held frame at 1440x900 and 390x844 land on the right step.
   node lab/bespoke-release-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const out = process.argv[2] || 'lab/bespoke-fit/release';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
let fails = 0;
const ok = (n, c, d = '') => { if (!c) fails++; console.log((c ? 'ok   ' : 'FAIL ') + n + (d ? '  ' + d : '')); };
const open = async (w, h) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  try { await p.goto(url, { timeout: 30000 }); } catch (e) { await p.goto(url, { timeout: 60000 }); }
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  return p;
};
const name = (p) => p.evaluate(() => document.querySelector('[data-step-name]').textContent);

// ---- the forced release ----
{
  const p = await open(1280, 480);
  const s = await p.evaluate(() => {
    const scrollers = [];
    document.querySelectorAll('body *').forEach(el => { const cs = getComputedStyle(el); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1) scrollers.push(el.className); });
    const bar = document.querySelector('.dk-bar').getBoundingClientRect();
    return { free: document.querySelector('.dk').classList.contains('is-free'), docH: document.documentElement.scrollHeight, scrollers, barPos: getComputedStyle(document.querySelector('.dk-bar')).position, barBottom: Math.round(bar.bottom), sideways: document.documentElement.scrollWidth - innerWidth, pageOverflow: getComputedStyle(document.querySelector('.dk-page')).overflowY };
  });
  console.log('1280x480', JSON.stringify(s));
  ok('released (.dk.is-free)', s.free);
  ok('the window scrolls (document taller than 4 windows)', s.docH > 480 * 4, 'document ' + s.docH);
  ok('no element scrolls on its own', s.scrollers.length === 0, s.scrollers.join(' | '));
  ok('bar fixed at the foot', s.barPos === 'fixed' && s.barBottom === 480, s.barPos + ' ' + s.barBottom);
  ok('no sideways overflow', s.sideways <= 0);
  await p.screenshot({ path: `${out}/release-start-1280x480.png` });
  // Next glides the page to step 01
  await p.click('[data-next]'); await p.waitForTimeout(1500);
  const y1 = await p.evaluate(() => { const pg = document.querySelectorAll('.dk-page')[1]; return Math.round(pg.getBoundingClientRect().top - document.querySelector('[data-nav]').getBoundingClientRect().height); });
  ok('Next lands step 01 under the header', Math.abs(y1) <= 2, 'off ' + y1 + ', bar reads ' + await name(p));
  await p.screenshot({ path: `${out}/release-step1-1280x480.png` });
  // scrolling the window moves the bar's line
  await p.evaluate(() => { const pg = document.querySelectorAll('.dk-page')[7]; window.scrollTo({ top: pg.getBoundingClientRect().top + scrollY - 120, behavior: 'instant' }); });
  await p.waitForTimeout(500);
  ok('the bar follows the section read', (await name(p)) === 'Massage rhythm', await name(p));
  await p.screenshot({ path: `${out}/release-scrolled-1280x480.png` });
  // a Change link (Meals, page 4) glides back
  await p.evaluate(() => { const pg = document.querySelectorAll('.dk-page')[11]; window.scrollTo({ top: pg.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }); });
  await p.waitForTimeout(400);
  await p.click('[data-goto="4"]'); await p.waitForTimeout(1600);
  ok('Change (Meals) lands on Meals', (await name(p)) === 'Meals', await name(p));
  await p.close();
}

// ---- Change links in the held frame ----
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await open(w, h);
  const want = { 1: 'Live-in or daytime', 3: 'Day or night', 4: 'Meals', 5: 'Recovery treatments', 8: 'What matters most' };
  for (const [g, title] of Object.entries(want)) {
    // to the screen holding the Change link, then tap it
    await p.evaluate((g) => { const btn = document.querySelector(`[data-goto="${g}"]`); const pg = btn.closest('.dk-page'); const d = document.querySelector('[data-deck]'); d.scrollTo({ left: Math.floor((pg.offsetLeft + 1) / d.clientWidth) * d.clientWidth, behavior: 'instant' }); }, g);
    await p.waitForTimeout(700);
    await p.click(`[data-goto="${g}"]`);
    await p.waitForFunction((g) => { const d = document.querySelector('[data-deck]'); const pg = document.querySelectorAll('.dk-page')[g]; return Math.abs(d.scrollLeft - Math.floor((pg.offsetLeft + 1) / d.clientWidth) * d.clientWidth) < 2; }, Number(g), { timeout: 10000 });
    await p.waitForTimeout(300);
    const r = await p.evaluate((g) => { const pg = document.querySelectorAll('.dk-page')[g]; return { live: !pg.inert, x: Math.round(pg.getBoundingClientRect().left) }; }, Number(g));
    const n = await name(p);
    ok(`${w}x${h} Change ${g} lands on ${title}`, n === title && r.live && r.x >= 0 && r.x < w, `bar "${n}", page left ${r.x}, live ${r.live}`);
  }
  await p.close();
}
console.log(fails ? `FAILS ${fails}` : 'all passed');
await b.close();
