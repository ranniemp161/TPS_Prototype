// The testimonials' foot melting into the next section (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT, TAG = 'foot'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const y = await p.evaluate(() => document.querySelector('.act--voices').getBoundingClientRect().bottom + scrollY - innerHeight * .55);
  let at = 0; while (at + 200 < y) { await p.mouse.wheel(0, 200); at += 200; await p.waitForTimeout(80); }
  await p.waitForTimeout(1800);
  await p.screenshot({ path: path.join(OUT, `${TAG}-${w}.png`) });
  console.log(w, errs);
  await p.close();
}
await b.close();
