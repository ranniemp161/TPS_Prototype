import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const OUT = process.argv[2];
const from = +process.argv[3], to = +process.argv[4], n = +process.argv[5] || 6;
const W = +process.argv[6] || 1600, H = +process.argv[7] || 900;
mkdirSync(OUT, { recursive: true });
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
             'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(600);
for (let i = 0; i < n; i++) {
  const y = from + (to - from) * (n === 1 ? 0 : i / (n - 1));
  await p.evaluate(v => window.scrollTo(0, window.innerHeight * v), y);
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(OUT, String(i).padStart(2, '0') + '_' + y.toFixed(2) + 'vh.png') });
}
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await b.close();
