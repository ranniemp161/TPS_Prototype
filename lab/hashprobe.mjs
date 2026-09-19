import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = process.argv[2] || 'v1-ruined.html';
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const log = [];
p.on('console', m => log.push(m.type() + ': ' + m.text()));
p.on('pageerror', e => log.push('PAGEERROR: ' + e.message));
await p.goto(pathToFileURL(path.join(ROOT, FILE)).href + '#programmes', { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.waitForTimeout(1500);
const read = tag => p.evaluate(t => {
  const st = document.querySelector('.act--hero .stage');
  const r = st.getBoundingClientRect();
  const pin = ScrollTrigger.getAll().find(s => s.pin === st || (s.pin && s.pin === st));
  return { tag: t, y: Math.round(window.scrollY), top: Math.round(r.top),
           pos: getComputedStyle(st).position, trig: ScrollTrigger.getAll().length,
           heroPin: !!pin, pinStart: pin ? Math.round(pin.start) : null,
           pinEnd: pin ? Math.round(pin.end) : null,
           spacer: !!document.querySelector('.pin-spacer'),
           docH: Math.round(document.documentElement.scrollHeight) };
}, tag);
console.log(FILE);
console.log('  after hash load  ', JSON.stringify(await read('a')));
await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0); });
await p.waitForTimeout(3000);
console.log('  back at top      ', JSON.stringify(await read('b')));
await p.evaluate(() => ScrollTrigger.refresh());
await p.waitForTimeout(1500);
console.log('  after a refresh  ', JSON.stringify(await read('c')));
console.log('  console:', log.length ? log.join(' | ') : 'clean');
await b.close();
