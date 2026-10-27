// Phone: the Treatments picture in the Four Kinds of Care section, mid zoom.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/what-we-do.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.mouse.move(195, 422);
const top = () => p.evaluate(() => document.querySelector('img[src*="hands-plate-massage"]').getBoundingClientRect().top);
for (let i = 0; i < 1500 && (await top()) > 300; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(20); }
await p.waitForTimeout(1200);
const s = await p.evaluate(() => { const i = document.querySelector('img[src*="hands-plate-massage"]'); return { tf: getComputedStyle(i).transform, loaded: i.complete && i.naturalWidth > 0 }; });
await p.screenshot({ path: path.join(OUT, 'hands-390-treat.png') });
console.log(JSON.stringify(s), errors.length ? errors : 'no errors');
await b.close();
