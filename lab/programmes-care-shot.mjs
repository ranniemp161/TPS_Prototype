// Shoots the end of Four kinds of care on Programmes (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const OUT = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'programmes.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const y = await p.evaluate(() => { const l = [...document.querySelectorAll('.pg-kind__list')].pop(); return l.getBoundingClientRect().bottom + scrollY; });
  for (let s = 0; s < y - h / 2; s += 400) { await p.mouse.wheel(0, 400); await p.waitForTimeout(120); }
  await p.waitForTimeout(1200);
  console.log(w, 'note present:', await p.evaluate(() => !!document.querySelector('.pg-same__note')), errs);
  await p.screenshot({ path: path.join(OUT, `care-end-${w}.png`) });
  await p.close();
}
await b.close();
