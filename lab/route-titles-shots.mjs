// What We Do fly through: room titles only (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  for (const [name, t] of [['arrival', 1.45], ['meals', 4.5], ['home', 9], ['baby', 13.5], ['treat', 19]]) {
    await p.evaluate(t => window.__flight.scrollToTime(t), t);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: out + `route-${w}-${name}.png` });
  }
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
