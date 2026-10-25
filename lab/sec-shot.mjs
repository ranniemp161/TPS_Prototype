/* Screenshot one element at a width. node lab/sec-shot.mjs <file.html> <selector> <out.png> [width] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [file, sel, out, w = '390'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(pathToFileURL(file).href);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
const el = p.locator(sel).first();
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(1500);
await el.screenshot({ path: out });
console.log(await p.evaluate(s => {
  const W = document.documentElement.clientWidth;
  return [...document.querySelectorAll(s + ' *')].filter(e => e.getBoundingClientRect().right > W + 1)
    .map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right)).slice(0, 10).join('\n') || 'nothing past the edge';
}, sel));
await b.close();
