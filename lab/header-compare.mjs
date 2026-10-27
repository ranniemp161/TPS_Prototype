import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const pg of ['what-we-do', 'build-your-programme']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(pathToFileURL(process.cwd() + `/index/${pg}.html`).href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const info = await p.evaluate(() => { const n = document.querySelector('[data-nav]'); const cs = getComputedStyle(n), b = getComputedStyle(n, '::before'); const r = n.getBoundingClientRect(); return { cls: n.className, body: document.body.className, bg: cs.backgroundColor, bd: cs.borderBottom, shadow: cs.boxShadow, beforeOp: b.opacity, beforeBg: b.backgroundColor, h: r.height }; });
  console.log(pg, JSON.stringify(info));
  await p.screenshot({ path: `lab/bespoke-header/cmp-${pg}.png`, clip: { x: 0, y: 0, width: 1440, height: 220 } });
  await p.close();
}
await b.close();
