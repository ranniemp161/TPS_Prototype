/* What We Do fly through: the four sayings on the route, desktop and phone. node lab/wwd-sayings-shots.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  const sec = await p.evaluate(() => { const s = document.querySelector('.flight'); const r = s.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
  let i = 0;
  for (const f of [0.02, 0.15, 0.32, 0.5, 0.68, 0.8]) {
    await p.evaluate(y => scrollTo(0, y), Math.round(sec.top + f * sec.h)); await p.waitForTimeout(1800);
    const r = await p.evaluate(() => {
      const cur = document.querySelector('.route__stop.is-current');
      const n = document.querySelectorAll('.route__stop').length;
      const born = document.querySelectorAll('.route__stop.is-born').length;
      if (!cur) return 'stops ' + n + ' born ' + born + ' current none';
      const m = cur.querySelector('.route__mask').getBoundingClientRect();
      return 'stops ' + n + ' born ' + born + ' current ' + cur.dataset.stop + ' "' + cur.querySelector('.route__in').textContent + '" at ' + Math.round(m.left) + '..' + Math.round(m.right) + ' y ' + Math.round(m.top);
    });
    console.log(w, f, r);
    await p.screenshot({ path: `${out}/say-${w}-${i++}.png` });
  }
  console.log(w, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
