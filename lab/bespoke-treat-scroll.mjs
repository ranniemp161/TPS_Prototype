/* Reach Recovery treatments at a size, wheel down, and show whether the last toggle can be reached.
   node lab/bespoke-treat-scroll.mjs <outdir> [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [out, w = '360', h = '640'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h }, hasTouch: false });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
await passPostcode(p);
for (let i = 0; i < 12; i++) {
  const name = await p.evaluate(() => document.querySelector('[data-step-name]').textContent.trim());
  if (name === 'Recovery treatments') break;
  if (await p.evaluate(() => !document.querySelector('#due').value)) {
    const d = await p.$('[data-due-grid] button:not([disabled])'); if (d && await d.isVisible()) await d.click();
    const k = await p.$('label:has(#dkd-child-1)'); if (k && await k.isVisible()) await k.click();
  }
  await p.click('.dk-next'); await p.waitForTimeout(1100);
}
await p.waitForTimeout(800);
const where = () => p.evaluate(() => {
  const t = document.querySelector('input[name="thermal"]').closest('label').getBoundingClientRect();
  const bar = document.querySelector('.dk-bar').getBoundingClientRect();
  return { thermalBottom: Math.round(t.bottom), barTop: Math.round(bar.top), visible: t.bottom <= bar.top };
});
console.log('before', JSON.stringify(await where()));
await p.mouse.move(+w / 2, +h / 2);
for (let i = 1; i <= 6; i++) {
  await p.mouse.wheel(0, 60); await p.waitForTimeout(900);
  const step = await p.evaluate(() => document.querySelector('[data-step-name]').textContent.trim());
  console.log('wheel', i * 60, JSON.stringify(await where()), step);
  await p.screenshot({ path: `${out}/treat-scrolled-${w}x${h}-${i}.png` });
}
await b.close();
