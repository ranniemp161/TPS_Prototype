/* Programmes: full page at 1440 and 390, plus the CTA. node lab/programmes-full-shots.mjs <outdir> <tag> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [out, tag = 'x'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/${tag}-full${w}.png`, fullPage: true });
  await p.locator('.pg-cta').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await p.locator('.pg-cta').screenshot({ path: `${out}/${tag}-cta${w}.png` });
  console.log(w, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
