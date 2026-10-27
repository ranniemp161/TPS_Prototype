import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.click('[data-next]'); await p.waitForTimeout(1500);
  const o = await p.evaluate(() => ({ start: document.querySelector('.dk').classList.contains('is-start'), op: getComputedStyle(document.querySelector('.dk-aurora')).opacity }));
  console.log(w, 'step 2', JSON.stringify(o));
  await p.screenshot({ path: `lab/bespoke-header/step2-${w}.png` });
  await p.click('[data-back]'); await p.waitForTimeout(1500);
  console.log(w, 'back', await p.evaluate(() => getComputedStyle(document.querySelector('.dk-aurora')).opacity));
  await p.close();
}
await b.close();
