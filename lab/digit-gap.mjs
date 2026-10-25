/* The empty space between the digits of the card price, as drawn: for each
   pair, the gap from one digit's ink to the next. node lab/digit-gap.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const el = document.querySelector('[data-pg-fee]'); const cs = getComputedStyle(el);
  const c = document.createElement('canvas').getContext('2d');
  c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  if (cs.fontVariantNumeric) c.fontVariantNumeric = cs.fontVariantNumeric;
  const ls = parseFloat(cs.letterSpacing) || 0;
  const gaps = [];
  for (const pair of ['32', '21', '13', '56', '35', '99', '00', '11']) {
    const a = c.measureText(pair[0]), bb = c.measureText(pair[1]);
    gaps.push(a.width - a.actualBoundingBoxRight - bb.actualBoundingBoxLeft + ls);
  }
  const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  return `font ${cs.fontSize} ${cs.fontFamily.split(',')[0]}, numerals "${cs.fontVariantNumeric}", letter-spacing ${cs.letterSpacing}\nink gaps: ${gaps.map(g => g.toFixed(1)).join(', ')}\naverage gap ${avg.toFixed(2)}px, half of it ${(avg / 2).toFixed(2)}px = ${(avg / 2 / parseFloat(cs.fontSize)).toFixed(3)}em`;
}));
await b.close();
