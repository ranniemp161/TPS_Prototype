// Measures the Programmes intro paragraph: lines and height per width (Opus, 28 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
for (const [w, h] of [[1920,1080],[1440,900],[1280,720],[1024,768],[860,1000],[390,844],[360,740]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, 'index', 'programmes.html')).href, { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  const r = await p.evaluate(() => { const e = document.querySelector('.pg-look__p'); const cs = getComputedStyle(e); const lh = parseFloat(cs.lineHeight); const bb = e.getBoundingClientRect(); return { lines: Math.round(bb.height / lh), h: Math.round(bb.height), w: Math.round(bb.width), fs: cs.fontSize, section: Math.round(document.querySelector('.pg-look').getBoundingClientRect().height) }; });
  console.log(w + 'x' + h, JSON.stringify(r));
  await p.close();
}
await b.close();
