// What Is Confinement on Home: the act's top at the window's top (21 Oct 2026).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'url';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const errs = [];
for (const [w, h] of [[1440, 900], [390, 844], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(w + ' ' + e.message));
  await p.goto(pathToFileURL(process.cwd() + '/index/index.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  await p.mouse.move(w / 2, h / 2);
  for (let i = 0; i < 800; i++) {
    const d = await p.evaluate(() => document.querySelector('.act--turn').getBoundingClientRect().top);
    if (Math.abs(d) < 20) break;
    await p.mouse.wheel(0, Math.sign(d) * Math.min(200, Math.abs(d))); await p.waitForTimeout(40);
  }
  await p.evaluate(() => window.scrollBy(0, document.querySelector('.act--turn').getBoundingClientRect().top)); await p.waitForTimeout(2500);
  const m = await p.evaluate(() => {
    const q = s => document.querySelector(s).getBoundingClientRect();
    const f = s => { const c = getComputedStyle(document.querySelector(s)); return c.fontSize + ' ' + c.color; };
    return { act: Math.round(q('.act--turn').top), stageBottom: Math.round(q('.act--turn > .stage').bottom), voicesTop: Math.round(q('.tv2').top), vh: innerHeight,
      sizes: [f('.turn__standfirst'), f('.act--turn .stage__side .body'), f('.turn__trail')] };
  });
  console.log(w, JSON.stringify(m));
  await p.screenshot({ path: out + `turn-${w}.png` });
  await ctx.close();
}
console.log('ERRORS', JSON.stringify(errs));
await b.close();
