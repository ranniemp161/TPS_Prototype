/* The size you actually see: font size times any scale applied by the hero's
   animation (box height on screen over its layout height). node lab/hero-visible.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const parts = {
  'index.html': [['Title', '.act--hero h1'], ['Quentin line', '.act--hero .script'], ['Body text', '.act--hero .lede']],
  'what-we-do.html': [['Quentin "What we do"', '.op__kicker'], ['Title', '.op__hl'], ['List text', '.op__rows li:nth-child(2)']],
};
for (const [w, h] of [[1440, 900], [390, 844]]) {
  console.log(`\n== ${w} wide`);
  for (const [file, list] of Object.entries(parts)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(process.cwd() + '/index/' + file).href);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(3000);
    for (const [label, sel] of list) {
      const r = await p.evaluate(sel => {
        const e = document.querySelector(sel); const fs = parseFloat(getComputedStyle(e).fontSize);
        const scale = e.offsetHeight ? e.getBoundingClientRect().height / e.offsetHeight : 1;
        return { fs, seen: fs * scale, scale };
      }, sel);
      console.log(`${file.padEnd(16)} ${label.padEnd(22)} seen ${r.seen.toFixed(1).padStart(6)}px   (font ${r.fs.toFixed(1)}px x scale ${r.scale.toFixed(2)})`);
    }
    await p.close();
  }
}
await b.close();
