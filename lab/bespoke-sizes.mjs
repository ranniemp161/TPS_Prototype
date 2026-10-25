/* Font size and family of every body paragraph on each builder screen. node lab/bespoke-sizes.mjs [width] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [w = '1440'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => [...document.querySelectorAll('.dk-page p, .dk-page .tg__t, .dk-page .tg__s')]
  .filter(e => e.offsetParent && e.textContent.trim())
  .map(e => { const c = getComputedStyle(e); return `${c.fontSize.padStart(7)} ${c.fontFamily.split(',')[0].padEnd(12)} ${e.className.padEnd(34)} ${e.textContent.trim().slice(0, 50)}`; })
  .filter((v, i, a) => a.indexOf(v) === i).join('\n')));
await b.close();
