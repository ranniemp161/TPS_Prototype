/* Build Your Programme at 1440x900: every page of the deck, for looking at. node lab/bespoke-look.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
for (let i = 0; i < 9; i++) {
  await p.screenshot({ path: `${out}/b-${i}.png` });
  const next = await p.$('[data-dk-next], .dk-next, button:has-text("Next"), button:has-text("Begin"), button:has-text("See my programme")');
  if (!next) break;
  await next.click(); await p.waitForTimeout(900);
}
await b.close();
