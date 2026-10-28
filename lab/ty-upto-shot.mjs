// Shoots What We Do's tailored counter panel (Opus, 28 Oct 2026).
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
  await p.goto(pathToFileURL(path.join(ROOT, 'index', 'what-we-do.html')).href, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  for (let y = 0; y < 40000; y += 150) {
    await p.mouse.wheel(0, 150); await p.waitForTimeout(50);
    const ok = await p.evaluate(() => { const e = document.querySelector('.ty__out'); const r = e.getBoundingClientRect(); let o = 1, n = e; while (n && n !== document.body) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } return r.top > 60 && r.bottom < innerHeight - 10 && o > .95; });
    if (ok) break;
  }
  await p.waitForTimeout(1500);
  await p.locator('.ty__stay').screenshot({ path: path.join(OUT, `ty-${w}.png`) });
  await p.close();
}
await b.close();
