/* The Four Kinds pictures on phones (TJ, 11 Oct 2026): the zoom's scale as each
   picture crosses the screen, and each picture at its fullest zoom.
   node lab/hd-zoom-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
const n = await p.evaluate(() => document.querySelectorAll('[data-hd] [data-hd-scene]').length);
for (let i = 0; i < n; i++) {
  const samples = [];
  for (const at of [0.95, 0.7, 0.45, 0.2, -0.1]) {   // scene top at this fraction of the screen
    await p.evaluate(([i, at]) => { const s = document.querySelectorAll('[data-hd] [data-hd-scene]')[i]; scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight * at); }, [i, at]);
    await p.waitForTimeout(900);
    samples.push(await p.evaluate(i => { const s = document.querySelectorAll('[data-hd] [data-hd-scene]')[i]; const a = s.querySelector('[data-hd-plate]'), c = s.querySelector('[data-hd-cut]'); return new DOMMatrix(getComputedStyle(a).transform).a.toFixed(3) + '=' + new DOMMatrix(getComputedStyle(c).transform).a.toFixed(3); }, i));
  }
  // the fullest zoom, set directly, to check nothing important leaves the frame
  await p.evaluate(i => { const s = document.querySelectorAll('[data-hd] [data-hd-scene]')[i]; s.scrollIntoView({ block: 'center' }); }, i);
  await p.waitForTimeout(900);
  const box = await p.evaluate(i => { const s = document.querySelectorAll('[data-hd] [data-hd-scene]')[i]; s.querySelectorAll('img').forEach(im => im.style.transform = 'scale(1.2)'); const r = s.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; }, i);
  await p.screenshot({ path: `${out}/hz-${i}-max.png`, clip: box });
  await p.evaluate(i => { document.querySelectorAll('[data-hd] [data-hd-scene]')[i].querySelectorAll('img').forEach(im => im.style.transform = 'scale(1)'); }, i);
  await p.screenshot({ path: `${out}/hz-${i}-min.png`, clip: box });
  console.log('scene', i, 'scale (room=hands) at top 95/60/25/-10 percent:', samples.join(' '));
}
console.log('errors', JSON.stringify(errs));
await b.close();
