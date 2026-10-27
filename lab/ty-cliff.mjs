/* Tailored desktop: the card's room at window heights either side of the old 760px boundary. node lab/ty-cliff.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const H of [700, 740, 760, 761, 768, 800, 830, 860, 861, 880, 900]) {
  const p = await b.newPage({ viewport: { width: 1440, height: H } });
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href, { timeout: 60000 });
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  console.log(H, JSON.stringify(await p.evaluate(() => { const t = document.querySelector('[data-ty]'); const c = t.querySelector('.ty__card'); return { mode: t.classList.contains('is-calm') ? 'calm' : t.classList.contains('is-tight') ? 'tight' : 'held', cardH: c.clientHeight, cardW: Math.round(c.getBoundingClientRect().width), trackMax: getComputedStyle(t.querySelector('.ty__track')).maxWidth }; })));
  await p.close();
}
await b.close();
