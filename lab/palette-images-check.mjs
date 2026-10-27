// Checks the dusty teal image swap on the homepage (Opus, 26 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'lab', 'shots', 'palette', 'dustyteal-images'); mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const url = pathToFileURL(path.join(ROOT, 'index', 'index.html')).href;
await p.goto(url + '?palette=dustyteal', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
const state = () => p.evaluate(() => [...document.querySelectorAll('img')].map(i => i.getAttribute('src')).filter(s => /assets\/img\//.test(s)));
const s1 = await state();
console.log('teal swapped:', s1.filter(s => s.includes('/dustyteal/')).length, 'of', s1.length);
let h = await p.evaluate(() => document.documentElement.scrollHeight);
for (const y of [0, 0.12, 0.25, 0.4, 0.55, 0.7, 0.85]) { await p.evaluate(v => window.scrollTo(0, v), Math.round(h * y)); await p.waitForTimeout(1200); await p.screenshot({ path: path.join(OUT, `teal-${y}.png`) }); }
const broken = await p.evaluate(() => [...document.querySelectorAll('img')].filter(i => /dustyteal/.test(i.src) && i.complete && !i.naturalWidth).map(i => i.src));
console.log('broken teal images:', broken.length, broken.join(' '));
await p.evaluate(() => document.documentElement.setAttribute('data-palette', 'coral'));
await p.waitForTimeout(300);
const s2 = await state();
console.log('after coral, teal paths left:', s2.filter(s => s.includes('/dustyteal/')).length);
await p.evaluate(() => document.documentElement.setAttribute('data-palette', 'dustyteal'));
await p.waitForTimeout(300);
console.log('back to teal:', (await state()).filter(s => s.includes('/dustyteal/')).length);
await p.evaluate(() => { try { localStorage.removeItem('tps-palette'); } catch (e) {} });
await b.close();
