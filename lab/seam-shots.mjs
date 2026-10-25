/* A window-height shot centred on the join above each named section.
   node lab/seam-shots.mjs <file.html> <outdir> <width> <height> <selector...> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const [file, out, w, h, ...sels] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(file).href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
for (const s of sels) {
  const y = await p.evaluate(s => document.querySelector(s).getBoundingClientRect().top + scrollY, s);
  // Scroll in steps so scroll driven scenes above settle.
  for (let t = 0; t <= y - h / 2; t += 600) { await p.evaluate(t => scrollTo(0, t), t); await p.waitForTimeout(60); }
  await p.evaluate(t => scrollTo(0, t), Math.max(0, y - h / 2)); await p.waitForTimeout(1600);
  const name = s.replace(/[^a-z]/gi, '');
  await p.screenshot({ path: `${out}/seam-${name}-${w}.png` });
}
await b.close();
