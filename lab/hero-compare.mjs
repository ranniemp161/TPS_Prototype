/* Home hero against What We Do hero: size, font and weight of each part. node lab/hero-compare.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const parts = {
  'index.html': [['Title', '.act--hero h1'], ['Quentin line', '.act--hero .script'], ['Body text', '.act--hero .lede']],
  'what-we-do.html': [['Small line above title', '.op__kicker'], ['Title line 1', '.op__hl:not(.op__hl--em)'], ['Title line 2', '.op__hl--em'], ['List', '.op__rows li:nth-child(2)'], ['List, care kinds', '.op__kinds span']],
};
for (const [w, h] of [[1440, 900], [390, 844]]) {
  console.log(`\n== ${w} wide`);
  for (const [file, list] of Object.entries(parts)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(process.cwd() + '/index/' + file).href);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
    for (const [label, sel] of list) {
      const r = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return `${parseFloat(c.fontSize).toFixed(1)}px  ${c.fontFamily.split(',')[0].replace(/"/g, '')}  weight ${c.fontWeight}  ${c.textTransform}  "${e.textContent.trim().slice(0, 34)}"`; }, sel);
      console.log(`${file.padEnd(16)} ${label.padEnd(24)} ${r}`);
    }
    await p.close();
  }
}
await b.close();
