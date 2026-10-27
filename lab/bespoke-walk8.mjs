/* Bespoke restyle chat 8: the phones walk and the short window walk.
   node lab/bespoke-walk8.mjs <outdir|-> [shots] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2], shots = process.argv[3] === 'shots';
const b = await chromium.launch({ channel: 'chrome' });
const sizes = [[390,844],[360,640],[430,932],[1835,605],[1280,640]];
for (const [w,h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w < 800 });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  for (let i = 0; i <= 8; i++) {
    await p.evaluate(k => { const d = document.querySelector('[data-deck]'); const pg = d.querySelectorAll('.dk-page')[k]; d.scrollTo({ left: pg.offsetLeft, behavior: 'instant' }); }, i);
    await p.waitForTimeout(700);
    const m = await p.evaluate(k => {
      const de = document.documentElement;
      const deck = document.querySelector('[data-deck]');
      const pg = deck.querySelectorAll('.dk-page')[k];
      const dr = deck.getBoundingClientRect();
      const fee = document.querySelector('.dk-fee').getBoundingClientRect();
      const bar = document.querySelector('.dk-bar').getBoundingClientRect();
      // sideways overflow inside the page
      const over = [];
      const pr = pg.getBoundingClientRect();
      pg.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); if (r.width && s.visibility !== 'hidden' && s.display !== 'none' && (r.right > pr.right + 1 || r.left < pr.left - 1) && !e.closest('.sr-only')) over.push((e.className && e.className.baseVal === undefined ? '.' + String(e.className).split(' ')[0] : e.tagName) + ' ' + Math.round(r.left - pr.left) + '..' + Math.round(r.right - pr.left)); });
      // tap targets
      const small = [];
      const sel = 'a, button, label, [role=button], input:not(.sr-only), summary, [data-goto], [data-back], [data-next]';
      document.querySelectorAll(sel).forEach(e => {
        const r = e.getBoundingClientRect(), s = getComputedStyle(e);
        if (!r.width || !r.height || s.visibility === 'hidden' || s.display === 'none') return;
        const inPage = pg.contains(e), inBar = e.closest('.dk-bar'), inFee = e.closest('.dk-fee');
        if (!(inPage || inBar || inFee)) return;
        if (e.closest('.site-header, header, footer, .sr-only')) return;
        if (inPage && (r.right < pr.left + 2 || r.left > pr.right - 2)) return;
        if (r.width < 43.5 || r.height < 43.5) small.push((e.className ? '.' + String(e.className).split(' ')[0] : e.tagName) + ' ' + (e.textContent || '').trim().slice(0, 18) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      });
      return { deckH: Math.round(dr.height), feeH: Math.round(fee.height), barH: Math.round(bar.height), dkTop: Math.round(fee.top), docOver: de.scrollWidth - innerWidth, pageOver: pg.scrollWidth - pg.clientWidth, over: over.slice(0,6), small };
    }, i);
    console.log(w + 'x' + h, 'p' + i, JSON.stringify(m));
    if (shots) await p.screenshot({ path: `${out}/w${w}x${h}-p${i}.png` });
  }
  await p.close();
}
await b.close();
