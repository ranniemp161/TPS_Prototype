/* Specialist moved to Who Comes Into Your Home (19 Oct 2026). Opens the page at scroll zero,
   wheels down, screenshots; then What We Do around where the section was.
   node lab/specialist-move-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/who-comes-into-your-home.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2200);
  await p.screenshot({ path: `${out}/who${w}-00.png` });
  await p.mouse.move(w / 2, h / 2);
  for (let i = 1; i <= 4; i++) { await p.mouse.wheel(0, Math.round(h * 0.5)); await p.waitForTimeout(1600); await p.screenshot({ path: `${out}/who${w}-0${i}.png` }); }
  const m = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, checksIn: !!document.querySelector('.spec__checks.is-in'), h2: document.querySelector('.spec .wh2')?.className }));
  console.log('who', w, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
  const q = await b.newPage({ viewport: { width: w, height: h } });
  const e2 = []; q.on('pageerror', e => e2.push(e.message));
  await q.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await q.waitForLoadState('load'); await q.evaluate(() => document.fonts.ready); await q.waitForTimeout(1500);
  const y = await q.evaluate(() => { const s = document.querySelector('[data-section-name="Four Kinds of Care"], .hd, [data-hd-cut]'); const el = s && (s.closest('section') || s); return el ? el.getBoundingClientRect().top + scrollY : 0; });
  await q.evaluate(v => scrollTo(0, v), Math.max(0, y - h * 0.9)); await q.waitForTimeout(1500);
  await q.screenshot({ path: `${out}/wwd${w}-join.png` });
  console.log('wwd', w, 'join at', Math.round(y), 'errors', JSON.stringify(e2));
  await q.close();
}
await b.close();
