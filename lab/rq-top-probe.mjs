import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(path.resolve('index/request-a-place.html')).href);
console.log(await p.evaluate(() => {
  const o = {};
  for (const s of ['main', '.pg-lengths', '.pg-lengths .aurora', '.pg-wrap']) {
    const e = document.querySelector(s), c = getComputedStyle(e);
    o[s] = { top: Math.round(e.getBoundingClientRect().top), mt: c.marginTop, pt: c.paddingTop, bg: c.backgroundColor, ov: c.overflow };
  }
  return JSON.stringify(o, null, 1);
}));
await b.close();
