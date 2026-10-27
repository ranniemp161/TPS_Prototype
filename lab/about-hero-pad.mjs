// About hero on a 390 phone: computed padding of the section and its inner box.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(path.join(ROOT, 'index/about.html')).href, { waitUntil: 'load' });
console.log(JSON.stringify(await p.evaluate(() => {
  const s = getComputedStyle(document.querySelector('.os-open')); const i = getComputedStyle(document.querySelector('.os-open__in'));
  const m = document.querySelector('main') ? getComputedStyle(document.querySelector('main')) : null;
  return { secPad: s.padding, inPad: i.padding, inMargin: i.margin, mainPad: m && m.padding, secLeft: Math.round(document.querySelector('.os-open').getBoundingClientRect().left) };
})));
await b.close();
