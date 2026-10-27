// Quick look at the finalists (Opus, 26 Oct 2026): viewport shots of a few pages per palette.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'lab', 'shots', 'palette', 'finalists'); mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
const pages = [['index', 0], ['index', 2600], ['programmes', 0], ['programmes', 1400], ['single-treatments', 900]];
for (const pal of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [pg, y] of pages) {
    await p.goto(pathToFileURL(path.join(ROOT, 'index', pg + '.html')).href + '?palette=' + pal, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.mouse.wheel(0, y); await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, `${pal}-${pg}-${y}.png`) });
  }
  await p.close();
}
await b.close(); console.log('done', OUT);
