/* Does the page line up.
 *
 *   node lab/programme-align.mjs        (needs the page served on 4321)
 *
 * Two things, both of which have been wrong:
 *
 * Every section starts on the same line. The closing section once sat
 * 48px outside the column, because it is a `wrap close` and v1's
 * `.close` is a card with its own clamped padding, so resetting the
 * shorthand took the page gutter with it.
 *
 * The paired steps read as one row. Their option boxes and their notes
 * once sat 20px apart, because "7am to 7pm" is one line where the other
 * three descriptions take two.
 */
import { chromium } from 'playwright-core';

const b = await chromium.launch({ channel: 'chrome' });
const fails = [];
const ok = (n, g, w) => { if (g !== w) fails.push(`${n}: got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`); };

for (const [w, h, label] of [[1920,1080,'large'],[1440,900,'desktop'],[1200,900,'narrow'],
                             [1024,768,'laptop'],[900,900,'tablet'],[390,844,'phone']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:4321/programme.html', { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(450);

  const lefts = await p.evaluate(() => {
    const at = sel => { const e = document.querySelector(sel);
      return e ? Math.round(e.getBoundingClientRect().left) : null; };
    return { hero: at('.bhero .eyebrow'), builder: at('.movement--lead'),
      strip: at('.shape__head .display'), included: at('.included__copy .display'),
      close: at('.act--close-builder .display'), foot: at('.foot__legal') };
  });
  const v = Object.values(lefts).filter(x => x !== null);
  ok(`${label} every section starts on the same line`,
     v.every(x => Math.abs(x - v[0]) <= 1), true);
  if (!v.every(x => Math.abs(x - v[0]) <= 1)) fails.push(`  ${label} lefts: ${JSON.stringify(lefts)}`);

  const pair = await p.evaluate(() => {
    const steps = [...document.querySelectorAll('.pair .step')];
    return steps.map(st => ({
      boxTops: [...st.querySelectorAll('.choice')].map(e => Math.round(e.getBoundingClientRect().top)),
      boxHeights: [...st.querySelectorAll('.choice')].map(e => Math.round(e.getBoundingClientRect().height)),
      note: Math.round(st.querySelector('.step__note').getBoundingClientRect().top),
      top: Math.round(st.getBoundingClientRect().top),
      height: Math.round(st.getBoundingClientRect().height) }));
  });
  const [a, c] = pair;
  // Below 860px the two questions queue instead of sharing a row, and
  // there is nothing left to line up. Asserting it there would be
  // asserting that a one column layout is a two column one.
  const sideBySide = Math.abs(a.top - c.top) <= 1;
  if (sideBySide) {
    ok(`${label} paired steps are the same height`, a.height === c.height, true);
    ok(`${label} paired option rows line up`,
       a.boxTops.every((t, i) => Math.abs(t - c.boxTops[i]) <= 1), true);
    ok(`${label} paired option boxes are the same height`,
       a.boxHeights.every((x, i) => Math.abs(x - c.boxHeights[i]) <= 1), true);
    ok(`${label} paired notes start on the same line`, Math.abs(a.note - c.note) <= 1, true);
    if (Math.abs(a.note - c.note) > 1) fails.push(`  ${label} pair: ${JSON.stringify(pair)}`);
  } else {
    ok(`${label} the pair is stacked, as it should be under 860px`, w < 861, true);
  }

  if (errs.length) fails.push(`${label} page errors: ${errs.join(' | ')}`);
  await p.close();
}

await b.close();
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'Alignment holds at six widths.');
process.exit(fails.length ? 1 : 0);
