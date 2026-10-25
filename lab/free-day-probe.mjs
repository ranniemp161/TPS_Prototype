/* What changes size when a date is tapped on the released page? node lab/free-day-probe.mjs [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '360', h = '640'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
const snap = () => p.evaluate(() => {
  const o = { scrollY: Math.round(scrollY), fit: document.querySelector('.dk').getAttribute('data-fit') };
  document.querySelectorAll('.dk-page').forEach((pg, k) => { const r = pg.getBoundingClientRect(); o['page' + k + ' ' + (pg.getAttribute('data-title') || '')] = Math.round(r.top + scrollY) + ' h' + Math.round(r.height) + (pg.classList.contains('is-tight') ? ' tight' : ''); });
  ['body', 'header', '.dk-bar', '.dk'].forEach(s => { const e = document.querySelector(s); if (e) { const r = e.getBoundingClientRect(); o[s] = Math.round(r.top + scrollY) + ' h' + Math.round(r.height); } });
  o.bodyClass = document.body.className;
  return o;
});
await p.evaluate(() => document.querySelector('[data-date]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(700);
const a = await snap();
const d = await p.evaluate(() => { const r = document.querySelectorAll('[data-date]')[10].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
await p.mouse.click(d[0], d[1]); await p.waitForTimeout(1200);
const c = await snap();
for (const k of Object.keys(a)) if (a[k] !== c[k]) console.log(k.padEnd(28), String(a[k]).padEnd(24), '->', c[k]);
await b.close();
