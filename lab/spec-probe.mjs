/* Samples the specialist entrance on a phone after one jump: title line offsets and the frame's clip.
   node lab/spec-probe.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2600);
const r = await p.evaluate(() => new Promise(res => {
  scrollTo(0, document.querySelector('#specialist').getBoundingClientRect().top + scrollY - 60);
  const t0 = performance.now(), out = [];
  const lines = [...document.querySelectorAll('#specialist .wh2 .kin-line > span')], f = document.querySelector('[data-spec-frame]');
  (function tick() {
    const t = performance.now() - t0;
    out.push(Math.round(t) + 'ms lines ' + lines.map(l => { const c = getComputedStyle(l); return new DOMMatrix(c.transform).m41.toFixed(0) + '/' + (+c.opacity).toFixed(2); }).join(' ') + ' clip ' + getComputedStyle(f).clipPath.slice(0, 26));
    if (t < 1900) setTimeout(tick, 150); else res(out);
  })();
}));
console.log(r.join('\n'));
await b.close();
