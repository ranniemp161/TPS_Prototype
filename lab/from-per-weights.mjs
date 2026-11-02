// Reports the weight of every "from" and "per day" label (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
for (const [f, sels] of [['programmes.html', ['.pg-price__from', '.pg-price__per']], ['build-your-programme.html', ['.dk-fee__label', '.dk-fee__per', '.dk-card__label', '.dk-sumfee__per']]]) {
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', f)).href); await p.evaluate(() => document.fonts.ready);
  console.log(f, JSON.stringify(await p.evaluate(s => s.map(x => { const e = document.querySelector(x); const c = getComputedStyle(e); return [x, c.fontWeight, c.fontSize, c.fontFamily.split(',')[0]]; }), sels)));
}
await b.close();
