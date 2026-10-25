/* Screenshot with a heading centred in the window, after the animations settle. node lab/title-shot.mjs <selector> <out.png> [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [sel, out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
for (let i = 0; i < 80; i++) {
  const top = await p.evaluate(s => document.querySelector(s).getBoundingClientRect().top, sel);
  if (top < +h * 0.4) break;
  await p.mouse.wheel(0, Math.min(400, top - +h * 0.35)); await p.waitForTimeout(150);
}
await p.waitForTimeout(3500);
await p.screenshot({ path: out });
await b.close();
