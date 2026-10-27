/* Footer in sage: screenshot the footer on two pages at both widths and sample
   the ground behind the text for contrast. node lab/footer-sage-check.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) for (const pg of ['who-comes-into-your-home', 'faqs']) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(pathToFileURL(process.cwd() + `/index/${pg}.html`).href, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(1500);
  const f = await p.$('footer.sf');
  await f.screenshot({ path: `${out}/foot-${pg}-${w}.png` });
  console.log(pg, w, 'errors', JSON.stringify(errs));
  await p.close();
}
await b.close();
