/* Bespoke carousel check: drives the deck and the controls, compares the fee
   with the spec, and screenshots each page at 1440 and 390.
   node lab/deck-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const state = () => p.evaluate(() => ({
    // the bar in one layer (12 Oct 2026): no step numbers; the current stop's index and the step name
    crumb: [...document.querySelectorAll('.dk-line__stop')].findIndex(s => s.classList.contains('is-on')) + ' ' + document.querySelector('[data-step-name]').textContent,
    next: document.querySelector('[data-next]').textContent,
    pos: getComputedStyle(document.querySelector('[data-line]')).getPropertyValue('--pos'),
    fee: document.querySelector('[data-fee]').textContent,
    top: document.querySelector('.dk-fee__amount').textContent,
    sum: document.querySelector('.dk-sumfee').textContent,
    page: Math.round(document.querySelector('[data-deck]').scrollLeft / document.querySelector('[data-deck]').clientWidth)
  }));
  const next = async () => { await p.click('[data-next]'); await p.waitForTimeout(1200); };
  // Every screen fits (12 Oct 2026): 17 pages; from 1024px wide joined pages share a screen, so the walk runs to the last stop.
  const last = await p.evaluate(() => document.querySelectorAll('.dk-line__stop').length - 1);
  console.log(w, 'screens', last + 1);
  for (let i = 0; i <= last; i++) {
    const sy = await p.evaluate(() => scrollY); if (sy) console.log('WINDOW SCROLLED', sy);
    await p.screenshot({ path: `${out}/dk${w}-${i}.png` });
    const s = await state();
    console.log(w, i, JSON.stringify(s));
    if (i === 1) { await p.evaluate(v => { const f = document.getElementById('due'); f.value = v; f.dispatchEvent(new Event('input', { bubbles: true })); }, '2027-03-15'); await p.waitForTimeout(300); }   // due date screen: Next is blocked until a date is in
    if (i === 3) { await p.click('.tg:has(input[name="days"][value="14"])'); await p.waitForTimeout(300); await p.screenshot({ path: `${out}/dk${w}-3-counting.png` }); await p.waitForTimeout(700); }
    // scrub is on the second Recovery treatments screen (page 7)
    if (s.page === 7) { await p.click('input[name="scrub"] ~ .tg__body'); await p.waitForTimeout(900); }
    // The close (FUNNEL-PLAN chat 5) has no Next: send the form to reach Done.
    if (i === last - 1) { await p.fill('#capture-name', 'Test Mother'); await p.fill('#capture-email', 'test@example.com'); await p.click('.capture__btn'); await p.waitForTimeout(1200); }
    // 13 Oct 2026: Your programme has no Next; [data-not-yet] is the way on to the close.
    else if (s.crumb.endsWith('Your programme')) { await p.click('[data-not-yet]'); await p.waitForTimeout(1200); }
    else if (i < last) await next();
  }
  // a swipe: scroll the deck to page 3 and let it settle
  await p.evaluate(() => { const d = document.querySelector('[data-deck]'); d.scrollTo({ left: 3 * d.clientWidth, behavior: 'auto' }); });
  await p.waitForTimeout(500);
  console.log(w, 'after swipe', JSON.stringify(await state()));
  // Change left Your programme (TJ, 13 Oct 2026); Back from there steps one screen back.
  await p.click('[data-back]'); await p.waitForTimeout(900);
  console.log(w, 'after back', JSON.stringify(await state()));
  const m = await p.evaluate(() => ({ overflowX: document.documentElement.scrollWidth - innerWidth }));
  console.log(w, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
