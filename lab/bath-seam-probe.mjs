// What sits either side of the line under the bath (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
for (let n = 0; n < 400; n++) { const e = await p.evaluate(() => document.querySelector('.act--bath').getBoundingClientRect().bottom / innerHeight); if (e <= 0.5) break; await p.mouse.wheel(0, 60); await p.waitForTimeout(40); }
await p.waitForTimeout(1300);
console.log(await p.evaluate(() => {
  const bb = document.querySelector('.act--bath').getBoundingClientRect().bottom;
  const d = y => document.elementsFromPoint(300, y).slice(0, 6).map(e => { const s = getComputedStyle(e); return `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} bg=${s.backgroundColor}/${s.backgroundImage.slice(0, 40)} op=${s.opacity} pos=${s.position}`; });
  const turn = document.querySelector('.act--turn').getBoundingClientRect();
  return JSON.stringify({ bathBottom: bb, turnTop: turn.top, above: d(bb - 10), below: d(bb + 10), bodyBg: getComputedStyle(document.body).backgroundColor, mainBg: getComputedStyle(document.querySelector('main') || document.body).backgroundColor }, null, 1);
}));
await b.close();
