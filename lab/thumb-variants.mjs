// Trial only: fade strengths for the thumbnail numbers (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const variants = {
  v80: '.gal__thumb img { opacity: .8; filter: saturate(.55); }',
  v70: '.gal__thumb img { opacity: .7; filter: saturate(.35); }',
  v60: '.gal__thumb img { opacity: .6; filter: saturate(.2); }',
  dim80: '.gal__thumb img { opacity: 1; filter: brightness(.8) saturate(.55); }',
  dim70: '.gal__thumb img { opacity: 1; filter: brightness(.7) saturate(.45); }',
};
const b = await chromium.launch({ channel: 'chrome' });
for (const [k, css] of Object.entries(variants)) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'index.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('.gal__list').scrollIntoView({ block: 'center' }));
  await p.addStyleTag({ content: css + ' .gal__thumb.is-active img { opacity: 1; filter: none; }' });
  await p.waitForTimeout(2000);
  await p.locator('.gal__list').screenshot({ path: path.join(OUT, `thumbvar-${k}.png`) });
  await p.close();
}
await b.close();
