import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL(path.join(ROOT, 'v1-ruined.html')).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(500);
const r = await p.evaluate(() => {
  const g = (label, sel) => { const e = document.querySelector(sel); if (!e) return null;
    const c = getComputedStyle(e);
    return [label, Math.round(parseFloat(c.fontSize)), c.fontFamily.split(',')[0].replace(/"/g,''), c.fontWeight]; };
  return [
    g('section title', '.tv2__title'), g('script line', '.tv2__script'),
    g('the quote', '.tv2__quote'), g('author name', '.tv2__name'),
    g('counter', '.tv2__now'),
    g('page: hero headline', '.act--hero .display'),
    g('page: hero script', '.act--hero .script'),
    g('page: section heading', '.act--pan .display'),
    g('page: narrative line', '.act--rest .say'),
    g('page: eyebrow', '.eyebrow'), g('page: body', '.act--treatment .body')
  ].filter(Boolean);
});
for (const [l, s, f, w] of r) console.log(`  ${l.padEnd(22)} ${String(s).padStart(3)}px  ${f} ${w}`);
await b.close();
