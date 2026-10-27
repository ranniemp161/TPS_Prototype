// What We Do: the fly through's opening line (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.mouse.move(w / 2, h / 2);
  // entering (top of the flight at 40 percent down), held at its top, mid glide, at the door
  for (const [k, fn] of [
    ['a-enter', `document.querySelector('[data-flight]').getBoundingClientRect().top - innerHeight*0.4`],
    ['b-top', `document.querySelector('[data-flight]').getBoundingClientRect().top`],
    ['c-glide', `document.querySelector('[data-flight]').getBoundingClientRect().top + innerHeight*0.5`],
    ['d-door', `document.querySelector('[data-flight]').getBoundingClientRect().top + innerHeight*1.05`]]) {
    await p.evaluate(`window.scrollBy(0, ${fn})`); await p.waitForTimeout(1600);
    const o = await p.evaluate(() => { const v = document.querySelector('[data-flight-veil]'); const r = document.querySelector('[data-route]'); return getComputedStyle(document.querySelector('[data-flight-intro]')).opacity + ' veil ' + (v ? getComputedStyle(v).opacity : '-') + ' route ' + getComputedStyle(r).opacity; });
    console.log(w, k, o);
    await p.screenshot({ path: out + `intro-${w}-${k}.png` });
  }
  await p.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
