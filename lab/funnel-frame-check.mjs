/* FUNNEL-PLAN.md chat 1: the quiet frame. node lab/funnel-frame-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
for (const [w, h] of [[1440, 900], [390, 844], [1280, 480]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const state = () => p.evaluate(() => {
    const vis = s => { const e = document.querySelector(s); if (!e) return 'none'; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > .5 && r.width > 0 ? 'shown' : 'hidden'; };
    return { funnel: document.body.classList.contains('is-funnelled'), tabs: vis('.nav__tabs'), menu: vis('.tab--menu'), enquire: vis('.tab--cta'), ret: vis('.nav__return'), brand: vis('.nav__wordmark'), overlap: (() => { const a = document.querySelector('.nav__return').getBoundingClientRect(), w = document.querySelector('.nav__wordmark').getBoundingClientRect(); return a.width > 0 && a.left < w.right && a.right > w.left && a.top < w.bottom && a.bottom > w.top; })(), footer: vis('.sf') };
  });
  const s0 = await state(); await p.screenshot({ path: `lab/funnel/start-${w}x${h}.png` });
  await p.click('[data-next]'); await p.waitForTimeout(1500);
  const s1 = await state(); await p.screenshot({ path: `lab/funnel/step1-${w}x${h}.png` });
  await p.click('[data-back]'); await p.waitForTimeout(1500);
  const s2 = await state();
  console.log(w + 'x' + h, 'start', JSON.stringify(s0)); console.log(w + 'x' + h, 'step1', JSON.stringify(s1)); console.log(w + 'x' + h, 'back ', JSON.stringify(s2));
  ok(!s0.funnel && s0.ret === 'hidden' && s0.enquire === 'shown', 'start keeps the full header');
  ok(s1.funnel && s1.ret === 'shown' && s1.enquire === 'hidden' && s1.tabs === 'hidden' && s1.menu === 'hidden', 'step 1 is quiet');
  ok(!s2.funnel && s2.ret === 'hidden' && s2.enquire === 'shown', 'back restores the header');
  ok(s0.footer === 'hidden', 'footer gone'); ok(!s1.overlap, 'return link clear of the wordmark');
  ok(await p.evaluate(() => document.querySelector('.nav__return').getAttribute('href') === 'index.html'), 'return link');
  // 13 Oct 2026: the return link moved from the right to the top left, left of the circle (the check had no right side position test; this one is added).
  ok(await p.evaluate(() => { const a = document.querySelector('.nav__return').getBoundingClientRect(), m = document.querySelector('.nav__mark').getBoundingClientRect(); return a.right <= m.left && a.left < innerWidth / 2; }), 'return link at the left of the circle');
  ok(!errs.length, 'errors ' + errs.join('; '));
  await p.close();
}
await b.close();
console.log(bad ? bad + ' failed' : 'all passed');
