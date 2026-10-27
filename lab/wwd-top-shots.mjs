// What We Do opening: the photograph under the header (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [1280, 720], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(3000);
  const m = await p.evaluate(() => { const f = document.querySelector('[data-op-frame]').getBoundingClientRect(); const n = document.querySelector('[data-nav]').getBoundingClientRect(); return { frameTop: Math.round(f.top), frameH: Math.round(f.height), navBottom: Math.round(n.bottom) }; });
  console.log(w, JSON.stringify(m));
  await p.screenshot({ path: out + `top-${w}.png` });
  await p.mouse.move(w / 2, h / 2);
  for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 200); await p.waitForTimeout(60); }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out + `top-${w}-scrolled.png` });
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
