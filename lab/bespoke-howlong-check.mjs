// Restyle chat 4: step 02 How long, the four stop line.  node lab/bespoke-howlong-check.mjs <outdir>
// For each stay: tap the numeral and a part of the line, read the checked radio, the circle against the
// stop (px), the row under the line, the ticker fee; arrow keys; screenshots.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
let fails = 0;
const ok = (name, cond, info = '') => { if (!cond) fails++; console.log((cond ? 'ok   ' : 'FAIL ') + name + (info ? '  ' + info : '')); };
const STAYS = ['5', '7', '14', '30'];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  console.log('--- ' + w);
  const p = await b.newPage({ viewport: { width: w, height: h } });
  try { await p.goto(url, { timeout: 45000 }); } catch { await p.goto(url, { timeout: 60000 }); }
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.evaluate(() => { const d = document.querySelector('[data-deck]'); d.scrollTo({ left: 2 * d.clientWidth, behavior: 'instant' }); });
  await p.waitForTimeout(800);
  const settle = async () => { await p.waitForTimeout(200); await p.waitForFunction(() => !document.getAnimations().some(a => a.playState === 'running' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.dkd, [data-fee]')), null, { timeout: 8000 }); await p.waitForTimeout(600); };
  const val = () => p.evaluate(() => document.querySelector('input[name="days"]:checked').value);
  const fee = () => p.evaluate(() => document.querySelector('[data-fee]').textContent.trim());
  const geo = () => p.evaluate(() => {
    const g = document.querySelector('.dkd'); const c = e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
    const stops = [...g.querySelectorAll('.dkd__stop')].map(c);
    const tip = c(g.querySelector('.dkd__tip'));
    const fillR = g.querySelector('.dkd__fill').getBoundingClientRect(); const rail = g.querySelector('.dkd__rail').getBoundingClientRect();
    const fillEnd = fillR.right;
    const shown = [...g.querySelectorAll('.dkd__info')].filter(e => getComputedStyle(e).opacity === '1').map(e => [...e.children].map(c => c.textContent.trim()).join(' \u00b7 '));
    const days = [...g.querySelectorAll('.dkd__day')].map(e => ({ op: getComputedStyle(e).opacity, cx: Math.round(c(e)[0]), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }));
    const zones = [...g.querySelectorAll('.dkd__zone')].map(e => { const r = e.getBoundingClientRect(); return Math.round(r.height) + 'x' + Math.round(r.width) + '@' + Math.round(r.left); });
    return { stops, tip, fillEnd, shown, days, zones, railW: Math.round(rail.width), overflow: document.documentElement.scrollWidth > innerWidth };
  });
  const want = { 5: 'The first week home · Complete programme £1,995', 7: 'A full week · Complete programme £2,495', 14: 'Two weeks · Complete programme £4,495', 30: 'Full confinement · Complete programme £6,399' };
  // Expected fee from the engine with defaults, read after the first tap to each stay by its own value.
  const fees = {};
  for (const mode of ['numeral', 'line']) {
    for (const d of ['30', '14', '7', '5']) {
      const idx = STAYS.indexOf(d);
      if (mode === 'numeral') await p.click(`.dkd__day:has(input[value="${d}"])`);
      else { const z = await p.$(`.dkd__zone[for="dkd-days-${d}"]`); const bb = await z.boundingBox(); await p.mouse.click(bb.x + bb.width * (idx === 0 ? 0.3 : 0.5), bb.y + bb.height / 2); }
      await settle();
      const v = await val(), f = await fee(), g = await geo();
      const off = g.tip[0] - g.stops[idx][0], offY = g.tip[1] - g.stops[idx][1], offF = g.fillEnd - g.stops[idx][0];
      if (mode === 'numeral') fees[d] = f;
      ok(`${w} ${mode} ${d}`, v === d && Math.abs(off) < 0.5 && Math.abs(offY) < 0.5 && Math.abs(offF) < 0.5 && g.shown.length === 1 && g.shown[0] === want[d] && (mode === 'numeral' || f === fees[d]),
        `checked=${v} tip-x ${off.toFixed(2)}px tip-y ${offY.toFixed(2)}px fillEnd ${offF.toFixed(2)}px; row "${g.shown}"; fee ${f}; numeral op ${g.days.map(x => x.op)}`);
      if (mode === 'numeral' && w) await p.screenshot({ path: `${out}/step02-${w}-${d}.png` });
    }
  }
  const g = await geo();
  console.log('stops x', g.stops.map(s => s[0].toFixed(1)), 'numerals cx', g.days.map(x => x.cx), 'rail', g.railW, 'zones', g.zones, 'numeral boxes', g.days.map(x => x.w + 'x' + x.h), 'overflowX', g.overflow);
  const gaps = g.stops.slice(1).map((s, i) => s[0] - g.stops[i][0]);
  ok(`${w} stops evenly spaced`, Math.max(...gaps) - Math.min(...gaps) < 0.5, gaps.map(x => x.toFixed(2)).join(' '));
  ok(`${w} numerals centred on stops`, g.days.every((x, i) => Math.abs(x.cx - g.stops[i][0]) < 1));
  ok(`${w} zones 44px tall, no sideways overflow`, g.zones.every(z => z.startsWith('44x')) && !g.overflow);
  // Keyboard
  await p.focus('input[name="days"]:checked'); // currently 5
  const seq = [['ArrowRight', '7'], ['ArrowRight', '14'], ['ArrowRight', '30'], ['ArrowLeft', '14']];
  for (const [k, e] of seq) {
    await p.keyboard.press(k); await settle();
    const v = await val(), gg = await geo(), idx = STAYS.indexOf(e);
    ok(`${w} ${k} -> ${e}`, v === e && Math.abs(gg.tip[0] - gg.stops[idx][0]) < 0.5 && (await fee()) === fees[e], `checked=${v} tip off ${(gg.tip[0] - gg.stops[idx][0]).toFixed(2)}px fee ${await fee()} row "${gg.shown}"`);
  }
  await p.screenshot({ path: `${out}/step02-${w}-focus.png` });
  await p.evaluate(() => document.activeElement.blur());
  await p.click('.dkd__day:has(input[value="5"])'); await settle();
  await p.screenshot({ path: `${out}/step02-${w}.png` });
  console.log('fees', JSON.stringify(fees));
  await p.close();
}
await b.close();
console.log(fails ? 'FAILURES: ' + fails : 'all ok'); process.exit(fails ? 1 : 0);
