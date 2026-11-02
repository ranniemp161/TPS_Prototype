// Price snaps (TJ, 1 Nov 2026; Opus): change a choice in the builder and read
// the bar and Your programme prices every frame for 900ms. Pass if the only
// values ever shown are the old price and the new one, and no underline draws.
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
let fails = 0;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'build-your-programme.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  for (const [label, sel] of [['to night', 'input[name="shift"][value="night"]'], ['back to day', 'input[name="shift"][value="day"]'], ['to 14 days', 'input[name="days"][value="14"]'], ['to live-out', 'input[name="format"][value="out"]']]) {
    const seen = await p.evaluate(async s => {
      const bar = document.querySelector('.dk-fee__amount'), sum = document.querySelector('.dk-decide .dk-sumfee');
      const vals = new Set([bar.textContent + ' / ' + sum.textContent]);
      let drew = false;
      const i = document.querySelector(s); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true }));
      const t0 = performance.now();
      await new Promise(res => (function f() {
        vals.add(bar.textContent + ' / ' + sum.textContent);
        if (bar.classList.contains('is-counting') || sum.classList.contains('is-counting')) drew = true;
        performance.now() - t0 < 900 ? requestAnimationFrame(f) : res();
      })());
      return { vals: [...vals], drew };
    }, sel);
    const ok = seen.vals.length <= 2 && !seen.drew;
    if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${w} ${label.padEnd(12)} shown: ${seen.vals.join('  ->  ')}${seen.drew ? '  (underline drew)' : ''}`);
  }
  await p.close();
}
await b.close();
process.exit(fails ? 1 : 0);
