// Home body links to inner pages: lists each .text-link with its target and colour,
// confirms the target file exists, and screenshots the confinement and care rail links at 1440.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || path.join(ROOT, 'lab');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const links = await p.evaluate(() => [...document.querySelectorAll('main .text-link, .text-link')].map(a => ({ text: a.textContent, href: a.getAttribute('href'), colour: getComputedStyle(a).color })));
for (const l of links) console.log(JSON.stringify({ ...l, exists: existsSync(path.join(ROOT, 'index', l.href)) }));
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.mouse.move(720, 450);
const shoot = async (sel, name) => {
  for (let i = 0; i < 900; i++) {
    const ok = await p.evaluate(s => {
      const el = document.querySelector(s); const r = el.getBoundingClientRect();
      let o = 1, n = el; while (n && n !== document.body) { o *= +getComputedStyle(n).opacity; n = n.parentElement; }
      return r.top > 120 && r.bottom < innerHeight - 40 && o > 0.95;
    }, sel);
    if (ok) break;
    await p.mouse.wheel(0, 120); await p.waitForTimeout(40);
  }
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, name) });
};
await shoot('a[href="what-we-do.html"].text-link', 'seo-confinement.png');
await shoot('a[href="who-comes-into-your-home.html"].text-link', 'seo-rail.png');
console.log('errors', errors.length ? errors : 'none');
await b.close();
