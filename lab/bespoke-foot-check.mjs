/* Build Your Programme, flowing page: at the very end, the footer's last line sits above the fixed bar. W H node lab/bespoke-foot-check.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch({ channel: 'chrome' });
for (const [W, H] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(pathToFileURL(process.cwd() + '/index/build-your-programme.html').href, { timeout: 60000 });
  await p.waitForLoadState('load'); await p.waitForTimeout(1500);
  await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(600);
  console.log(W, JSON.stringify(await p.evaluate(() => { const f = document.querySelector('footer'), bar = document.querySelector('.dk-bar').getBoundingClientRect(); const fr = f.getBoundingClientRect(); return { footerBottom: Math.round(fr.bottom), barTop: Math.round(bar.top), clear: Math.round(bar.top - fr.bottom) }; })));
  await p.close();
}
await b.close();
