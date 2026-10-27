// Debug: the section's box and padding at the settled point, phone 390.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(pathToFileURL(path.join(ROOT, 'index/index.html')).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
await p.waitForTimeout(800);
for (let y = 12000; y < 22000; y += 200) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(40); if (await p.evaluate(() => +getComputedStyle(document.querySelector('.act--turn')).opacity > 0.99)) break; }
await p.waitForTimeout(2200);
console.log(JSON.stringify(await p.evaluate(() => {
  const a = document.querySelector('.act--turn'); const cs = getComputedStyle(a); const r = a.getBoundingClientRect();
  const st = document.querySelector('.act--turn .stage--split'); const sr = st.getBoundingClientRect(); const scs = getComputedStyle(st); const dbg = { mb: scs.marginBottom, mt: scs.marginTop, h: scs.height, maxH: scs.maxHeight, pos: scs.position, top: scs.top, bottom: scs.bottom, transform: scs.transform };
  return { actTop: Math.round(r.top), actH: Math.round(r.height), pb: cs.paddingBottom, pt: cs.paddingTop, minH: cs.minHeight, display: cs.display, stageBottom: Math.round(sr.bottom), stageFlex: scs.flex, stageH: Math.round(sr.height), parentPos: a.parentElement.className, dbg };
})));
await b.close();
