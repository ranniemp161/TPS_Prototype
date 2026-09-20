/* The summary panel: presence, the fee, the two views, and the wiring
 * between the panel and the controls.
 *
 *   node lab/programme-panel.mjs        (needs the page served on 4321)
 *
 * The one rule it exists to hold: a fee is on screen, somewhere, at
 * every control in the builder, at every window size. It has been broken
 * twice, once by the panel being sticky inside only one of three
 * sections, and once by the fee sitting in a 368px foot that fell below
 * the fold on a short laptop.
 */
import { chromium } from 'playwright-core';

const b = await chromium.launch({ channel: 'chrome' });
const fails = [];
const ok = (n, g, w) => { if (g !== w) fails.push(`${n}: got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`); };

const STEPS = ['step-02','step-01','step-03','step-04','step-05','step-06','step-07','step-08'];

for (const [w, h, label] of [[1920,1080,'large'],[1440,900,'desktop'],[1280,720,'short laptop'],[1024,768,'small laptop'],[390,844,'phone']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:4321/programme.html', { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);

  // The predicate matches the contract the script observes with: the
  // panel's fee counts as on screen when it clears the nav above it and
  // the bar's own height below it. Anything looser and the two disagree
  // in a band where both would show, which is how the first run of this
  // suite caught two fees at once on a short laptop.
  const seen = await p.evaluate(async steps => {
    const NAV = 64, BAR = 72;
    const count = () => {
      const pr = document.querySelector('.summary__top [data-fee]').getBoundingClientRect();
      const panelSeen = pr.height > 0 && pr.top > NAV && pr.bottom < innerHeight - BAR;
      const barSeen = getComputedStyle(document.querySelector('.feebar')).display === 'block';
      return (panelSeen ? 1 : 0) + (barSeen ? 1 : 0);
    };
    const out = [];
    for (const id of steps) {
      document.getElementById(id).scrollIntoView({ block: 'center' });
      // The bar is driven by two IntersectionObservers, which report on
      // their own schedule rather than on the scroll. Poll for the
      // settle rather than guessing a delay: a fixed 140ms wait passed
      // four runs out of five and failed the fifth on a 1024 window,
      // and an invariant test that is flaky is not an invariant test.
      let n = count();
      for (let i = 0; i < 24 && n !== 1; i++) {
        await new Promise(r => requestAnimationFrame(() => setTimeout(r, 25)));
        n = count();
      }
      out.push({ id, n });
    }
    return out;
  }, STEPS);
  seen.forEach(x => ok(`${label} settles to exactly one fee at ${x.id}`, x.n, 1));

  if (w >= 980) {
    const panel = await p.evaluate(async () => {
      const q = s => document.querySelector(s);
      q('[data-view="budget"]').click();
      await new Promise(r => setTimeout(r, 60));
      const i = q('#budget');
      i.value = '4200'; i.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 90));
      const head = q('[data-fit-head]').textContent;
      const alt = !q('[data-fit-alt]').hidden;
      q('[data-budget-fit] > [data-fit-apply]').click();
      await new Promise(r => setTimeout(r, 420));
      const after = { days: q('input[name="days"]:checked').value, fee: q('[data-fee]').textContent };
      // a recommendation raised behind the other view marks its tab
      q('[data-view="programme"]').click();
      i.value = '8000'; i.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 80));
      const news = q('[data-view="budget"]').classList.contains('has-news');
      q('[data-view="budget"]').click();
      const cleared = !q('[data-view="budget"]').classList.contains('has-news');
      q('[data-view="programme"]').click();
      return { head, alt, after, news, cleared };
    });
    ok(`${label} budget recommends`, panel.head, 'Our complete seven day programme fits that.');
    ok(`${label} and offers the longer option`, panel.alt, true);
    ok(`${label} apply sets the length`, panel.after.days, '7');
    ok(`${label} apply prices it`, panel.after.fee, '£2,495');
    ok(`${label} tab marked when news lands off view`, panel.news, true);
    ok(`${label} mark clears on open`, panel.cleared, true);
  } else {
    const stacked = await p.evaluate(() => ({
      tabsHidden: getComputedStyle(document.querySelector('.summary__tabs')).display === 'none',
      budgetShown: getComputedStyle(document.getElementById('view-budget')).display !== 'none',
      barShown: getComputedStyle(document.querySelector('.feebar')).display === 'block' }));
    ok(`${label} tabs stand down`, stacked.tabsHidden, true);
    ok(`${label} both views stack`, stacked.budgetShown, true);
    ok(`${label} the bar carries the fee`, stacked.barShown, true);
  }

  const wiring = await p.evaluate(async () => {
    const q = s => document.querySelector(s);
    const tab = q('[data-view="programme"]'); if (tab) tab.click();
    q('input[name="dinner"]').click();
    await new Promise(r => setTimeout(r, 70));
    const flagged = [...document.querySelectorAll('.area.is-changed')].map(e => e.dataset.area).join(',');
    q('input[name="dinner"]').click();
    const jumps = [...document.querySelectorAll('.area__jump')].every(b => !!document.getElementById(b.dataset.goto));
    return { flagged, jumps, jumpCount: document.querySelectorAll('.area__jump').length };
  });
  // Asserting the hidden property missed that an explicit `display` on
  // the class beat `[hidden]`, so the restore control rendered as an
  // empty pill on every complete programme. Check what is painted.
  const restore = await p.evaluate(async () => {
    const q = s => document.querySelector(s);
    const el = q('[data-restore]');
    const whenComplete = getComputedStyle(el).display;
    q('input[name="scrub"]').click();
    await new Promise(r => setTimeout(r, 80));
    const whenStripped = getComputedStyle(el).display;
    el.click();
    await new Promise(r => setTimeout(r, 120));
    return { whenComplete, whenStripped, after: getComputedStyle(el).display,
      complete: !q('[data-complete-notice]').hidden };
  });
  ok(`${label} restore is not painted on a complete programme`, restore.whenComplete, 'none');
  ok(`${label} restore is painted once something is out`, restore.whenStripped, 'block');
  ok(`${label} restore rebuilds the programme`, restore.complete, true);
  ok(`${label} and stops being painted again`, restore.after, 'none');

  ok(`${label} the change flag still fires`, wiring.flagged, 'meals');
  ok(`${label} every jump resolves`, wiring.jumps, true);
  ok(`${label} six jumps`, wiring.jumpCount, 6);

  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(`${label} no horizontal overflow`, ov, 0);
  if (errs.length) fails.push(`${label} page errors: ${errs.join(' | ')}`);
  await p.close();
}

await b.close();
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'Panel checks passed at five window sizes.');
process.exit(fails.length ? 1 : 0);
