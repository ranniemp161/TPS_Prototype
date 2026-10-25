/* The gap above the testimonials band (from the lowest thing in However long
   you need) and the gap below it (to the call to action card).
   node lab/voices-gaps.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [390, 844], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2000);
  console.log(`${w}x${h}`.padEnd(10), await p.evaluate(() => {
    const prog = document.querySelector('.act--programmes');
    const low = Math.max(...[...prog.querySelectorAll('.gal, .gal *')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().bottom));
    const band = document.querySelector('.voices').getBoundingClientRect();
    const card = document.querySelector('.cta--card').getBoundingClientRect();
    const progEnd = prog.getBoundingClientRect().bottom;
    const voicesSec = document.querySelector('.act--voices').getBoundingClientRect();
    const ctaSec = document.querySelector('.act--cta').getBoundingClientRect();
    return `above ${Math.round(band.top - low)}px (programmes padding ${Math.round(progEnd - low)} + ${Math.round(band.top - progEnd)})   below ${Math.round(card.top - band.bottom)}px (to cta section ${Math.round(ctaSec.top - band.bottom)} + cta padding ${Math.round(card.top - ctaSec.top)})`;
  }));
  await p.close();
}
await b.close();
