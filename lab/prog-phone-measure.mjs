// Phone programmes section: heading block and picker, with the heading placed 24px under the header.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2];
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
for (const [w, h] of [[390, 844], [360, 780]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.waitForTimeout(800);
  const y = await p.evaluate(() => document.querySelector('#programmes .sec-head').getBoundingClientRect().top + scrollY);
  for (let s = y - 2500; s <= y - 104; s += 250) { await p.evaluate(v => scrollTo(0, v), s); await p.waitForTimeout(40); }
  await p.evaluate(v => scrollTo(0, v), y - 104);
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const R = s => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; };
    const thumbs = [...document.querySelectorAll('.gal__thumb')].map(t => { const r = t.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; });
    return { head: R('#programmes .sec-head h2'), script: R('#programmes .sec-head .script'), intro: R('#programmes .sec-head .body'), thumbsY: R('.gal__list'), thumbs, title: R('.gal__heading'), body: R('.gal__body'), frame: R('.gal__media'), bottomGap: Math.round(innerHeight - document.querySelector('.gal__media').getBoundingClientRect().bottom), overflow: document.documentElement.scrollWidth > innerWidth };
  });
  await p.screenshot({ path: path.join(OUT, `prog-${w}.png`) });
  console.log(w, h, JSON.stringify(m), errors.length ? errors : 'no errors');
  for (let k = 1; k < 4; k++) {
    await p.locator('.gal__thumb').nth(k).click(); await p.waitForTimeout(1600);
    const r = await p.evaluate(() => { const b = document.querySelector('.gal__body').getBoundingClientRect(); const f = document.querySelector('.gal__media').getBoundingClientRect(); return { title: document.querySelector('.gal__heading').textContent, bodyH: Math.round(b.height), frameTop: Math.round(f.top), bottomGap: Math.round(innerHeight - f.bottom) }; });
    console.log('  ', JSON.stringify(r));
    await p.screenshot({ path: path.join(OUT, `prog-${w}-len${k + 1}.png`) });
  }
  await p.close();
}
await b.close();
