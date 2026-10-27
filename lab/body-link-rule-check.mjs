// Home body links: each .text-link's colour against its sentence, its underline, and the hover colour.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const n = await p.evaluate(() => document.querySelectorAll('.text-link, .cta-link').length);
for (let i = 0; i < n; i++) {
  const a = p.locator('.text-link, .cta-link').nth(i);
  await a.scrollIntoViewIfNeeded().catch(() => {});
  const rest = await a.evaluate(el => ({ text: el.textContent, href: el.getAttribute('href'), link: getComputedStyle(el).color, sentence: getComputedStyle(el.parentElement).color, underline: getComputedStyle(el).textDecorationLine, kind: el.className }));
  await a.evaluate(el => el.focus());
  await p.waitForTimeout(300);
  const focus = await a.evaluate(el => getComputedStyle(el).color);
  console.log(JSON.stringify({ ...rest, hoverFocus: focus }));
}
console.log('errors', errors.length ? errors : 'none');
await b.close();
