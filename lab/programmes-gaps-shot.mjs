// Shoots the three tightened gaps on Programmes desktop (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const OUT = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'programmes.html')).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
const t = await p.evaluate(() => {
  const sec = document.querySelector('.pg-compare'); const last = sec.querySelector('.pg-wrap').lastElementChild;
  const ready = document.querySelector('.pg-cta__script');
  return { tableToReady: Math.round(ready.getBoundingClientRect().top - last.getBoundingClientRect().bottom), lastEl: last.className,
    ys: ['.pg-same', '.pg-compare', '.pg-cta'].map(s => document.querySelector(s).getBoundingClientRect().top + scrollY) };
});
console.log(JSON.stringify(t), errs);
let at = 0;
for (const [i, y] of t.ys.entries()) {
  const target = y - 450;
  while (at < target) { await p.mouse.wheel(0, 300); at += 300; await p.waitForTimeout(100); }
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, `gaps-${i}.png`) });
}
await b.close();
