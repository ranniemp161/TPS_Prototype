// However long you need with us: the 7, 14, 30 days stops (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT, TAG = 'now'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const y = await p.evaluate(() => document.querySelector('.act--programmes').getBoundingClientRect().top + scrollY + 300);
  let at = 0; while (at < y) { await p.mouse.wheel(0, 400); at += 400; await p.waitForTimeout(80); }
  await p.waitForTimeout(1500);
  console.log(w, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.act--programmes .tv2__stop')].map(e => { const c = getComputedStyle(e); return [e.textContent.trim(), c.color, c.opacity, c.fontWeight, c.fontSize, e.getAttribute('aria-current')]; }))));
  await p.screenshot({ path: path.join(OUT, `${TAG}-lengths-${w}.png`) });
  await p.close();
}
await b.close();
