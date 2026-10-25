/* Batch 5 screens: Day or night and Recovery treatments with Recommended showing, and Your programme.
   node lab/b5-shots.mjs <outdir> [w] [h] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await passPostcode(p);
await p.evaluate(() => { for (const n of ['p-sleep', 'p-recovery']) { const i = document.querySelector(`input[name="${n}"]`); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); } });
const name = () => p.evaluate(() => document.querySelector('[data-step-name]').textContent.trim());
for (let i = 0; i < 10; i++) {
  const n = await name();
  if (/Day or night|Recovery treatments|Your programme/.test(n)) await p.screenshot({ path: `${out}/${n.replace(/[^a-z]/gi, '')}-${w}.png` });
  if (/Your programme/.test(n)) break;
  if (/Due date/.test(n) && await p.evaluate(() => !document.querySelector('#due').value)) {
    const d = await p.$('[data-due-grid] button.due-day'); if (d && await d.isVisible()) await d.click();
    const k = await p.$('label:has(#dkd-child-2)'); if (k && await k.isVisible()) await k.click();
  }
  await p.click('.dk-next', { force: true }); await p.waitForTimeout(1200);
}
await b.close();
