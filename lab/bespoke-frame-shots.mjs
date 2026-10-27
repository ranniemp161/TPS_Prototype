/* Bespoke restyle, chat 1: screenshots of all nine deck pages at 1440x900
   and 390x844, plus the frame measurements: the line's fill against the
   current stop, a tap on a reached stop and on the next dot, the ember
   buttons and any visible outline button.
   node lab/bespoke-frame-shots.mjs <outdir> [full]   (full = full page shots) */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], full = process.argv[3] === 'full';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const page = () => p.evaluate(() => { const d = document.querySelector('[data-deck]'); return Math.round(d.scrollLeft / d.clientWidth); });
  const land = async k => { for (let t = 0; t < 40; t++) { await p.waitForTimeout(100); if (await page() === k && t > 7) break; } await p.waitForTimeout(500); return page(); };
  const primaries = new Set();
  for (let i = 0; i <= 8; i++) {
    // one stop at a time (only the next stop answers a tap), each slide landed
    let at = await page();
    while (at < i) { await p.evaluate(k => document.querySelectorAll('.dk-line__stop')[k].click(), at + 1); at = await land(at + 1); }
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${out}/page${i}-${w}.png`, fullPage: full });
    const m = await p.evaluate(k => {
      const line = document.querySelector('[data-line]').getBoundingClientRect();
      const fill = document.querySelector('.dk-line__fill').getBoundingClientRect();
      const tip = document.querySelector('.dk-line__tip').getBoundingClientRect();
      const stop = document.querySelectorAll('.dk-line__stop')[k].getBoundingClientRect();
      const dotX = stop.left + stop.width / 2;
      const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const prim = [...document.querySelectorAll('.btn--primary')].filter(vis).map(e => e.textContent.trim());
      const outl = [...document.querySelectorAll('.dk-bar .btn--outline')].filter(vis).length;
      const back = document.querySelector('[data-back]');
      return {
        name: document.querySelector('[data-step-name]').textContent,
        fillEnd: +(fill.right - dotX).toFixed(2), tipCentre: +((tip.left + tip.width / 2) - dotX).toFixed(2),
        lineW: Math.round(line.width), next: document.querySelector('[data-next]').textContent,
        nextIsBtn: document.querySelector('[data-next]').classList.contains('btn--primary'),
        backShown: vis(back), primVisible: prim, outlineInBar: outl,
        barH: Math.round(document.querySelector('.dk-bar').getBoundingClientRect().height),
        overflowX: document.documentElement.scrollWidth - innerWidth
      };
    }, i);
    m.primVisible.forEach(t => primaries.add(t));
    const okFill = Math.abs(m.fillEnd) <= 1 || (i === 0 && Math.abs(m.tipCentre) <= 1);
    if (!okFill || Math.abs(m.tipCentre) > 1 || at !== i) bad++;
    console.log(w, i, at === i ? 'page ok' : 'PAGE ' + at, okFill ? 'fill ok' : 'FILL OFF', JSON.stringify(m));
  }
  // Taps: from page 4, a reached stop (02) and then the next dot (03); an unreached stop (07) does nothing.
  await p.click('[data-back]'); await land(7); for (const k of [6, 5, 4]) { await p.click('[data-back]'); await land(k); }
  const tap = async k => { const r = await p.locator('.dk-line__stop').nth(k).boundingBox(); await p.mouse.click(r.x + r.width / 2, r.y + r.height - 22); return land(k); };
  const from = await page();
  const reached = await tap(2), nextDot = await tap(3), far = await tap(7);
  const sizes = await p.evaluate(() => [...document.querySelectorAll('.dk-line__stop')].map(s => Math.round(s.getBoundingClientRect().width)));
  console.log(w, 'taps', JSON.stringify({ from, tapReached02: reached, tapNext03: nextDot, tapFar07: far, stopWidths: sizes }));
  if (reached !== 2 || nextDot !== 3 || far !== 3) bad++;
  const statics = await p.evaluate(() => [...document.querySelectorAll('.btn--primary')].map(e => (e.closest('[data-feebar]') ? 'feebar: ' : '') + e.textContent.trim()));
  console.log(w, 'visible ember buttons across the nine pages', JSON.stringify([...primaries]), '| .btn--primary in the DOM now', JSON.stringify(statics));
  console.log(w, 'errors', JSON.stringify(errs));
  await p.close();
}
console.log(bad ? `PROBLEMS ${bad}` : 'ALL OK');
await b.close();
