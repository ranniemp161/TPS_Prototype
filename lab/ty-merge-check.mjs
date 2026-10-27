/* Tailored For You on a phone (TJ, 12 Oct 2026): the even frame, the card joined to the
   photograph, Read more lifting the glass into it. W=390 node lab/ty-merge-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], W = +(process.env.W || 390);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const top = await p.evaluate(() => document.querySelector('[data-ty]').getBoundingClientRect().top + scrollY);
for (const dy of [-600, -300, 0, 200]) { await p.evaluate(y => scrollTo(0, y), top + dy); await p.waitForTimeout(300); }
await p.waitForTimeout(1200);
const m = () => p.evaluate(() => {
  const s = document.querySelector('[data-ty]'), ph = s.querySelector('.ty__photo'), c = s.querySelector('.ty__card'), sr = s.getBoundingClientRect(), pr = ph.getBoundingClientRect(), cr = c.getBoundingClientRect();
  const st = getComputedStyle(s);
  return { secTop: Math.round(sr.top), photoBox: [Math.round(pr.top), Math.round(pr.bottom)], phT: st.getPropertyValue('--ph-t').trim(), phL: st.getPropertyValue('--ph-l').trim(), card: [Math.round(cr.top), Math.round(cr.bottom), Math.round(cr.left), Math.round(innerWidth - cr.right)], g: st.getPropertyValue('--ty-g').trim(), overflowX: document.documentElement.scrollWidth > innerWidth };
});
console.log('closed', JSON.stringify(await m()));
await p.screenshot({ path: `${out}/m-${W}-closed.png` });
await p.click('[data-ty] .tl-readmore__toggle'); await p.waitForTimeout(350);
await p.screenshot({ path: `${out}/m-${W}-mid.png` });
await p.waitForTimeout(1200);
console.log('open  ', JSON.stringify(await m()));
await p.screenshot({ path: `${out}/m-${W}-open.png` });
await p.click('[data-ty] .tl-readmore__toggle'); await p.waitForTimeout(1500);
console.log('closed again', JSON.stringify(await m()));
console.log('errors', JSON.stringify(errs));
await b.close();
