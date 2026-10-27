// The Postpartum Suite Experience: arrives with both cards in place (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [1280, 720], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  for (const [k, at] of [['a-arrive', -0.4], ['b-top', 0], ['c-hours', 1.6], ['d-late', 4.6]]) {
    await p.evaluate(at => { const s = document.querySelector('[data-vt]'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY + at * innerHeight); }, at);
    await p.waitForTimeout(1600);
    const m = await p.evaluate(() => { const s = document.querySelector('[data-vt]'); return { ci: getComputedStyle(s).getPropertyValue('--vt-ci').trim(), phT: s.style.getPropertyValue('--ph-t'), h: Math.round(s.offsetHeight / innerHeight * 100) + 'vh', firstHour: getComputedStyle(document.querySelector('[data-vt-item]')).opacity }; });
    console.log(w, k, JSON.stringify(m));
    await p.screenshot({ path: out + `vt-${w}-${k}.png` });
  }
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
