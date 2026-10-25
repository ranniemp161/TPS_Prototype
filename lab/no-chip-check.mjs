/* After a price change: the figure still counts (it passes through in-between
   values) and no "+ £" or "− £" text appears anywhere. node lab/no-chip-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
await p.evaluate(() => {
  window.__seen = new Set(); window.__signs = 0;
  const bar = document.querySelector('.dk-fee__amount');
  new MutationObserver(() => window.__seen.add(bar.textContent)).observe(bar, { childList: true, subtree: true, characterData: true });
  new MutationObserver(() => { if (/[+−]\s?£/.test(document.body.innerText)) window.__signs++; }).observe(document.body, { childList: true, subtree: true, characterData: true });
});
for (const sel of ['input[name="format"][value="out"]', 'input[name="format"][value="in"]', 'input[name="massage"]']) {
  await p.evaluate(s => { const i = document.querySelector(s); if (i.type === 'checkbox') i.checked = !i.checked; else i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); }, sel);
  await p.waitForTimeout(900);
}
const r = await p.evaluate(() => ({ values: [...window.__seen].length, signs: window.__signs, plusText: /[+−]\s?£/.test(document.body.innerText) }));
console.log(`the bar showed ${r.values} different figures while counting (more than 3 means it rolls) | plus or minus figure seen: ${r.signs > 0 || r.plusText ? 'YES' : 'no'} | errors`, JSON.stringify(errs));
await b.close();
