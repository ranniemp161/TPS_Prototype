/* Build Your Programme as one flowing page (TJ, 12 Oct 2026): nothing scrolls inside
   anything; the bar follows the section being read; Next and the stops land on a section.
   node lab/bespoke-flow-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
let bad = 0;
for (const [W, H] of [[1440, 900], [390, 844], [1835, 605]]) {
  const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: W < 800, isMobile: W < 800 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  // inner scrollers: any element that can scroll vertically on its own
  const inner = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => {
    const cs = getComputedStyle(e); return /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 0 && !e.closest('[data-nav]');
  }).map(e => (e.className || e.tagName) + ' ' + e.clientHeight + '/' + e.scrollHeight));
  const doc = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, ox: document.documentElement.scrollWidth > innerWidth }));
  const st = () => p.evaluate(() => {
    const on = document.querySelector('.dk-line__stop.is-on'), stops = [...document.querySelectorAll('.dk-line__stop')];
    return { y: Math.round(scrollY), cur: stops.indexOf(on), name: document.querySelector('[data-step-name]').textContent, next: document.querySelector('[data-next]').textContent };
  });
  const tops = await p.evaluate(() => [...document.querySelectorAll('.dk-page')].map(pg => Math.round(pg.getBoundingClientRect().top + scrollY)));
  // swipe/scroll down section by section by wheel, reading where the bar says we are
  const follow = [];
  for (let i = 0; i < tops.length; i++) {
    await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.max(0, tops[i] - H * 0.3)); await p.waitForTimeout(350);
    follow.push((await st()).cur);
  }
  // Next from the top, all the way
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(400);
  const nexts = [];
  for (let i = 0; i < 8; i++) {
    await p.click('[data-next]'); await p.waitForTimeout(1300);
    const s = await st();
    const land = await p.evaluate(k => { const pg = document.querySelectorAll('.dk-page')[k]; const hdr = document.querySelector('[data-nav]').getBoundingClientRect().height, fee = document.querySelector('.dk-fee').getBoundingClientRect().height; return Math.round(pg.getBoundingClientRect().top - hdr - fee); }, s.cur);
    nexts.push(s.cur + '@' + land);
  }
  // a stop tap back to 02
  await p.click('.dk-line__stop:nth-of-type(3)'); await p.waitForTimeout(1300);
  const back02 = (await st()).cur;
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/flow-${W}x${H}-top.png` });
  await p.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), tops[2] - 150); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/flow-${W}x${H}-mid.png` });
  await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(600);
  const end = await st();
  await p.screenshot({ path: `${out}/flow-${W}x${H}-end.png` });
  const ok = !inner.length && !doc.ox && follow.join() === '0,1,2,3,4,5,6,7,8' && back02 === 2 && end.cur === 8 && !errs.length;
  if (!ok) bad++;
  console.log(`${W}x${H}`, ok ? 'OK' : 'CHECK', JSON.stringify({ docH: doc.h, innerScrollers: inner, overflowX: doc.ox, follow: follow.join(), nextLands: nexts.join(' '), stop02: back02, atEnd: end.cur + ' ' + end.next, errs }));
  await p.close();
}
await b.close();
console.log(bad ? 'SOME CHECKS NEED A LOOK' : 'ALL OK');
