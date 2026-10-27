/* Housekeeping zones title on phones: the two sizes at several widths, and that the desktop size is unchanged.
   node lab/zones-title-measure.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [360, 390, 430, 768, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const s = document.querySelector('.zones__script'), c = document.querySelector('.zones__caps');
    const h = document.querySelector('.zones__h');
    return { script: getComputedStyle(s).fontSize, caps: getComputedStyle(c).fontSize, titleW: Math.round(h.getBoundingClientRect().width), overflowX: document.documentElement.scrollWidth > innerWidth };
  })));
  await p.close();
}
await b.close();
