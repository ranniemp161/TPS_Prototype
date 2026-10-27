/* Home house film: each caption arrives with its room (TJ, 14 Oct 2026). Scrolls the film in small
   steps; at each step reads the film time and the current route stop. node lab/flight-caption-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1864, height: 984 } });
await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const top = await p.evaluate(() => document.querySelector('[data-flight]').getBoundingClientRect().top + scrollY);
const end = await p.evaluate(() => { const s = document.querySelector('[data-flight]'); return s.getBoundingClientRect().bottom + scrollY - innerHeight; });
const rows = []; let last = '';
for (let y = top - 1200; y <= end; y += 60) {
  await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(140);
  const r = await p.evaluate(() => { const v = document.querySelector('[data-video]'); const c = document.querySelector('[data-stop].is-current .route__name'); return { t: v.currentTime, stop: c ? c.textContent.trim() : '-' }; });
  if (r.stop !== last) { rows.push(r.t.toFixed(2) + 's ' + r.stop); last = r.stop; }
}
console.log(rows.join(' | '));
await b.close();
