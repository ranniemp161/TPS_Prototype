import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const q = await b.newPage({ viewport: { width: w, height: h } });
  await q.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await q.waitForLoadState('load'); await q.evaluate(() => document.fonts.ready); await q.waitForTimeout(1500);
  const info = await q.evaluate(() => [...document.querySelectorAll('main > section, main > div, body > section')].slice(0,6).map(s => [s.dataset.sectionName || s.className, Math.round(s.getBoundingClientRect().top + scrollY)]));
  console.log(w, JSON.stringify(info));
  const second = info[1][1];
  let i = 0;
  for (const y of [second - h * 0.6, second - h * 0.2]) { await q.evaluate(v => scrollTo(0, v), Math.round(y)); await q.waitForTimeout(1500); await q.screenshot({ path: `${out}/j${w}-${i++}.png` }); }
  await q.close();
}
await b.close();
