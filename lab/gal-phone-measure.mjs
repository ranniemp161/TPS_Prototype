// Phone length picker: thumbs row, copy and big frame boxes, with the picker scrolled to sit under the header.
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
  const y = await p.evaluate(() => document.querySelector('#programmes .gal').getBoundingClientRect().top + scrollY);
  for (let s = y - 2000; s <= y - 96; s += 250) { await p.evaluate(v => scrollTo(0, v), s); await p.waitForTimeout(40); }
  await p.evaluate(v => scrollTo(0, v), y - 96);
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const R = s => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; };
    const thumbs = [...document.querySelectorAll('.gal__thumb')].map(t => { const r = t.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.height)]; });
    return { gal: R('#programmes .gal'), list: R('.gal__list'), thumbs, title: R('.gal__heading'), body: R('.gal__body'), frame: R('.gal__media'), screen: [innerWidth, innerHeight], overflow: document.documentElement.scrollWidth > innerWidth };
  });
  await p.screenshot({ path: path.join(OUT, `gal-${w}.png`) });
  console.log(w, JSON.stringify(m), errors.length ? errors : 'no errors');
  await p.close();
}
await b.close();
