/* Every screen of Build Your Programme at one width, picking a due date so Next
   can pass the due screen. node lab/bespoke-walk.mjs <outdir> [width] [height] */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { passPostcode } from './pc-pass.mjs';
const [out, w = '1440', h = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1800);
await passPostcode(p);
for (let i = 0; i < 14; i++) {
  const name = await p.evaluate(() => document.querySelector('[data-step-name]')?.textContent.trim());
  await p.screenshot({ path: `${out}/w${w}-${String(i).padStart(2, '0')}.png` });
  console.log(i, name);
  if (/Due date/.test(name) && await p.evaluate(() => !document.querySelector('#due').value)) {
    const day = await p.$('[data-due-grid] button:not([disabled])');
    if (day && await day.isVisible()) { await day.click(); await p.waitForTimeout(400); }
    const kid = await p.$('label:has(#dkd-child-1)');
    if (kid && await kid.isVisible()) { await kid.click(); await p.waitForTimeout(300); }
  }
  const next = await p.$('.dk-next');
  if (!next || !(await next.isEnabled()) || /Your programme$/.test(name)) break;
  await next.click(); await p.waitForTimeout(1100);
}
console.log('errors', JSON.stringify(errs));
await b.close();
