// Trial only, no file change: the About lede's bold phrase at the lede's own
// weight, in the accent colour (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [OUT] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'about.html')).href);
  await p.addStyleTag({ content: '.os-open__lede strong { font-weight: inherit; color: var(--acc); }' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  console.log(w, await p.evaluate(() => { const s = getComputedStyle(document.querySelector('.os-open__lede strong')); return s.fontWeight + ' ' + s.color; }));
  await p.screenshot({ path: path.join(OUT, `about-lede-accent-${w}.png`) });
  await p.close();
}
await b.close();
