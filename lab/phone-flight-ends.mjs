// Phone house film: screenshots at given scroll positions (the smoke clearing and the window exit).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const ys = process.argv.slice(3).map(Number);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(800);
for (let y = 0; y <= Math.max(...ys); y += 300) {
  await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(30);
  if (ys.includes(y)) { await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, `pends-${y}.png`) }); }
}
console.log(errors.length ? errors : 'no errors');
await b.close();
