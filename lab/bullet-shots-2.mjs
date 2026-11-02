// Wider bullet shots (Opus, 1 Nov 2026): the home care band with margin,
// and the builder's last screen list, lifted into view (the deck gates its
// last screen behind a sent form, so the list is cloned onto the screen
// with its own classes rather than walked to).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
for (const pal of ['coral', 'cognac']) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    let p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href + `?palette=${pal}`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
    // real wheel down to the care band
    for (let y = 0; y < 40000; y += 160) {
      await p.mouse.wheel(0, 160); await p.waitForTimeout(35);
      const ok = await p.evaluate(() => { const l = document.querySelector('.care__list'); if (!l) return true; const r = l.getBoundingClientRect(); return r.top > 60 && r.bottom < innerHeight - 20 && r.width > 0; });
      if (ok) break;
    }
    await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const r = document.querySelector('.care__list').closest('article, li, div').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    const pad = 24;
    await p.screenshot({ path: path.join(OUT, `b2-${pal}-${w}-home.png`), clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: Math.min(w - Math.max(0, r.x - pad), r.width + pad * 2), height: Math.min(h, r.height + pad * 2) } });
    await p.close();

    p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'build-your-programme.html')).href + `?palette=${pal}`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
    await p.evaluate(() => {
      const src = document.querySelector('.dk-sum--close');
      const box = document.createElement('div');
      box.className = 'dk';
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:var(--g-canvas);padding:60px 24px;';
      const inner = src.cloneNode(true); inner.querySelector('form')?.remove();
      box.appendChild(inner); document.body.appendChild(box); box.querySelectorAll('*').forEach(n => { n.style.opacity = '1'; n.style.transform = 'none'; n.style.visibility = 'visible'; });
    });
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, `b2-${pal}-${w}-close.png`), clip: { x: 0, y: 0, width: w, height: 520 } });
    await p.close();
  }
}
await b.close();
console.log('done');
