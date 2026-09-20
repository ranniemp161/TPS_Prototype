/* The day strip, at every width and every length.
 *
 *   node lab/programme-strip.mjs        (needs the page served on 4321)
 *
 * The strip is drawn two ways. On a laptop it is one line of days, and
 * its weight is tiered so five days does not read as a thin version of
 * thirty. On a phone it is weeks, seven days to a row, because thirty
 * days on one line there is fourteen pixels a day behind a sideways
 * scroll most readers never make. That is what this holds:
 *
 *   one cell per day, always
 *   no sideways scroll at any width, and no page overflow
 *   on a phone: seven columns, every day numbered, cells wide enough to
 *   read at 320px
 *   crossing the breakpoint redraws the strip rather than restyling it
 */
import { chromium } from 'playwright-core';

const b = await chromium.launch({ channel: 'chrome' });
const fails = [];
const ok = (n, g, w) => { if (g !== w) fails.push(`${n}: got ${JSON.stringify(g)}, want ${JSON.stringify(w)}`); };

const WIDTHS = [[320,568,'small phone'],[390,844,'phone'],[430,932,'large phone'],
                [700,900,'breakpoint'],[701,900,'just over'],[1024,768,'small laptop'],[1440,900,'desktop']];

for (const [w, h, label] of WIDTHS) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:4321/programme.html', { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);

  for (const d of [5, 7, 14, 30]) {
    const r = await p.evaluate(v => {
      document.querySelector(`input[name="days"][value="${v}"]`).click();
      const g = document.querySelector('.shape__grid'), s = document.querySelector('.shape');
      const cells = [...g.children];
      const cols = new Set(cells.map(c => Math.round(c.getBoundingClientRect().left)));
      return { scale: g.dataset.scale, cells: cells.length, cols: cols.size,
        sideScroll: s.scrollWidth > s.clientWidth + 1,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        labelled: [...g.querySelectorAll('.day__n')].filter(n => n.textContent).length,
        firstLabel: g.querySelector('.day__n').textContent,
        dayW: +cells[0].getBoundingClientRect().width.toFixed(1) };
    }, d);

    const narrow = w <= 700;
    ok(`${label} ${d}d tier`, r.scale, narrow ? 'week' : (d <= 7 ? 'short' : d <= 14 ? 'mid' : 'long'));
    ok(`${label} ${d}d one cell per day`, r.cells, d);
    ok(`${label} ${d}d no sideways scroll`, r.sideScroll, false);
    ok(`${label} ${d}d no page overflow`, r.pageOverflow, 0);
    if (narrow) {
      ok(`${label} ${d}d seven columns`, r.cols, Math.min(d, 7));
      ok(`${label} ${d}d every day numbered`, r.labelled, d);
      ok(`${label} ${d}d numerals, not words`, r.firstLabel, '1');
      if (r.dayW < 34) fails.push(`${label} ${d}d day cell only ${r.dayW}px wide`);
    } else if (d <= 7) {
      // The short tier says the word. It lost it once, silently, when
      // the week tier arrived and the two were folded into one branch.
      ok(`${label} ${d}d says Day`, r.firstLabel, 'Day 1');
      ok(`${label} ${d}d labels every day`, r.labelled, d);
    }
  }

  if (w === 1440) {
    await p.evaluate(() => document.querySelector('input[name="days"][value="30"]').click());
    ok('desktop 30d is one line', await p.evaluate(() => document.querySelector('.shape__grid').dataset.scale), 'long');
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForTimeout(300);
    const after = await p.evaluate(() => ({
      scale: document.querySelector('.shape__grid').dataset.scale,
      labelled: [...document.querySelectorAll('.day__n')].filter(n => n.textContent).length }));
    ok('resize redraws to weeks', after.scale, 'week');
    ok('and renumbers every day', after.labelled, 30);
  }

  if (errs.length) fails.push(`${label} page errors: ${errs.join(' | ')}`);
  await p.close();
}

await b.close();
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'Day strip checks passed at seven widths.');
process.exit(fails.length ? 1 : 0);
