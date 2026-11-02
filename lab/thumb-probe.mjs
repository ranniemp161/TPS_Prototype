// Probe: thumb image box vs number span box (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.gal__thumb')].map(t => {
  const i = t.querySelector('img'), s = t.querySelector('.gal__num'); const ci = getComputedStyle(i), cs = getComputedStyle(s);
  const r = e => { const q = e.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; };
  return { btn: r(t), img: r(i), span: r(s), nat: [i.naturalWidth, i.naturalHeight], src: i.currentSrc.split('/').pop(), objPos: ci.objectPosition, imgTransform: ci.transform, spanBgSize: cs.backgroundSize, spanBg: cs.backgroundImage.split('/').pop() };
})), null, 1));
await b.close();
