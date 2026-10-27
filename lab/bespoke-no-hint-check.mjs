/* Bespoke, "Choose one" hints removed (24 Oct 2026).
   node lab/bespoke-no-hint-check.mjs <outdir>
   At 1440x900 and 390x844: prints the first row's top border per option group, so
   the rows can be compared with how they looked when the hint sat above them, and
   screenshots each step that lost a hint (live-in, day and night, meals, rhythm,
   what matters most). */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
const groups = ['Live-in, or daytime', 'Daytime, or day and night', 'Meals', 'Massage rhythm', 'What matters most to you'];

for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 800 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url, { timeout: 60000 });
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.tgl[role]')].map(g => {
    const first = g.querySelector('.tg');
    return g.getAttribute('aria-label') + ': hint ' + !!g.querySelector('.tgl__hint') + ', first row top border ' + (first ? getComputedStyle(first).borderTopWidth : 'none');
  }));
  console.log('--- ' + w + 'x' + h); rows.forEach(r => console.log(r));
  for (const [i, label] of groups.entries()) {
    const step = p.locator(`.tgl[aria-label="${label}"]`).locator('xpath=ancestor::fieldset[1]');
    await step.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    await step.screenshot({ path: `${out}/${w}-${i + 1}.png` });
  }
  console.log(errs.length ? 'ERRORS ' + errs.join(' | ') : 'no page errors');
  await p.close();
}
await b.close();
