/* Gap between the visible wordmark (or mark) and the header button. node lab/header-gap.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1024, 768], [820, 1100], [430, 932], [390, 844], [375, 667], [360, 640], [320, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/programmes.html').href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1000);
  console.log(String(w).padEnd(5), await p.evaluate(() => {
    const a = document.querySelector('.tab--cta').getBoundingClientRect();
    const parts = [...document.querySelectorAll('.nav__wordmark, .nav__wordmark *, .nav__mark')].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).opacity !== '0');
    const right = Math.max(...parts.map(e => { const rg = document.createRange(); rg.selectNodeContents(e); const r = (e.tagName === 'IMG' ? e : rg).getBoundingClientRect(); return r.width ? r.right : -1; }));
    return `wordmark ends ${Math.round(right)}  button starts ${Math.round(a.left)}  gap ${Math.round(a.left - right)}px`;
  }));
  await p.close();
}
await b.close();
