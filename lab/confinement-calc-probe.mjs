// Probe: which height expression the phone stage accepts at 390x844.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => {
  const st = document.querySelector('.act--turn .stage--split');
  const out = {};
  out.gutter = getComputedStyle(document.documentElement).getPropertyValue('--gutter');
  out.specified = getComputedStyle(st).height; out.minH = getComputedStyle(st).minHeight; out.flex = getComputedStyle(st).flex; out.boxSizing = getComputedStyle(st).boxSizing; out.pad = getComputedStyle(st).padding; out.rows = getComputedStyle(st).gridTemplateRows; out.parentH = getComputedStyle(st.parentElement).height;
  const tests = { a: 'calc(100svh - clamp(84px, 13vh, 160px) - var(--gutter))', b: 'calc(100svh - 134px)', c: 'calc(100svh - 110px - 24px)' };
  for (const k in tests) { st.style.height = tests[k]; out[k] = getComputedStyle(st).height; }
  st.style.height = '';
  return out;
})));
await b.close();
