import { chromium } from 'playwright-core';
import path from 'path';
import { pathToFileURL } from 'url'; const url = pathToFileURL(path.resolve('index/index.html')).href;
const b = await chromium.launch({ channel: 'chrome' });
for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: w > 500 ? 900 : 844 } });
  await p.goto(url); await p.evaluate(() => document.fonts.ready);
  const sec = p.locator('.act--cta');
  await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const c = document.querySelector('.cta--card').getBoundingClientRect();
    const l = document.querySelector('.cta__alt--out'); const lr = l.getBoundingClientRect();
    return { cardBottom: Math.round(c.bottom), lineTop: Math.round(lr.top), inside: document.querySelector('.cta--card').contains(l), size: getComputedStyle(l).fontSize };
  });
  console.log(w, JSON.stringify(r));
  await sec.screenshot({ path: `lab/shots/b6/cta-out-${w}.png` });
}
await b.close();
