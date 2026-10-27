// Tailored For You: arrives in its split, the day line unchanged (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  // arriving (top at 40 percent down), at its top, then through the line
  for (const [k, at] of [['a-arrive', -0.4], ['b-top', 0], ['c-7', 0.2], ['d-14', 1.2], ['e-30', 2.15]]) {
    await p.evaluate(at => { const s = document.querySelector('[data-ty]'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY + at * innerHeight); }, at);
    await p.waitForTimeout(1600);
    const m = await p.evaluate(() => { const s = document.querySelector('[data-ty]'); const sl = document.querySelector('.ty__slot').getBoundingClientRect(); const ph = document.querySelector('.ty__photo').getBoundingClientRect(); const cs = getComputedStyle(s); return { cls: s.className, card: getComputedStyle(document.querySelector('.ty__card')).opacity, photoInSlot: Math.abs(ph.left - sl.left) < 2 && Math.abs(ph.top - sl.top) < 2 && Math.abs(ph.width - sl.width) < 2, day: document.querySelector('[data-ledger]').style.getPropertyValue('--d') || cs.getPropertyValue('--d'), h: Math.round(s.offsetHeight / innerHeight * 100) + 'vh' }; });
    console.log(w, k, JSON.stringify(m));
    await p.screenshot({ path: out + `ty-${w}-${k}.png` });
  }
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
