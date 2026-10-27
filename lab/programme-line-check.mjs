// The home programmes picker line: screenshots and tip alignment at 1440
// and 390, at rest and after choosing 30 days and 7 days. Real wheel from
// scroll zero, fonts resolved.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'lab');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const measure = p => p.evaluate(() => {
  const tip = document.querySelector('.gal-line__tip').getBoundingClientRect();
  const on = document.querySelector('.gal__thumb.is-active').getBoundingClientRect();
  const wide = innerWidth >= 1000;
  const off = wide ? (tip.top + tip.height / 2) - (on.top + on.height / 2)
                   : (tip.left + tip.width / 2) - (on.left + on.width / 2);
  const reached = [...document.querySelectorAll('.gal-line__dot')].map(d => d.classList.contains('is-reached') ? 1 : 0).join('');
  return { off: +off.toFixed(2), reached, overflow: document.documentElement.scrollWidth > innerWidth };
});
const errors = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1200);
  await p.mouse.move(w / 2, h / 2);
  for (let i = 0; i < 400; i++) {
    const top = await p.evaluate(() => document.querySelector('#programmes .gal').getBoundingClientRect().top);
    if (top < (w > 999 ? 160 : 120)) break;
    await p.mouse.wheel(0, 120);
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(1500);
  console.log(w, 'rest', JSON.stringify(await measure(p)));
  await p.screenshot({ path: path.join(OUT, `pline-${w}-rest.png`) });
  const thumbs = p.locator('.gal__thumb');
  await thumbs.nth(3).click(); await p.waitForTimeout(1500);
  console.log(w, '30 days', JSON.stringify(await measure(p)));
  await p.screenshot({ path: path.join(OUT, `pline-${w}-30.png`) });
  await p.locator('.gal-line__dot').nth(1).click({ force: true }); await p.waitForTimeout(1500);
  console.log(w, 'dot to 7', JSON.stringify(await measure(p)));
  await p.mouse.wheel(0, w > 999 ? 420 : 700); await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, `pline-${w}-out.png`) });
  await p.close();
}
console.log('errors', errors.length ? errors : 'none');
await b.close();
