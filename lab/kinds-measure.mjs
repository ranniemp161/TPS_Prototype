import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [360, 390, 430]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href); await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const m = await p.evaluate(() => { const k = document.querySelector('.op__copy:not(.op__copy--light) .op__kinds'); const c = document.querySelector('.op__copy:not(.op__copy--light)'); return { kindsW: k.scrollWidth, fs: getComputedStyle(k).fontSize, copyW: c.getBoundingClientRect().width, copyL: c.getBoundingClientRect().left }; });
  console.log(w, JSON.stringify(m)); await p.close();
}
await b.close();
