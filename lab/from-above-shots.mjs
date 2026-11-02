// "From" above the price everywhere, and How long without sub labels (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { passPostcode } from './pc-pass.mjs';
const OUT = process.argv[2];
const url = f => pathToFileURL(path.join(process.cwd(), 'index', f)).href;
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url('programmes.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const shoot = async (sel, name, pad = 20) => { const r = await p.locator(sel).first().boundingBox(); await p.screenshot({ path: path.join(OUT, `${name}-${w}.png`), clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: Math.min(w, r.width + pad * 2), height: r.height + pad * 2 } }); };
  await shoot('[data-pg-card] .pg-price', 'from-hero');
  await p.locator('.pg-pricing__list').scrollIntoViewIfNeeded(); await p.waitForTimeout(1200);
  await shoot('.pg-pricing__list', 'from-list');
  console.log(w, 'programmes errs', errs);
  // Bespoke: walk to How long
  await p.goto(url('build-your-programme.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await passPostcode(p); await p.click('.dk-next'); await p.waitForTimeout(1300);
  await p.click('[data-due-grid] button:not([disabled]) >> nth=20'); await p.waitForTimeout(300);
  await p.click('label:has(#dkd-child-1)'); await p.waitForTimeout(300);
  await p.click('.dk-next'); await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, `howlong-${w}.png`) });
  console.log(w, 'subs left', await p.locator('.length__sub').count(), 'errs', errs);
  await p.close();
}
await b.close();
