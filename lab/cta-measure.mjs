// Home, Tell us about your due date: text sizes (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.evaluate(() => { const c = document.querySelector('.cta').getBoundingClientRect(); window.scrollBy(0, c.top + c.height / 2 - innerHeight / 2); });
  await p.waitForTimeout(2000);
  const m = await p.evaluate(() => ['.cta__lead', '.cta__meta', '.cta__alt'].map(s => { const c = getComputedStyle(document.querySelector('.cta ' + s)); return s + ' ' + c.fontFamily.split(',')[0] + ' ' + c.fontSize + ' ' + c.color; }));
  console.log(w, JSON.stringify(m));
  if (out) await p.screenshot({ path: out + `cta-${w}.png` });
  await p.close();
}
await b.close();
