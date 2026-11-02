// Footer contact column and About's contact list with the phone number
// (Opus, 1 Nov 2026), at 1440 and 390.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
const SHOTS = [
  ['programmes.html', '.sf__col:has(a[href^="tel:"])', 'footer'],
  ['about.html', 'dl:has(a[href^="tel:"])', 'about'],
];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  for (const [page, sel, name] of SHOTS) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(pathToFileURL(path.join(process.cwd(), 'index', page)).href);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
    const el = p.locator(sel).first();
    // real wheel to the element so reveal animations run
    for (let y = 0; y < 60000; y += 300) {
      await p.mouse.wheel(0, 300); await p.waitForTimeout(25);
      const ok = await el.evaluate(n => { const r = n.getBoundingClientRect(); return r.top > 0 && r.bottom < innerHeight; });
      if (ok) break;
    }
    await p.waitForTimeout(1500);
    const box = await el.boundingBox();
    const pad = 30;
    await p.screenshot({ path: path.join(OUT, `phone-${name}-${w}.png`), clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: Math.min(w - Math.max(0, box.x - pad), box.width + pad * 2), height: box.height + pad * 2 } });
    const href = await p.locator('a[href^="tel:"]').first().getAttribute('href');
    console.log(name, w, 'tel link:', href);
    await p.close();
  }
}
await b.close();
