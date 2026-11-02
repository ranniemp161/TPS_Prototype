// Square probe (TJ, 2 Nov 2026; Opus): under the default Coral, list every
// element and pseudo element with a radius, sorted into circles and the rest.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['index', 'programmes', 'build-your-programme', 'request-a-place', 'about', 'what-we-do', 'faqs', 'gifts', 'single-treatments', 'who-comes-into-your-home'];
const Q = process.env.Q || '?panel=show';
const b = await chromium.launch({ channel: 'chrome' });
const circ = new Map(), rest = new Map();
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const p = await b.newPage({ viewport: vp });
  for (const pg of PAGES) {
    await p.goto(pathToFileURL(path.join(process.cwd(), 'index', pg + '.html')).href + Q);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => {
      const out = [];
      const name = el => el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].join('.') : '');
      for (const el of document.querySelectorAll('*')) {
        if (el.closest('#tps-palette-panel') || el.closest('svg')) continue;
        for (const ps of [null, '::before', '::after']) {
          const cs = getComputedStyle(el, ps);
          if (ps && (cs.content === 'none' || cs.content === 'normal')) continue;
          const rads = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius];
          if (rads.every(x => x === '0px')) continue;
          let w, h;
          if (ps) { w = parseFloat(cs.width); h = parseFloat(cs.height); } else { const bb = el.getBoundingClientRect(); w = bb.width; h = bb.height; }
          const rv = parseFloat(rads[0]);
          const circle = Math.abs(w - h) < 1.5 && (rads[0].includes('%') ? rv >= 50 : rv >= w / 2 - 0.5);
          out.push({ n: name(el) + (ps || ''), circle, rad: rads.join(' '), w: Math.round(w), h: Math.round(h) });
        }
      }
      return out;
    });
    for (const x of r) { const m = x.circle ? circ : rest; if (!m.has(x.n)) m.set(x.n, pg + ' ' + vp.width + ' ' + x.rad + ' ' + x.w + 'x' + x.h); }
  }
  await p.close();
}
console.log('CIRCLES'); for (const [k, v] of circ) console.log('  ' + k + '  | ' + v);
console.log('OTHERS'); for (const [k, v] of rest) console.log('  ' + k + '  | ' + v);
await b.close();
