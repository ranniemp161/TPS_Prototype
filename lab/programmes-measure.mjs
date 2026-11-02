// Measures the Programmes hero on desktop (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'programmes.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const ps = [...document.querySelectorAll('.pg-look__p')];
  const nat = ps.map(e => { const s = document.createElement('span'); s.textContent = e.textContent; s.style.whiteSpace = 'nowrap'; e.after(s); s.style.font = getComputedStyle(e).font; const w = s.getBoundingClientRect().width; s.remove(); return { w: Math.round(w), em: +(w / parseFloat(getComputedStyle(e).fontSize)).toFixed(1), fs: getComputedStyle(e).fontSize }; });
  const r = s => document.querySelector(s).getBoundingClientRect();
  const cs = s => getComputedStyle(document.querySelector(s));
  return JSON.stringify({ nat, line: r('.pg-line'), stage: r('.pg-stage'), card: r('[data-pg-card]'), cardPad: cs('[data-pg-card]').padding, stageMargin: cs('.pg-stage').margin, linePad: cs('.pg-line').padding, lineMargin: cs('.pg-line').margin }, null, 1);
}));
await b.close();
