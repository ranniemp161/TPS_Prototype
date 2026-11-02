// Switches between the header dropdowns in every order (Opus, 1 Nov 2026):
// after each switch the panel must be its own fresh height, with equal space
// above the first link and below the last. node lab/dropdown-switch-check.mjs <out>
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
const NAMES = ['what-we-do', 'offerings', 'about'];
const read = n => {
  const m = document.querySelector('[data-menu]').getBoundingClientRect();
  const links = [...document.querySelectorAll(`#panel-${n} .menu__list a`)].map(a => a.getBoundingClientRect());
  return { h: Math.round(m.height), above: Math.round(links[0].top - m.top), below: Math.round(m.bottom - links[links.length - 1].bottom) };
};
let fails = 0;
for (const page of ['index.html', 'programmes.html', 'build-your-programme.html']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', page)).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  // fresh heights
  const fresh = {};
  for (const n of NAMES) {
    await p.locator(`.tab[data-tab="${n}"]`).click(); await p.waitForTimeout(800);
    fresh[n] = await p.evaluate(read, n);
    await p.keyboard.press('Escape'); await p.locator(`.tab[data-tab="${n}"]`).click({ trial: true }).catch(() => {});
    // close: click the open tab again
    if (await p.locator('[data-menu]').isVisible()) { await p.locator(`.tab[data-tab="${n}"]`).click(); }
    await p.waitForTimeout(700);
  }
  console.log(page, 'fresh', JSON.stringify(fresh));
  // every ordered switch
  for (const a of NAMES) for (const c of NAMES) {
    if (a === c) continue;
    await p.locator(`.tab[data-tab="${a}"]`).click(); await p.waitForTimeout(800);
    await p.locator(`.tab[data-tab="${c}"]`).click(); await p.waitForTimeout(800);
    const r = await p.evaluate(read, c);
    const ok = r.h === fresh[c].h && Math.abs(r.above - r.below) <= 1;
    if (!ok) fails++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${a} -> ${c}: h ${r.h} (fresh ${fresh[c].h}), above ${r.above}, below ${r.below}`);
    if (page === 'programmes.html' && a === 'offerings' && c === 'about') await p.screenshot({ path: path.join(OUT, 'switch-offerings-to-about.png'), clip: { x: 0, y: 0, width: 1440, height: 380 } });
    await p.locator(`.tab[data-tab="${c}"]`).click(); await p.waitForTimeout(700);
  }
  await p.close();
}
await b.close();
console.log(fails ? `${fails} FAILED` : 'all switches ok');
process.exit(fails ? 1 : 0);
