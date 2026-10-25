/* Every title on the home page against the hero title, at several windows.
   node lab/home-titles.mjs   (seen size = font size x any animation scale) */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const list = [['Hero title', '.act--hero h1'], ['What is Postpartum Care', '#confinement-heading'], ['Four kinds of care', '.act--care .care__head .display'], ['However long you need', '.act--programmes .sec-head .display'], ['7 days of care (changes)', '.gal__heading'], ['Testimonials', '.tv2__title'], ['Tell us about your due date', '.act--cta .cta .display'], ['Try a signature treatment', '.act--treatments-b .sec-head .display']];
let bad = 0;
for (const [w, h] of [[1920, 1080], [1440, 900], [1280, 720], [1024, 768], [820, 1100], [390, 844], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const rows = await p.evaluate(list => list.map(([n, s]) => { const e = document.querySelector(s); if (!e) return [n, null, null]; const fs = parseFloat(getComputedStyle(e).fontSize); const sc = e.offsetHeight ? e.getBoundingClientRect().height / e.offsetHeight : 1; return [n, fs, fs * sc]; }), list);
  const hero = rows[0][2];
  console.log(`\n== ${w}x${h}   hero title ${hero.toFixed(1)}px`);
  rows.slice(1).forEach(([n, fs, seen]) => { const diff = seen - hero; if (Math.abs(diff) > 0.6) bad++; console.log(`  ${n.padEnd(28)} ${seen.toFixed(1).padStart(6)}px  ${Math.abs(diff) <= 0.6 ? 'matches' : (diff > 0 ? '+' : '') + diff.toFixed(1) + 'px'}`); });
  await p.close();
}
console.log(bad ? `\n${bad} titles differ from the hero` : '\nevery title matches the hero at every window');
await b.close();
