// Scrolls the homepage to where the bath figures show, and shoots them (Opus, 28 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || os.tmpdir();
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
for (const w of [1440, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index', 'index.html')).href, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  let best = null;
  for (let y = 0; y < 30000; y += 150) {
    await p.mouse.wheel(0, 150); await p.waitForTimeout(60);
    const o = await p.evaluate(() => { const f = document.querySelector('[data-bath-figures]'); if (!f) return 0; const r = f.getBoundingClientRect(); const op = parseFloat(getComputedStyle(f).opacity); const n = document.querySelector('[data-bath-count="90"]').textContent; return (r.top > 0 && r.bottom < innerHeight && op > .95 && n === '90') ? 1 : 0; });
    if (o) { await p.waitForTimeout(1500); best = true; break; }
  }
  await p.screenshot({ path: path.join(OUT, `home-real-${w}.png`) });
  console.log(w, best ? 'found' : 'not found');
  await p.close();
}
await b.close();
