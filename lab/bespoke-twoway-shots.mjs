// Restyle chat 3: shots of steps 01, 03, 04.  node lab/bespoke-twoway-shots.mjs <outdir>
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const url = pathToFileURL(process.cwd() + '/index/build-your-programme.html').href;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  try { await p.goto(url, { timeout: 45000 }); } catch { await p.goto(url, { timeout: 60000 }); }
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  const go = async i => { await p.evaluate(i => { document.querySelector('[data-deck]').scrollTo({ left: i * document.querySelector('[data-deck]').clientWidth, behavior: 'instant' }); }, i); await p.waitForTimeout(900); };
  for (const i of [1, 3, 4]) { await go(i); await p.screenshot({ path: `${out}/step0${i}-${w}.png` }); }
  await p.close();
}
await b.close();
