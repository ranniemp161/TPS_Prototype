/* Programmes phones: open the treatments fold and check the line and the whole card share one screen. node lab/programmes-fold-scroll.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 740], [430, 932], [375, 667]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.tap('[data-pg-treat-toggle]'); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const q = s => document.querySelector(s).getBoundingClientRect();
    return { navBottom: Math.round(q('[data-nav]').bottom), lineTop: Math.round(q('.pg-line').top), cardBottom: Math.round(q('.pg-card').bottom), btnBottom: Math.round(q('.pg-price__cta--foot').bottom), screen: innerHeight };
  });
  console.log(w + 'x' + h, JSON.stringify(r), r.cardBottom <= r.screen ? 'FITS' : 'SHORT BY ' + (r.cardBottom - r.screen), 'errors', JSON.stringify(errs));
  await p.screenshot({ path: `${out}/fold-${w}x${h}.png` });
  await p.close();
}
await b.close();
