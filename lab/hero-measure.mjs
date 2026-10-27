// Home hero text: sizes and line counts across window sizes (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const sizes = (process.argv[3] || '1330x652').split(',').map(s => s.split('x').map(Number));
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of sizes) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const m = await p.evaluate(() => {
    const lines = el => { const r = document.createRange(); r.selectNodeContents(el); const tops = new Set([...r.getClientRects()].map(x => Math.round(x.top))); return tops.size; };
    const one = s => { const el = document.querySelector('.act--hero ' + s); const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return { fs: c.fontSize, lines: lines(el), left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), bottom: Math.round(r.bottom) }; };
    const copy = document.querySelector('.act--hero .stage__copy').getBoundingClientRect();
    return { h1: one('h1'), script: one('.script'), lede: one('.lede'), copyBottom: Math.round(copy.bottom), copyLeft: Math.round(copy.left) };
  });
  console.log(w + 'x' + h, JSON.stringify(m));
  if (out) await p.screenshot({ path: out + `hero-${w}x${h}.png` });
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
