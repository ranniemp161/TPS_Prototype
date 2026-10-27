/* Programmes: first screen at 1440, 1280x720 and 390, then next and swipe. node lab/programmes-perday-shots.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h, touch] of [[1440, 900, false], [1280, 720, false], [390, 844, true]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: touch });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const read = () => p.evaluate(() => document.querySelector('[data-pg-days]').textContent + ' | ' + document.querySelector('.pg-price__fee').textContent.replace(/\s+/g, ' '));
  console.log(w, 'start', await read());
  await p.screenshot({ path: `${out}/p${w}-a.png` });
  await p.click('[data-pg-next]'); await p.waitForTimeout(900);
  console.log(w, 'next', await read());
  await p.screenshot({ path: `${out}/p${w}-b.png` });
  await p.click('[data-pg-next]'); await p.waitForTimeout(900);
  console.log(w, 'next', await read());
  if (touch) {
    const box = await p.locator('[data-pg-card]').boundingBox();
    const cdp = await p.context().newCDPSession(p);
    const y = box.y + 120, x0 = box.x + box.width * .8, x1 = box.x + box.width * .2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await p.waitForTimeout(900);
    console.log(w, 'swipe left', await read());
  }
  const m = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, cardBottom: Math.round(document.querySelector('.pg-price__cta').getBoundingClientRect().bottom) }));
  console.log(w, JSON.stringify(m), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
