// Restyle chat 2: start page shots and measurements.  node lab/bespoke-start-check.mjs <outdir>
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/start-${w}.png` });
  const m = await p.evaluate(() => {
    const sec = document.querySelector('[data-section="builder-start"]');
    const bad = [];
    for (const el of sec.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      const bw = ['Top','Right','Bottom','Left'].map(k => parseFloat(s['border'+k+'Width'])).some(v => v > 0) && !['none','hidden'].includes(s.borderTopStyle);
      const bg = s.backgroundColor;
      if (bw || (bg !== 'rgba(0, 0, 0, 0)' && !el.classList.contains('aurora__field') && !el.closest('.aurora'))) bad.push(el.className + ' ' + bg + ' border:' + bw);
    }
    const k = sec.querySelector('.dk-kicker'), ks = getComputedStyle(k);
    const r = document.createRange(); r.selectNodeContents(k);
    const copy = sec.querySelector('.dk-start__copy').getBoundingClientRect();
    const fr = sec.querySelector('.dk-start__frame').getBoundingClientRect();
    return { bad, kickerH: +k.getBoundingClientRect().height.toFixed(1), kickerLH: ks.lineHeight, kickerFS: ks.fontSize, kickerFont: ks.fontFamily.slice(0,20), kickerW: +r.getBoundingClientRect().width.toFixed(1), kickerBoxW: +k.getBoundingClientRect().width.toFixed(1), rects: r.getClientRects().length,
      copy: [copy.left, copy.top, copy.width, copy.height].map(Math.round), frame: [fr.left, fr.top, fr.width, fr.height].map(Math.round), overflowX: document.documentElement.scrollWidth > innerWidth, pageScroll: [sec.scrollHeight, sec.clientHeight] };
  });
  console.log(w, JSON.stringify(m));
}
await b.close();
