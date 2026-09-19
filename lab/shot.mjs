/* Generic full page screenshot. node lab/shot.mjs <file.html> <out.png> [width] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const [file, out, w = '1280', y, h2] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: 1000 } });

await p.goto(pathToFileURL(file).href);
await p.waitForLoadState('load');
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);

const h = await p.evaluate(() => document.documentElement.scrollHeight);
const overflow = await p.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);

await p.screenshot({ path: out, fullPage: true,
  ...(y ? { clip: { x: 0, y: +y, width: +w, height: +h2 } } : {}) });
console.log(`${file}  ${w}px wide  document ${h}px  horizontal overflow ${overflow}px`);

await b.close();
