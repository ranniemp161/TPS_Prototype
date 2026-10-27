/* node lab/page-shots.mjs <page.html> <outdir> <tag> : 1440 full page and 390 full page */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [page, out, tag] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/' + page).href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.addStyleTag({ content: '.rise{opacity:1!important;transform:none!important}' });
  await p.screenshot({ path: `${out}/${tag}-${w}.png`, fullPage: true });
  await p.close();
}
await b.close();
