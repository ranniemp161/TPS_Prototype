/* Drive the new arrows: forward, forward, then back twice, checking the
   counter and the progress bar every step. Also confirms the old behaviour
   is gone: clicking the block does nothing and there is no custom cursor.
     node lab/tvbuttons.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(String(e)));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href, { waitUntil: 'load' });
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
await p.evaluate(() => { document.documentElement.style.scrollBehavior='auto';
  const a=document.querySelector('.act--voices');
  window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY); });
await p.waitForTimeout(1200);

const state = () => p.evaluate(() => ({
  idx: document.querySelector('[data-tv2-now]').textContent,
  fill: document.querySelector('[data-tv2-fill]').style.width,
  quote: document.querySelector('[data-tv2-quote]').textContent.slice(0, 28),
  cursorGone: !document.querySelector('[data-tv2-cursor]'),
  hintGone: !document.querySelector('.tv2__hint'),
  notAButton: !document.querySelector('.tv2').hasAttribute('role'),
  cursorStyle: getComputedStyle(document.querySelector('.tv2')).cursor
}));

console.log('start        ', JSON.stringify(await state()));
// clicking the block itself must now do nothing
await p.mouse.click(800, 470);
await p.waitForTimeout(600);
console.log('after body click', (await state()).idx, '(must still be 01)');

for (const [label, sel] of [['next', '[data-tv2-next]'], ['next', '[data-tv2-next]'],
                            ['prev', '[data-tv2-prev]'], ['prev', '[data-tv2-prev]'],
                            ['prev', '[data-tv2-prev]']]) {
  await p.click(sel);
  await p.waitForTimeout(700);
  const st = await state();
  console.log(`${label.padEnd(5)} -> ${st.idx}  bar ${st.fill.padStart(7)}  "${st.quote}..."`);
}
const fin = await state();
console.log('\ncustom cursor removed:', fin.cursorGone, '| hint removed:', fin.hintGone,
            '| block no longer a button:', fin.notAButton, '| cursor style:', fin.cursorStyle);
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await b.close();
