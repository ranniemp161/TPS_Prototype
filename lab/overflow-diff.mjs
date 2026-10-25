/* Every element whose right edge passes the viewport. node lab/overflow-diff.mjs <file.html> [width] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [file, w = '390'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(pathToFileURL(file).href);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
console.log(await p.evaluate(() => {
  const W = document.documentElement.clientWidth, out = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > W + 1) out.push(`${el.tagName}.${String(el.className).slice(0,40)} right=${Math.round(r.right)}`);
  }
  return out.join('\n');
}));
await b.close();
