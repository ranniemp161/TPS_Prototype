// Page behind an open dropdown stays clear on desktop; a click outside still
// closes; the phone keeps its veil (Opus, 1 Nov 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
for (const page of ['index.html', 'programmes.html', 'build-your-programme.html']) {
  for (const [w, h, opener] of [[1440, 900, '.tab[data-tab="offerings"]'], [390, 844, '[data-burger]']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(path.join(process.cwd(), 'index', page)).href);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
    await p.locator(opener).click(); await p.waitForTimeout(800);
    const v = await p.evaluate(() => { const s = getComputedStyle(document.querySelector('[data-veil]')); return `${s.backgroundColor} | ${s.backdropFilter}`; });
    if (w === 1440 && page === 'programmes.html') await p.screenshot({ path: path.join(OUT, 'veil-clear-1440.png') });
    await p.mouse.click(w - 40, h - 120); await p.waitForTimeout(800);
    const closed = await p.locator('[data-menu]').isHidden();
    console.log(page.padEnd(26), w, 'veil:', v, '| click outside closes:', closed);
    await p.close();
  }
}
await b.close();
