/* Tailored phones: the summary line's height at each stay (it must not change). node lab/ty-sum-measure.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [320, 360, 390, 430, 768]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const el = document.querySelector('[data-ty] .ty__sum'), out = document.querySelector('[data-ty] [data-out="days"]'), r = [];
    ['5', '7', '14', '30'].forEach(v => { out.textContent = v; r.push(v + ':' + Math.round(el.getBoundingClientRect().height)); });
    out.textContent = '5';
    return r.join(' ') + ' fs ' + getComputedStyle(el).fontSize;
  })));
  await p.close();
}
await b.close();
