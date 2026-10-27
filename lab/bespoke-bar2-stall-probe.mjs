/* Bar in one layer (12 Oct 2026): time to land per jump and per Next, at 1440x900 and 1835x605.
   node lab/bespoke-bar2-stall-probe.mjs ["extra css"]   GPU=1 HEADED=1 for a real GPU window. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome', headless: process.env.HEADED ? false : true, args: process.env.GPU ? ['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist'] : [] });
const css = process.argv[2] || '';
for (const [w,h] of [[1440,900],[1835,605]]) {
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.waitForLoadState('load'); if (css) await p.addStyleTag({ content: css }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ type: 'longtask' }); });
const res = [];
for (const i of [3, 1, 3, 5, 8, 2]) {
  const t = await p.evaluate(i => new Promise(r => { const t0 = performance.now(); document.querySelectorAll('.dk-page')[i].scrollIntoView({ block: 'center', behavior: 'instant' }); const iv = setInterval(() => { const cur = [...document.querySelectorAll('.dk-line__stop')].findIndex(s => s.classList.contains('is-on')); if (cur === i) { clearInterval(iv); r(Math.round(performance.now() - t0)); } }, 10); }), i);
  res.push(i + ':' + t + 'ms'); await p.waitForTimeout(1200);
}
// Next clicks
const nx = [];
for (let k = 0; k < 4; k++) { const t = await p.evaluate(() => new Promise(r => { const t0 = performance.now(); document.querySelector('[data-next]').click(); requestAnimationFrame(() => requestAnimationFrame(() => r(Math.round(performance.now() - t0)))); })); nx.push(t); await p.waitForTimeout(1200); }
console.log(w, 'jump settle', res.join(' '), 'next 2 frames', nx.join(','), 'longtasks', JSON.stringify(await p.evaluate(() => window.__lt)));
await p.close(); }
await b.close();
